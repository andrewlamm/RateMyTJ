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
    var s = '{"classes":' + JSON.stringify(results) + '}'
    var json = JSON.parse(s)
    res.render('index', json)
  })
})

app.get('/:classID', function (req, res) {
  var pool = mysql.createPool({
    user: 'root',
    password: 'asdf',
    host: '127.0.0.1',
    port: '3306',
    database: 'RateMyTJ'
  })

  console.log('SELECT * FROM classes WHERE id="' + req.params.classID + '";')

  pool.query('SELECT * FROM classes WHERE id="' + req.params.classID + '";', function(error, results) {
    if (error) res.send(error);
    res.send(results)
  })
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
