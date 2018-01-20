const path = require('path')
const Ibaro = require('../lib/Ibaro')

// Instance of the class
const app = new Ibaro()

app.set('static', path.join(__dirname, 'public'))
app.set('views', path.join(__dirname, 'views'))
app.set('minify', true)

// serve favicon
app.use(Ibaro.favicon(path.join(__dirname, 'favicon')))

app.get('/', (req, res) => {
  res.render('index', {hello: 'Hello, ã!'})
})

app.get('/about', (req, res) => {
  if (req.query) {
    res.json(req.query)
    return false
  }
  res.send('<h1>Hello about</h1>', 'html')
})

app.get('/user/:id', (req, res) => {
  res.json(req.param)
})

app.get('/news/:news', (req, res) => {
  res.render(`/news/${req.param.news}`, {title: 'NEWS DINAMIC'})
})

app.get('/news', (req, res) => {
  res.json({hello: 'just a test'})
})

app.post('/message', (req, res) => {
  app.body((err, data) => {
    if (err) throw err
    res.json(data)
  })
})

app.listen(3000, () => console.log('\x1b[32m', 'RUNNING ON PORT 3000'))
