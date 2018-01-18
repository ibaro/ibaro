const path = require('path')
const Ibaro = require('../lib/Ibaro')

// Instance of the class
const app = new Ibaro()

app.listen(3000, () => console.log('\x1b[32m', 'RUNNING ON PORT 3000'))

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

app.post('/message',  (req, res) => {
  app.body((err, data) => res.json(data))
})
