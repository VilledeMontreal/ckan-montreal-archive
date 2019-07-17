module.exports = function (app) {
  console.log('montreal routes')
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
}
