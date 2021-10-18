const express = require('express')
var hbs = require('hbs')
const fs = require('fs')
const app = express()
const port = 3000

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
  var stream = fs.createReadStream('json_no_newline.txt');
  stream.setEncoding('utf8');

  stream.on('data', function(chunk){
    var json = JSON.parse(chunk)

    res.render('index', json)
  });
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
