const Ibaro = require('../lib/Ibaro')
const app = new Ibaro()

app.get('/', (req, res) => {
  res.send('<h1>Ibaro Router</h1>')
})

app.listen(3000, () => console.log('running'))
