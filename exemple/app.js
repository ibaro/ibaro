const Ibaro = require('../lib/Ibaro')
const path = require('path')

const app = new Ibaro()

app.set('static', path.join(__dirname, 'public'))
app.set('views', path.join(__dirname, 'views'))
app.set('minify', true)

app.get('/', (req, res) => {
  res.render('index', {hello: 'Hello, ã!'})
})

app.get('/some', (req, res) => {
  res.json({param: 'req.param.id'})
})

app.post('/message', (req, res) => {
  res.send('ok', 'html')
})

app.listen(3000, () => console.log('running on port 3000'))
