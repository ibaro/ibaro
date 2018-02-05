const path = require('path')
const Ibaro = require('../lib/Ibaro')

// Instance of the class
const app = new Ibaro()

Ibaro.infoDisk.pretty('/dev/sda1', (err, data) => {
  if (err) throw err

  console.log(data)
})

app.set('static', path.join(__dirname, 'public'))
app.set('views', path.join(__dirname, 'views'))
app.set('minify', true)

// serve page not found it's necessery be a middleware for now
app.use(app.notFound('404'))

// serve favicon
app.use(Ibaro.favicon(path.join(__dirname, 'favicon')))

// routes
app.get('/', (req, res) => {
  res.render('index', {hello: 'Hello, ã!'})
})

app.get('/about', (req, res) => {
  if (req.query) {
    res.json(req.query)
    return false
  }
  res.send('<h1>Hello from about</h1>', 'html')
})

app.get('/user/:id', (req, res) => {
  res.json(req.param)
})

app.get('/news/:news', (req, res) => {
  res.render(`/news/${req.param.news}`, {title: 'NEWS DINAMIC'})
})

app.get('/news', (req, res) => {
  res.send('<h1>Hello from news</h1>', 'html')
})

app.post('/message', (req, res) => {
  app.body((err, data) => {
    if (err) throw err
    res.json(data)
  })
})

// server listening
app.listen(3000, () => console.log('\x1b[32m', 'RUNNING ON PORT 3000'))
