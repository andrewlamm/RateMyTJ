const express = require('express')
var hbs = require('hbs')
var mysql = require('mysql');
const fs = require('fs')
const {spawn} = require('child_process')
const app = express()
const port = 3000

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
  const python = spawn('python', ['classes.py'])

  var stream = fs.createReadStream('json_no_newline.txt');
  stream.setEncoding('utf8');

  stream.on('data', function(chunk){
    var json = JSON.parse(chunk)

    res.render('index', json)
  });
})

app.get('/:classID', function (req, res) {
  res.send(req.params)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
