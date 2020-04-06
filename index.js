module.exports = function (app) {
  const appHome = process.cwd()
  const dms = require(`${appHome}/lib/dms`)
  const config = require(`${appHome}/config`)
  const utils = require(`${appHome}/utils`);
  const Model = new dms.DmsModel(config)
  const fs = require('fs')
  const path = require('path')
  const fetch = require('node-fetch')
  const moment = require('moment');
  const cmsPosts = require('./cms-posts');
  const ActivityFeed = require('./activity-api');
  const proxy = require('express-http-proxy');

  const configApiUrl = config.get("API_URL")

  // set a cookie defaultLocale value for Moment
  app.use(function (req, res, next) {	
    if (req.cookies.defaultLocale !== undefined) {
      let locale = req.cookies.defaultLocale || 'fr';
      res.cookie('defaultLocale', locale, {path: '/'})
      moment.locale(locale)
    }
    next()
  })

  app.use((req, res, next) => {
    let configApiUrl = config.get("API_URL")

    res.locals.territoires = {
      "AHU": "Ahuntsic-Cartierville",
      "agglomeration": "Agglomération",
      "ANJ": "Anjou",
      "CDN": "Côte-des-Neiges–Notre-Dame-de-Grâce",
      "LAC": "Lachine",
      "LAS": "LaSalle",
      "PLA": "Le Plateau-Mont-Royal",
      "LSO": "Le Sud-Ouest",
      "IBI": "L’Île-Bizard–Sainte-Geneviève",
      "MHM": "Mercier–Hochelaga-Maisonneuve",
      "montreal": "Montréal",
      "MTN": "Montréal-Nord",
      "OUT": "Outremont",
      "PRF": "Pierrefonds-Roxboro",
      "RDP": "Rivière-des-Prairies–Pointe-aux-Trembles",
      "RPP": "Rosemont–La Petite-Patrie",
      "VSL": "Saint-Laurent",
      "STL": "Saint-Léonard",
      "VER": "Verdun",
      "VIM": "Ville-Marie",
      "VSE": "Villeray–Saint-Michel–Parc-Extension"
    }

    res.locals.explorerFormats = ["geojson", "csv", "tsv", "xls", "xlsx", "pdf"]

    next();
  });

  // Proxy requests getting at the endpoint to https://montreal.l3.ckan.io
  app.use(/(.*)\/(.*)\.rdf/, proxy(config.get('API_URL'), {
      filter: (req, res) => {
        return req.method === 'GET';
      },
      proxyReqPathResolver: (req, res, next) => {
        const requestUrl = req.url;
        const datasetId = req.params[1];

        if (datasetId){
          // added /dataset because the proxy library expects only host name and truncates the remaining part.
          return `/dataset/${datasetId}.rdf`
        }

        next()
      }
    })
  ) 

  // Remove this when Login page is no needed anymore
  app.get('/login', (req, res) => {
    res.render('home.html', {
      title: 'Login'
    })
  })

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

  // Change '/home' to '/', delete home.html and rename homereal.html to home.html
  // when Login page is not needed anymore
  app.get('/home', async (req, res) => {
    const collections = await Model.getCollections()
    const recentData  = await Model.search({ q: '' })
    const threeRecentData  = recentData.results.filter((packages,index)=> index < 3 ).map((packages,index)=>{
      packages.metadata_modified = moment.utc(packages.metadata_modified ).format('ll')
      return packages
    });

    const postsModel = new cmsPosts.CmsModel();
    const size = 3;
    let posts = await postsModel.getListOfPosts(size);
    posts = posts.slice(0, 3)
    posts = posts.map(posts => {
      return {
        slug: posts.name,
        title: posts.title,
        content: posts.content.replace(/<\/?[^>]+(>|$)/g, ""),
        published: moment(posts.publish_date).format('MMMM DD, YYYY'),
        modified: moment(posts.publish_date).format('MMMM DD, YYYY'),
        image: posts.image
      }
    });

    // Links from 'https://montreal.l3.ckan.io/pages/frontpage-calls-to-action'
    // for Home page quick search buttons
    const searchTagSlug = 'frontpage-calls-to-action'
    let quickSearchPost = await postsModel.getPost(searchTagSlug)
    let content = quickSearchPost.content
    let quickLinks = []
    content.replace(/[^<]*(<a href="([^"]+)">([^<]+)<\/a>)/g, function () {
      quickLinks.push(Array.prototype.slice.call(arguments, 1, 4))
    });
      
    res.render('homereal.html', {
      title: 'Montreal',
      collections,
      recentData: threeRecentData,
      slug: 'collections',
      posts,
      quickLinks
    })
  })

  app.get('/tx', (req, res) => {
    res.send(res.__('Complete'))
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

  app.get('/applications', async (req, res, next) => {
    try {
      req.query.fq = 'dataset_type:showcase'
      const showcases = await Model.search(req.query)

      // Pagination
      const from = req.query.from || 0
      const size = req.query.size || 10
      const total = showcases.count
      const totalPages = Math.ceil(total / size)
      const currentPage = parseInt(from, 10) / size + 1
      const pages = utils.pagination(currentPage, totalPages)

      res.render('application-showcases.html',{
        title: 'Applications',
        description: 'Showcases are any app, article or report that relate to the published dataset. For example, an annual report that contains aggregated information relating to the dataset or a website where there is further background information on the dataset or a link to an app that has been created utilising some or all of the dataset.',
        slug: 'Applications',
        showcases,
        descriptions: showcases.notes,
        query: req.query,
        totalPages,
        pages,
        currentPage
      })
    } catch(e) {
      next(e)
     }
  })

  app.get('/:owner/:name', async (req, res, next) => {
    if(req.params.owner !== "organization" && req.params.owner !== "collections"){
      const ActivityModel = new ActivityFeed.ActivityModel();
      let activityLimit = 5;
      if(req.query.activity){
        activityLimit = req.query.activity
      }
      let activities = await ActivityModel.getPackageActivity(req.params.name,activityLimit);
      res.locals.activities = {
        feed : activities,
        limit: activityLimit
      }
    }
    next()
  })

  app.get('/:owner/:name', async (req, res, next) => {
    if(req.params.owner === "collections"){
      const ActivityModel = new ActivityFeed.ActivityModel();
      let activityLimit = 5;
      if(req.query.activity){
        activityLimit = req.query.activity
      }
      let activities = await ActivityModel.getCollectionActivity(req.params.name,activityLimit);
      res.locals.activities = {
        feed : activities,
        limit: activityLimit
      }
    }
    next()
  })
  
  app.get('/applications/single/:showcaseId', async (req, res, next) => {
    try {
      const id = req.params.showcaseId
      const apiUrl = configApiUrl + 'ckanext_showcase_show'
  
      // retrieving showcase
      let showcaseResponse = await fetch(apiUrl, {
        method: 'POST',
        body: JSON.stringify({
          id: id
        }),
        headers: { 'Content-Type': 'application/json' }
      })
  
      if (showcaseResponse.status !== 200) {
        throw showcaseResponse
      }
  
      let showcase = await showcaseResponse.json()
  
      // retrieving datasets
      let datasetsResponse = await fetch(configApiUrl + 'ckanext_showcase_package_list', {
        method: 'POST',
        body: JSON.stringify({
          showcase_id: id
        }),
        headers: { 'Content-Type': 'application/json' }
      })
  
      if (datasetsResponse.status !== 200) {
        throw datasetsResponse
      }
  
      let datasets = await datasetsResponse.json()
        res.render('application-showcase.html', {
        title: 'Applications',
        showcase: showcase.result,
        datasets: datasets.result
      })
    } catch(e) {
      next(e)
    }
  })

  app.get('/our-approach-fr', async (req, res) => {
    const postsModel = new cmsPosts.CmsModel();
    let post = await postsModel.getPost("demarche");

    res.render('post.html', {
      slug: post.slug,
      title: post.title,
      content: post.content,
      published: moment(post.date).format('Do MMMM YYYY'),
      modified: moment(post.modified).format('Do MMMM YYYY'),
      image: post.featured_image,
      thisPageFullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
      categories: post.categories ? Object.keys(post.categories) : []
    });
  })

  app.get('/contact-us-fr', async (req, res) => {
    const postsModel = new cmsPosts.CmsModel();
    let post = await postsModel.getPost("nous-joindre");

    res.render('post.html', {
      slug: post.slug,
      title: post.title,
      content: post.content,
      published: moment(post.date).format('Do MMMM YYYY'),
      modified: moment(post.modified).format('Do MMMM YYYY'),
      image: post.featured_image,
      thisPageFullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
      categories: post.categories ? Object.keys(post.categories) : [],
      displayContactForm: "true"
    });
  })

  app.get('/license-fr', async (req, res) => {
    const postsModel = new cmsPosts.CmsModel();
    let post = await postsModel.getPost("licence-d-utilisation");

    res.render('post.html', {
      slug: post.slug,
      title: post.title,
      content: post.content,
      published: moment(post.date).format('Do MMMM YYYY'),
      modified: moment(post.modified).format('Do MMMM YYYY'),
      image: post.featured_image,
      thisPageFullUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
      categories: post.categories ? Object.keys(post.categories) : []
    });
  })
}
