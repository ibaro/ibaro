const Ibaro = require('../lib/Ibaro')
const path = require('path')

const app = new Ibaro()

app.set('static', path.join(__dirname, 'public'))
app.set('views', path.join(__dirname, 'views'))
app.set('minify', true)

app.get('/', (req, res) => {
  res.render('index', {hello: 'Hello, ã!'})
})

app.get('/news/:news', (req, res) => {
  console.log(req.param.news)
  res.render(`/news/${req.param.news}`, {title: 'NEWS DINAMIC'})
})

app.post('/message', (req, res) => {
  let body = []
  let querystring = require('querystring')

  req.on('data', chunk => {
  	body.push(chunk)
    body = querystring.parse(decodeURIComponent(Buffer.concat(body).toString()))
  })

  req.on('end', _ => {
  	console.log(req.headers)
  	res.redirect('/')
  })
})

app.listen(3000, () => console.log('running on port 3000'))
