const Ibaro = require('../lib/Ibaro')
const app = new Ibaro()

app.use((req, res, next) => {
  console.log('some think')
  next()
})

app.use((req, res, next) => {
  console.log('some think Two')
  next()
})

app.get('/', (req, res) => {
  res
    .status(200)
    .send('<h1>Ibaro Router</h1>')
})

app.listen(3000, () => console.log('running on port 3000'))
