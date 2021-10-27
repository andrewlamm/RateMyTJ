const express = require('express')
var hbs = require('hbs')
var mysql = require('mysql');
const app = express()
const port = 3000

app.set('view engine', 'hbs')

app.get('/', (req, res) => {
  var pool = mysql.createPool({
    user: 'root',
    password: 'asdf',
    host: '127.0.0.1',
    port: '3306',
    database: 'RateMyTJ'
  })

  pool.query("SELECT * FROM classes;", function(error, results) {
    var json = JSON.parse('{"classes":' + JSON.stringify(results) + '}')
    res.render('index', json)
  })
})

app.get('/class/:classID', function (req, res) {
  var pool = mysql.createPool({
    user: 'root',
    password: 'asdf',
    host: '127.0.0.1',
    port: '3306',
    database: 'RateMyTJ'
  })

  console.log('SELECT * FROM classes WHERE id="' + req.params.classID + '";')

  pool.query('SELECT * FROM classes WHERE id="' + req.params.classID + '";', function(error, results) {
    if (error) res.render('error');
    if (results.length != 1) {
      res.render('error')
    }
    else {
      var s = JSON.stringify(results)
      var json = JSON.parse(s.substring(1, s.length-1))
      res.render('classes', json)
    }
  })
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
