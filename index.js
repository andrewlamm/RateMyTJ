const express = require('express')
var hbs = require('hbs')
var mysql = require('mysql');
const app = express()
const port = 3000

app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/views'));

hbs.registerPartials(__dirname + '/views/partials')

hbs.registerHelper('fix_number', function(num) {
  return num.toFixed(2);
});

hbs.registerHelper('checkEmpty', function(s, options) {
  if (s === "") {
    return;
  }
  else {
    return options.fn(this)
  }
});

hbs.registerHelper('turn_to_ordinal', function(num) {
  var ones = num % 10
  var tens = num % 100
  if (ones == 1 && tens != 11) {
    return num + "st";
  }
  if (ones == 2 && tens != 12) {
      return num + "nd";
  }
  if (ones == 3 && tens != 13) {
      return num + "rd";
  }
  return num + "th";
})

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

  // console.log('SELECT * FROM classes WHERE id="' + req.params.classID + '";')

  pool.query('SELECT * FROM classes WHERE id="' + req.params.classID + '";', function(error, results) {
    if (error) res.render('error');
    try {
      if (results.length != 1) {
        res.render('error')
      }
      else {
        pool.query('SELECT name, RANK() OVER (ORDER BY class_score desc) ranking FROM classes WHERE class_score >= ' + results[0].class_score + ' ORDER BY ranking', function(e,r) {
          // console.log(r.length)
          results[0]['class_score_rank'] = r.length
          pool.query('SELECT name, RANK() OVER (ORDER BY workload) ranking FROM classes WHERE workload <= ' + results[0].workload + ' ORDER BY ranking', function(e,r) {
            // console.log(r.length) add helper maybe?
            results[0]['workload_rank'] = r.length
            pool.query('SELECT * FROM classes', function(e,r) {
              results[0]['num_classes'] = r.length
              console.log(results[0])
              res.render('classes', results[0])
            })
          })
        })
      }
    } catch (error) {
      console.log(error)
      res.render('error')
    }

  })
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
