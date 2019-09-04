module.exports = function (app) {
  const appHome = process.cwd()
  const dms = require(`${appHome}/lib/dms`)
  const config = require(`${appHome}/config`)
  const Model = new dms.DmsModel(config)
  const fs = require('fs')
  const path = require('path')
  const fetch = require('node-fetch')
  const  moment = require('moment');

	// set a cookie with default locale = fr
	app.use(function (req, res, next) {
		let locale = req.cookies && req.cookies.defaultLocale || 'fr'
		if (locale) res.setLocale(locale)
    next()
	})
 
  app.use((req, res, next) => {
    let configApiUrl = config.get("API_URL")
    let disqusPages = "," + config.get('DISQUS_PAGES') + ","
    let currentUrl = "," + req.url + ","

    res.locals.disqusEnabled = disqusPages.includes(currentUrl)
    res.locals.PAGE_URL =
    res.locals.PAGE_IDENTIFIER = req.url

    next();
  });

  app.get('/dash', (req, res) => {
    const dashPage = fs.readFileSync(path.resolve(__dirname, './public/dash/index.html'))
    res.render('dash.html', {
      title: 'Dashboard',
      content: {dash: dashPage}
    })
  })

  app.get('/data-explorer', (req, res) => {
    let explorer = {}
    try {
      console.log(req.query.explorer)
      console.log('==============================')
      explorer = JSON.parse(req.query.explorer)
      explorer.datapackage = JSON.stringify(explorer.datapackage)
      explorer = JSON.stringify(explorer)
      console.log('EXPLORER', explorer)
    } catch (e) {
      console.warn(e)
    }
    res.render('data-explorer.html', {
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

    res.render('home.html', {
      title: 'Montreal',
      collections,
      recentData: fiveRecentData,
      slug: 'collections',
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
}
