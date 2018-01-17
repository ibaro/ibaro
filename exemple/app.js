const Ibaro = require('../lib/Ibaro')
const path = require('path')

const app = new Ibaro()

app.set('static', path.join(__dirname, 'public'))
app.set('views', path.join(__dirname, 'views'))
app.set('minify', true)

app.use((req, res, next) => {
  console.log('oi de tudo')
  next()
})

function mid (req, res) {
  console.log('ois')
}

app.get('/', mid, (req, res) => {
  res.render('index', {hello: 'Hello, ã!'})
})

app.get('/news/:news', (req, res) => {
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

app.listen(3000, () => console.log('\x1b[32m', 'RUNNING ON PORT 3000'))
