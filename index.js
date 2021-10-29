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

var pool = mysql.createPool({
  user: 'root',
  password: 'asdf',
  host: '127.0.0.1',
  port: '3306',
  database: 'RateMyTJ'
})

function get_class_info(req, res, next) {
  pool.query('SELECT * FROM classes WHERE id="' + req.params.classID + '";', function(error, results) {
    if (error) res.render('error');
    try {
      if (results.length != 1) {
        res.render('error')
      }
      else {
        res.locals.results = results[0]
        next()
      }
    } catch (error) {
      console.log(error)
      res.render('error')
    }
  })
}

function get_score_rank(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY class_score desc) ranking FROM classes WHERE class_score >= ' + res.locals.results.class_score + ' ORDER BY ranking', function(e,r) {
    res.locals.results.class_score_rank = r.length
    next()
  })
}

function get_workload_rank(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY workload) ranking FROM classes WHERE workload <= ' + res.locals.results.workload + ' ORDER BY ranking', function(e,r) {
    res.locals.results.workload_rank = r.length
    next()
  })
}

function get_total_classes(req, res, next) {
  pool.query('SELECT * FROM classes', function(e,r) {
    res.locals.results.num_classes = r.length
    next()
  })
}

app.get('/', (req, res) => {
  pool.query("SELECT * FROM classes;", function(error, results) {
    var json = JSON.parse('{"classes":' + JSON.stringify(results) + '}')
    res.render('index', json)
  })
})

app.get('/class/:classID', [get_class_info, get_score_rank, get_workload_rank, get_total_classes], function (req, res) {
  // console.log('SELECT * FROM classes WHERE id="' + req.params.classID + '";')
  // console.log(res.locals.results)
  res.render('classes', res.locals.results)
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
