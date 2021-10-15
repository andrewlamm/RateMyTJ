const express = require('express')
var hbs = require('hbs')
const app = express()
const port = 3000

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
  res.render('index')
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
