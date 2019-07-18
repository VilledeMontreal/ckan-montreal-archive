module.exports = function (app) {
  const appHome = process.cwd()
  console.log('MONTREAL routes', appHome)
  const dms = require(`${appHome}/lib/dms`)
  const config = require(`${appHome}/config`)
  const Model = new dms.DmsModel(config)
  

  app.get('/dash', (req, res) => {
    console.log('RPOUIT DASH')
    const fs = require('fs')
    const path = require('path')
    const dashPage = fs.readFileSync(path.resolve(__dirname, './public/dash/index.html'))
    res.render('dash.html', {
      title: 'Dashboard',
      content: {dash: dashPage}
    })
  })
  
  app.get('/', async (req, res) => {
    const collections = await Model.getCollections()
    res.render('home.html', {
      title: 'Montreal',
      collections,
      slug: 'collections',
    })
  })
}
