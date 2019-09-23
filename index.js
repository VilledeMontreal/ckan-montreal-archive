module.exports = function (app) {
  const appHome = process.cwd()
  const { URL } = require('url')
  const dms = require(`${appHome}/lib/dms`)
  const utils = require(`${appHome}/utils`)
  const config = require(`${appHome}/config`)
  const Model = new dms.DmsModel(config)
  const fs = require('fs')
  const path = require('path')
  const fetch = require('node-fetch')
  const moment = require('moment');
  const cmsPosts = require('./cms-posts');

	// set a cookie with default locale = fr
	app.use(function (req, res, next) {
		let locale = req.cookies && req.cookies.defaultLocale || 'fr'
		if (locale) res.setLocale(locale)
    next()
	})
 
  app.use((req, res, next) => {
    let configApiUrl = config.get("API_URL")
    let disqusPages = config.get('DISQUS_PAGES').split(' ')
    let currentUrl = req.url

    res.locals.disqusEnabled = disqusPages.reduce((acc, cur) => {
      if (acc === true) return true // any match will do
      return RegExp(cur).test(currentUrl)
    }, false)

    next();
  });

  app.get('/dash', (req, res) => {
    const dashPage = fs.readFileSync(path.resolve(__dirname, './public/dash/index.html'))
    res.render('dash.html', {
      title: 'Dashboard',
      content: {dash: dashPage}
    })
  })

  // renders bare for iframe -- no header, footer, etc
  app.get('/data-explorer', (req, res) => {
    let explorer = {}
    
    try {
      explorer = JSON.parse(req.query.explorer)
      explorer.datapackage = JSON.stringify(explorer.datapackage)
      explorer = JSON.stringify(explorer).replace(/'/g, "&#x27;")
    } catch (e) {
      console.warn(e)
    }

    res.render('data-explorer.html', {
      explorer
    })
  })
  
  // renders in-page for share link (header, footer, etc, are present)
  app.get('/explorer', (req, res) => {
    let explorer = {}
    try {
      explorer = JSON.parse(req.query.explorer)
      explorer.datapackage = JSON.stringify(explorer.datapackage)
      explorer = JSON.stringify(explorer).replace(/'/g, "&#x27;")
    } catch (e) {
      console.warn(e)
    }

    res.render('explorer.html', {
      explorer
    })
  
  })

  app.get('/dashboard/:name', async (req, res) => {
    const base = config.get('GITHUB_BASEURL')
    const username = config.get('GITHUB_USERNAME')
    const prefix = config.get('DASH_PREFIX')
    const url = `${base}/${username}/${prefix}_${req.params.name}/master/dashboard.json`
    const response = await fetch(url)
    const data = await response.text()
    res.render('dashboard.html', {
      title: req.params.name,
      dashData: data
    })
  })

  app.get('/', async (req, res) => {
    const collections = await Model.getCollections()
    const recentData  = await Model.search({ q: '' })
    const fiveRecentData  = recentData.results.filter((packages,index)=> index < 5 ).map((packages,index)=>{
      packages.metadata_modified = moment.utc(packages.metadata_modified ).format('ll')
      return packages
    });

    const postsModel = new cmsPosts.CmsModel();
    const size = 3;
    let posts = await postsModel.getListOfPosts(size);
    posts = posts.map(posts => {
      return {
        slug: posts.name,
        title: posts.title,
        content: posts.content,
        published: moment(posts.date).format('MMMM Do, YYYY'),
        modified: moment(posts.modified).format('MMMM Do, YYYY'),
        image: posts.featured_image
      }
    });

    res.render('home.html', {
      title: 'Montreal',
      collections,
      recentData: fiveRecentData,
      slug: 'collections',
      posts,
    })
  })

  app.get('/tx', (req, res) => {
    res.send(res.__('Complete'))
  })

  app.get('/:owner/:name', async (req, res, next) => {
    let datapackage = null

    try {
      datapackage = await Model.getPackage(req.params.name)
    } catch (err) {
      next(err)
      return
    }

    // Since "datapackage-views-js" library renders views according to
    // descriptor's "views" property, we need to generate view objects:
    datapackage.views = datapackage.views || []

    // Data Explorer used a slightly different spec
    datapackage.dataExplorers= []

    // Create a visualization per resource as needed
    datapackage.resources.forEach((resource, index) => {
      resource.format = resource.format.toLowerCase()
      // Handle datastore_active resources, e.g., 'path' property might point to
      // some filestore (eg S3) but it is also stored in the datastore so we can
      // query first N rows instead of trying to read entire file:
      resource.downloadPath = resource.path
      if (resource.datastore_active) {
        resource.downloadPath = resource.path
        resource.path = config.get('API_URL') + 'datastore_search?resource_id=' + resource.id
      }
      // Use proxy path if datastore/filestore proxies are given:
      try {
        const resourceUrl = new URL(resource.path)
        if (resourceUrl.host === config.get('PROXY_DATASTORE') && resource.format !== 'pdf') {
          resource.path = '//' + req.get('host') + '/proxy/datastore' + resourceUrl.pathname + resourceUrl.search
        }
        if (resourceUrl.host === config.get('PROXY_FILESTORE') && resource.format !== 'pdf') {
          resource.path = '//' + req.get('host') + '/proxy/filestore' + resourceUrl.pathname + resourceUrl.search
        }
      } catch (e) {
        console.warn(e)
        
      }
      // Convert bytes into human-readable format:
      resource.size = resource.size ? bytes(resource.size, {decimalPlaces: 0}) : resource.size

      let controls = {
        showChartBuilder: false,
        showMapBuilder: false
      }

      const view = {
        id: index,
        title: resource.title || resource.name,
        resources: [
           resource.name
        ],
        specType: null
      }

      // Add 'table' views for each tabular resource:
      const tabularFormats = ['csv', 'tsv', 'dsv', 'xls', 'xlsx']
      let chartView, tabularMapView

      if (tabularFormats.includes(resource.format)) {
        // Default table view
        view.specType = 'table'
        // DataExplorer specific view to render a chart from tabular data
        chartView = Object.assign({}, view)
        chartView.specType = 'simple'
        // DataExplorer specific view to render a map from tabular data
        tabularMapView = Object.assign({}, view)
        tabularMapView.specType = 'tabularmap'
      } else if (resource.format.includes('json')) {
        // Add 'map' views for each geo resource:
        view.specType = 'map'
      } else if (resource.format === 'pdf') {
        view.specType = 'document'
      }

      
      // Determine when to show chart builder
      const chartBuilderFormats = ['csv', 'tsv']
      
      if (chartBuilderFormats.includes(resource.format)) controls = { showChartBuilder: true, showMapBuilder: true }

      const views =  (tabularMapView) ? [view, chartView, tabularMapView] : [view]
      const dataExplorer = JSON.stringify({datapackage: {resources: [resource], views, controls}}).replace(/'/g, "&#x27;")
      
      // Add Data Explorer item per resource
      datapackage.dataExplorers.push(dataExplorer)
      datapackage.views.push(view)
    })

    if(datapackage.methodologie){
      datapackage.methodologie = utils.processMarkdown.render(datapackage.methodologie);
    }
    
    try {
      const profile = await Model.getProfile(req.params.owner)
      res.render('showcase.html', {
        title: req.params.owner + ' | ' + req.params.name,
        dataset: datapackage,
        owner: {
          name: profile.name,
          title: profile.title,
          description: utils.processMarkdown.render(profile.description),
          avatar: profile.image_display_url || profile.image_url
        },
        thisPageFullUrl: '//' + req.get('host') + req.originalUrl,
        dpId: JSON.stringify(datapackage).replace(/'/g, "&#x27;") // keep for backwards compat?
      })
    } catch (err) {
      next(err)
      return
    }
  })

  app.get('/news/subscription', async (req, res) => {
    const recentData = await Model.search({q: ''});
    const fiveRecentData = recentData.results.filter(
      (packages, index) => index < 5).map((packages, index) => {
      packages.metadata_modified = moment.utc(packages.metadata_modified).
        format('ll');
      return packages;
    });
    res.render('subscription.html', {
      recentData: fiveRecentData,
    });
  });
}
