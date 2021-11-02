const express = require('express')
var hbs = require('hbs')
var mysql = require('mysql');
const app = express()
const port = 3000

app.set('view engine', 'hbs')
app.use(express.static(__dirname + '/views'));

hbs.registerPartials(__dirname + '/views/partials')

hbs.registerHelper('fix_number', function(num) {
  if (num === undefined) return "";
  if (num == null) return "";
  return num.toFixed(2);
});

hbs.registerHelper('random_number', function(num) {
  return Math.floor(Math.random() * 10000)
});

hbs.registerHelper('format_date', function(d) {
  var s = d.toString()
  return s.substring(s.search(" ")+1, s.search("GMT")-1)
});

hbs.registerHelper('check_empty', function(s, options) {
  if (s === "") {
    return;
  }
  else {
    return options.fn(this)
  }
});

hbs.registerHelper('empty_feedback', function(feedback, options) {
  if (feedback.length == 0) {
    return options.fn(this)
  }
})

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
  console.log('SELECT * FROM classes WHERE id="' + req.params.classID + '";')
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
    res.locals.results.class_score_rank = r[r.length-1].ranking
    next()
  })
}

function get_workload_rank(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY workload) ranking FROM classes WHERE workload <= ' + res.locals.results.workload + ' ORDER BY ranking', function(e,r) {
    res.locals.results.workload_rank = r[r.length-1].ranking
    next()
  })
}

function get_total_classes(req, res, next) {
  pool.query('SELECT * FROM classes', function(e,r) {
    res.locals.results.num_classes = r.length
    next()
  })
}

function score_category(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY class_score desc) ranking FROM classes WHERE class_score >= ' + res.locals.results.class_score + ' AND category="' + res.locals.results.category + '" ORDER BY ranking', function(e,r) {
    res.locals.results.class_score_category_rank = r[r.length-1].ranking
    next()
  })
}

function workload_category(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY workload) ranking FROM classes WHERE workload <= ' + res.locals.results.workload + ' AND category="' + res.locals.results.category + '" ORDER BY ranking', function(e,r) {
    res.locals.results.workload_category_rank = r[r.length-1].ranking
    next()
  })
}

function num_category(req, res, next) {
  pool.query('SELECT * FROM classes WHERE category="' + res.locals.results.category + '";', function(e,r) {
    res.locals.results.num_category = r.length
    next()
  })
}

function avg_terms(req, res, next) {
  pool.query('SELECT term, AVG(class_score) AS avg_score, AVG(workload) AS avg_workload, AVG(difficulty) AS avg_difficulty, AVG(enjoyment) AS avg_enjoyment, AVG(teacher_score) AS avg_teacher_score, AVG(grade) AS avg_grade, COUNT(*) AS total FROM class_' + res.locals.results.id + ' GROUP BY term;', function(e,r) {
    res.locals.term_to_index = {}
    for (var i = 0; i < r.length; i++) {
      res.locals.term_to_index[r[i].term] = i
    }
    res.locals.term_stats = r
    next()
  })
}

function grade_num(req, res, next) {
  pool.query('SELECT term, COUNT(*) AS total FROM class_' + res.locals.results.id + ' GROUP BY term;', function(e,r) {
    var total = 0
    for (var i = 0; i < r.length; i++) {
      res.locals.term_stats[res.locals.term_to_index[r[i].term]].grade_total = r[i].total
      total += r[i].total
    }
    res.locals.term_stats[res.locals.term_stats.length-1].grade_total = total
    next()
  })
}

function get_feedback(req, res, next) {
  pool.query('SELECT * FROM class_' + res.locals.results.id + ' WHERE NOT (feedback="");', function(e,r) {
    res.locals.feedback = r
    next()
  })
}

function median_score(req, res, next) {
  pool.query('SELECT term, class_score, ROW_NUMBER() OVER(PARTITION BY term ORDER BY class_score DESC) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    // console.log(res.locals.term_to_index)
    var curr_ind = 0
    while (curr_ind < r.length) {
      var curr_term = r[curr_ind].term
      var total_nums = res.locals.term_stats[res.locals.term_to_index[curr_term]].total

      if (total_nums % 2 == 0) {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_score = (r[curr_ind + Math.floor(total_nums/2)].class_score + r[(curr_ind + Math.floor(total_nums/2))-1].class_score) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_score = r[curr_ind + Math.floor(total_nums/2)].class_score
      }

      curr_ind += total_nums
    }
    next()
  })
}

function avg_overall(req, res, next) {
  pool.query('SELECT term, AVG(class_score) AS avg_score, AVG(workload) AS avg_workload, AVG(difficulty) AS avg_difficulty, AVG(enjoyment) AS avg_enjoyment, AVG(teacher_score) AS avg_teacher_score, AVG(grade) AS avg_grade, COUNT(*) AS total FROM class_' + res.locals.results.id + ';', function(e,r) {
    var add = r[0]
    add.term = "Overall"
    res.locals.term_stats.push(add)
    next()
  })
}

function median_overall_score(req, res, next) {
  pool.query('SELECT term, class_score, ROW_NUMBER() OVER(ORDER BY class_score DESC) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    if (r.length > 0) {
      if (r.length % 2 == 0) {
        res.locals.term_stats[res.locals.term_stats.length-1].med_score = (r[Math.floor(r.length/2)].class_score + r[Math.floor(r.length/2)-1].class_score) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_stats.length-1].med_score = r[Math.floor(r.length/2)].class_score
      }
    }
    next()
  })
}

function median_overall_workload(req, res, next) {
  pool.query('SELECT term, workload, ROW_NUMBER() OVER(ORDER BY workload) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    if (r.length > 0) {
      if (r.length % 2 == 0) {
        res.locals.term_stats[res.locals.term_stats.length-1].med_workload = (r[Math.floor(r.length/2)].workload + r[Math.floor(r.length/2)-1].workload) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_stats.length-1].med_workload = r[Math.floor(r.length/2)].workload
      }
    }
    next()
  })
}

function median_workload(req, res, next) {
  pool.query('SELECT term, workload, ROW_NUMBER() OVER(PARTITION BY term ORDER BY workload) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    var curr_ind = 0
    while (curr_ind < r.length) {
      var curr_term = r[curr_ind].term
      var total_nums = res.locals.term_stats[res.locals.term_to_index[curr_term]].total

      if (total_nums % 2 == 0) {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_workload = (r[curr_ind + Math.floor(total_nums/2)].workload + r[(curr_ind + Math.floor(total_nums/2))-1].workload) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_workload = r[curr_ind + Math.floor(total_nums/2)].workload
      }

      curr_ind += total_nums
    }
    next()
  })
}

// SELECT teacher, term, class_score, ROW_NUMBER() OVER(PARTITION BY teacher,term ORDER BY class_score) AS row_term, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY term) AS row_teacher FROM class_2340T1;
function teacher_class_score(req, res, next) {
  pool.query('SELECT teacher, term, class_score, ROW_NUMBER() OVER(PARTITION BY teacher,term ORDER BY class_score) AS row_term, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY term) AS row_teacher FROM class_' + res.locals.results.id, function(e, r) {
    if (r.length > 0) {
      res.locals.teacher_to_index = {}
      var curr_index = 0
      var curr_teacher = r[0].teacher
      var curr_len = 0
      var dict_index = 0
      res.locals.term_teacher_to_index = {}
      res.locals.term_teacher_to_index[curr_teacher] = {}

      var curr_term = r[0].term
      var curr_term_len = 0
      var curr_term_index = 0
      var term_index = 0

      res.locals.teachers = [{"name": curr_teacher, "terms": []}]
      for (var i = 0; i < r.length; i++) {
        if (!(curr_term === r[i].term && curr_teacher === r[i].teacher)) {
          res.locals.term_teacher_to_index[curr_teacher][curr_term] = term_index
          if (curr_term_len % 2 == 0) {
            res.locals.teachers[dict_index].terms.push({"term": curr_term, "total": curr_term_len, "class_score": (r[curr_term_index + Math.floor(curr_term_len/2)].class_score + r[curr_term_index + Math.floor(curr_term_len/2)-1].class_score) / 2})
          }
          else {
            res.locals.teachers[dict_index].terms.push({"term": curr_term, "total": curr_term_len, "class_score": r[curr_term_index + Math.floor(curr_term_len/2)].class_score})
          }

          curr_term_len = 0
          curr_term_index = i
          curr_term = r[i].term
          term_index += 1
        }
        if (!(curr_teacher === r[i].teacher)) {
          res.locals.teacher_to_index[curr_teacher] = dict_index

          curr_len = 0
          curr_index = i
          dict_index += 1
          curr_teacher = r[i].teacher
          res.locals.teachers.push({"name": curr_teacher, "terms": []})
          res.locals.term_teacher_to_index[curr_teacher] = {}
          term_index = 0
        }
        curr_len += 1
        curr_term_len += 1
      }
      res.locals.teacher_to_index[curr_teacher] = dict_index
      res.locals.term_teacher_to_index[curr_teacher][curr_term] = term_index
      if (curr_term_len % 2 == 0) {
        res.locals.teachers[dict_index].terms.push({"term": curr_term, "total": curr_term_len, "class_score": (r[curr_term_index + Math.floor(curr_term_len/2)].class_score + r[curr_term_index + Math.floor(curr_term_len/2)-1].class_score) / 2})
      }
      else {
        res.locals.teachers[dict_index].terms.push({"term": curr_term, "total": curr_term_len, "class_score": r[curr_term_index + Math.floor(curr_term_len/2)].class_score})
      }
    }
    next()
  })
}

function overall_teacher_score(req, res, next) {
  pool.query('SELECT teacher, term, class_score, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY class_score) AS row_term FROM class_' + res.locals.results.id + ';', function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[curr_index].teacher
      while (curr_index < r.length) {
        curr_teacher = r[curr_index].teacher
        var total = 0
        for (var i = 0; i < res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length; i++) {
          total += res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[i].total
        }

        if (total % 2 == 0) {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.push({"term": "Overall", "total": total, "class_score": (r[curr_index + Math.floor(total/2)].class_score + r[curr_index + Math.floor(total/2)-1].class_score) / 2})
        }
        else {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.push({"term": "Overall", "total": total, "class_score": r[curr_index + Math.floor(total/2)].class_score})
        }

        curr_index += total
      }
    }
    next()
  })
}

function teacher_workload(req, res, next) {
  pool.query('SELECT teacher, term, workload, ROW_NUMBER() OVER(PARTITION BY teacher,term ORDER BY workload) AS row_term, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY term) AS row_teacher FROM class_' + res.locals.results.id, function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[0].teacher
      var curr_len = 0

      var curr_term = r[0].term
      var curr_term_len = 0
      var curr_term_index = 0

      for (var i = 0; i < r.length; i++) {
        if (!(curr_term === r[i].term && curr_teacher === r[i].teacher)) {
          if (curr_term_len % 2 == 0) {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].workload = (r[curr_term_index + Math.floor(curr_term_len/2)].workload + r[curr_term_index + Math.floor(curr_term_len/2)-1].workload) / 2
          }
          else {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].workload = r[curr_term_index + Math.floor(curr_term_len/2)].workload
          }

          curr_term_len = 0
          curr_term_index = i
          curr_term = r[i].term
        }
        if (!(curr_teacher === r[i].teacher)) {
          curr_len = 0
          curr_index = i
          curr_teacher = r[i].teacher
        }
        curr_len += 1
        curr_term_len += 1
      }
      if (curr_term_len % 2 == 0) {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].workload = (r[curr_term_index + Math.floor(curr_term_len/2)].workload + r[curr_term_index + Math.floor(curr_term_len/2)-1].workload) / 2
      }
      else {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].workload = r[curr_term_index + Math.floor(curr_term_len/2)].workload
      }
    }
    next()
  })
}

function overall_teacher_workload(req, res, next) {
  pool.query('SELECT teacher, term, workload, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY workload) AS row_term FROM class_' + res.locals.results.id + ';', function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[curr_index].teacher
      while (curr_index < r.length) {
        curr_teacher = r[curr_index].teacher
        var total = 0
        for (var i = 0; i < res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1; i++) {
          total += res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[i].total
        }

        if (total % 2 == 0) {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].workload = (r[curr_index + Math.floor(total/2)].workload + r[curr_index + Math.floor(total/2)-1].workload) / 2
        }
        else {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].workload = r[curr_index + Math.floor(total/2)].workload
        }

        curr_index += total
      }
    }
    next()
  })
}

//////// DIFFICULTY CODE STARTS HERE
function get_difficulty_rank(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY difficulty) ranking FROM classes WHERE difficulty <= ' + res.locals.results.difficulty + ' ORDER BY ranking', function(e,r) {
    res.locals.results.difficulty_rank = r[r.length-1].ranking
    next()
  })
}

function difficulty_category(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY difficulty) ranking FROM classes WHERE difficulty <= ' + res.locals.results.difficulty + ' AND category="' + res.locals.results.category + '" ORDER BY ranking', function(e,r) {
    res.locals.results.difficulty_category_rank = r[r.length-1].ranking
    next()
  })
}

function median_difficulty(req, res, next) {
  pool.query('SELECT term, difficulty, ROW_NUMBER() OVER(PARTITION BY term ORDER BY difficulty) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    var curr_ind = 0
    while (curr_ind < r.length) {
      var curr_term = r[curr_ind].term
      var total_nums = res.locals.term_stats[res.locals.term_to_index[curr_term]].total

      if (total_nums % 2 == 0) {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_difficulty = (r[curr_ind + Math.floor(total_nums/2)].difficulty + r[(curr_ind + Math.floor(total_nums/2))-1].difficulty) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_difficulty = r[curr_ind + Math.floor(total_nums/2)].difficulty
      }

      curr_ind += total_nums
    }
    next()
  })
}

function teacher_difficulty(req, res, next) {
  pool.query('SELECT teacher, term, difficulty, ROW_NUMBER() OVER(PARTITION BY teacher,term ORDER BY difficulty) AS row_term, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY term) AS row_teacher FROM class_' + res.locals.results.id, function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[0].teacher
      var curr_len = 0

      var curr_term = r[0].term
      var curr_term_len = 0
      var curr_term_index = 0

      for (var i = 0; i < r.length; i++) {
        if (!(curr_term === r[i].term && curr_teacher === r[i].teacher)) {
          if (curr_term_len % 2 == 0) {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].difficulty = (r[curr_term_index + Math.floor(curr_term_len/2)].difficulty + r[curr_term_index + Math.floor(curr_term_len/2)-1].difficulty) / 2
          }
          else {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].difficulty = r[curr_term_index + Math.floor(curr_term_len/2)].difficulty
          }

          curr_term_len = 0
          curr_term_index = i
          curr_term = r[i].term
        }
        if (!(curr_teacher === r[i].teacher)) {
          curr_len = 0
          curr_index = i
          curr_teacher = r[i].teacher
        }
        curr_len += 1
        curr_term_len += 1
      }
      if (curr_term_len % 2 == 0) {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].difficulty = (r[curr_term_index + Math.floor(curr_term_len/2)].difficulty + r[curr_term_index + Math.floor(curr_term_len/2)-1].difficulty) / 2
      }
      else {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].difficulty = r[curr_term_index + Math.floor(curr_term_len/2)].difficulty
      }
    }
    next()
  })
}

function overall_teacher_difficulty(req, res, next) {
  pool.query('SELECT teacher, term, difficulty, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY difficulty) AS row_term FROM class_' + res.locals.results.id + ';', function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[curr_index].teacher
      while (curr_index < r.length) {
        curr_teacher = r[curr_index].teacher
        var total = 0
        for (var i = 0; i < res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1; i++) {
          total += res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[i].total
        }

        if (total % 2 == 0) {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].difficulty = (r[curr_index + Math.floor(total/2)].difficulty + r[curr_index + Math.floor(total/2)-1].difficulty) / 2
        }
        else {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].difficulty = r[curr_index + Math.floor(total/2)].difficulty
        }

        curr_index += total
      }
    }
    next()
  })
}

function median_overall_difficulty(req, res, next) {
  pool.query('SELECT term, difficulty, ROW_NUMBER() OVER(ORDER BY difficulty) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    if (r.length > 0) {
      if (r.length % 2 == 0) {
        res.locals.term_stats[res.locals.term_stats.length-1].med_difficulty = (r[Math.floor(r.length/2)].difficulty + r[Math.floor(r.length/2)-1].difficulty) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_stats.length-1].med_difficulty = r[Math.floor(r.length/2)].difficulty
      }
    }
    next()
  })
}
///DIFFICULTY CODE ENDS HERE

function get_enjoyment_rank(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY enjoyment DESC) ranking FROM classes WHERE enjoyment >= ' + res.locals.results.enjoyment + ' ORDER BY ranking', function(e,r) {
    res.locals.results.enjoyment_rank = r[r.length-1].ranking
    next()
  })
}

function enjoyment_category(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY enjoyment DESC) ranking FROM classes WHERE enjoyment >= ' + res.locals.results.enjoyment + ' AND category="' + res.locals.results.category + '" ORDER BY ranking', function(e,r) {
    res.locals.results.enjoyment_category_rank = r[r.length-1].ranking
    next()
  })
}

function median_enjoyment(req, res, next) {
  pool.query('SELECT term, enjoyment, ROW_NUMBER() OVER(PARTITION BY term ORDER BY enjoyment) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    var curr_ind = 0
    while (curr_ind < r.length) {
      var curr_term = r[curr_ind].term
      var total_nums = res.locals.term_stats[res.locals.term_to_index[curr_term]].total

      if (total_nums % 2 == 0) {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_enjoyment = (r[curr_ind + Math.floor(total_nums/2)].enjoyment + r[(curr_ind + Math.floor(total_nums/2))-1].enjoyment) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_enjoyment = r[curr_ind + Math.floor(total_nums/2)].enjoyment
      }

      curr_ind += total_nums
    }
    next()
  })
}

function teacher_enjoyment(req, res, next) {
  pool.query('SELECT teacher, term, enjoyment, ROW_NUMBER() OVER(PARTITION BY teacher,term ORDER BY enjoyment) AS row_term, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY term) AS row_teacher FROM class_' + res.locals.results.id, function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[0].teacher
      var curr_len = 0

      var curr_term = r[0].term
      var curr_term_len = 0
      var curr_term_index = 0

      for (var i = 0; i < r.length; i++) {
        if (!(curr_term === r[i].term && curr_teacher === r[i].teacher)) {
          if (curr_term_len % 2 == 0) {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].enjoyment = (r[curr_term_index + Math.floor(curr_term_len/2)].enjoyment + r[curr_term_index + Math.floor(curr_term_len/2)-1].enjoyment) / 2
          }
          else {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].enjoyment = r[curr_term_index + Math.floor(curr_term_len/2)].enjoyment
          }

          curr_term_len = 0
          curr_term_index = i
          curr_term = r[i].term
        }
        if (!(curr_teacher === r[i].teacher)) {
          curr_len = 0
          curr_index = i
          curr_teacher = r[i].teacher
        }
        curr_len += 1
        curr_term_len += 1
      }
      if (curr_term_len % 2 == 0) {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].enjoyment = (r[curr_term_index + Math.floor(curr_term_len/2)].enjoyment + r[curr_term_index + Math.floor(curr_term_len/2)-1].enjoyment) / 2
      }
      else {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].enjoyment = r[curr_term_index + Math.floor(curr_term_len/2)].enjoyment
      }
    }
    next()
  })
}

function overall_teacher_enjoyment(req, res, next) {
  pool.query('SELECT teacher, term, enjoyment, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY enjoyment) AS row_term FROM class_' + res.locals.results.id + ';', function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[curr_index].teacher
      while (curr_index < r.length) {
        curr_teacher = r[curr_index].teacher
        var total = 0
        for (var i = 0; i < res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1; i++) {
          total += res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[i].total
        }

        if (total % 2 == 0) {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].enjoyment = (r[curr_index + Math.floor(total/2)].enjoyment + r[curr_index + Math.floor(total/2)-1].enjoyment) / 2
        }
        else {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].enjoyment = r[curr_index + Math.floor(total/2)].enjoyment
        }

        curr_index += total
      }
    }
    next()
  })
}

function median_overall_enjoyment(req, res, next) {
  pool.query('SELECT term, enjoyment, ROW_NUMBER() OVER(ORDER BY enjoyment) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    if (r.length > 0) {
      if (r.length % 2 == 0) {
        res.locals.term_stats[res.locals.term_stats.length-1].med_enjoyment = (r[Math.floor(r.length/2)].enjoyment + r[Math.floor(r.length/2)-1].enjoyment) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_stats.length-1].med_enjoyment = r[Math.floor(r.length/2)].enjoyment
      }
    }
    next()
  })
}

function get_teacher_score_rank(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY teacher_score DESC) ranking FROM classes WHERE teacher_score >= ' + res.locals.results.teacher_score + ' ORDER BY ranking', function(e,r) {
    res.locals.results.teacher_score_rank = r[r.length-1].ranking
    next()
  })
}

function teacher_score_category(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY teacher_score DESC) ranking FROM classes WHERE teacher_score >= ' + res.locals.results.teacher_score + ' AND category="' + res.locals.results.category + '" ORDER BY ranking', function(e,r) {
    res.locals.results.teacher_score_category_rank = r[r.length-1].ranking
    next()
  })
}

function median_teacher_score(req, res, next) {
  pool.query('SELECT term, teacher_score, ROW_NUMBER() OVER(PARTITION BY term ORDER BY teacher_score) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    var curr_ind = 0
    while (curr_ind < r.length) {
      var curr_term = r[curr_ind].term
      var total_nums = res.locals.term_stats[res.locals.term_to_index[curr_term]].total

      if (total_nums % 2 == 0) {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_teacher_score = (r[curr_ind + Math.floor(total_nums/2)].teacher_score + r[(curr_ind + Math.floor(total_nums/2))-1].teacher_score) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_teacher_score = r[curr_ind + Math.floor(total_nums/2)].teacher_score
      }

      curr_ind += total_nums
    }
    next()
  })
}

function teacher_teacher_score(req, res, next) {
  pool.query('SELECT teacher, term, teacher_score, ROW_NUMBER() OVER(PARTITION BY teacher,term ORDER BY teacher_score) AS row_term, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY term) AS row_teacher FROM class_' + res.locals.results.id, function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[0].teacher
      var curr_len = 0

      var curr_term = r[0].term
      var curr_term_len = 0
      var curr_term_index = 0

      for (var i = 0; i < r.length; i++) {
        if (!(curr_term === r[i].term && curr_teacher === r[i].teacher)) {
          if (curr_term_len % 2 == 0) {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].teacher_score = (r[curr_term_index + Math.floor(curr_term_len/2)].teacher_score + r[curr_term_index + Math.floor(curr_term_len/2)-1].teacher_score) / 2
          }
          else {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].teacher_score = r[curr_term_index + Math.floor(curr_term_len/2)].teacher_score
          }

          curr_term_len = 0
          curr_term_index = i
          curr_term = r[i].term
        }
        if (!(curr_teacher === r[i].teacher)) {
          curr_len = 0
          curr_index = i
          curr_teacher = r[i].teacher
        }
        curr_len += 1
        curr_term_len += 1
      }
      if (curr_term_len % 2 == 0) {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].teacher_score = (r[curr_term_index + Math.floor(curr_term_len/2)].teacher_score + r[curr_term_index + Math.floor(curr_term_len/2)-1].teacher_score) / 2
      }
      else {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].teacher_score = r[curr_term_index + Math.floor(curr_term_len/2)].teacher_score
      }
    }
    next()
  })
}

function overall_teacher_teacher_score(req, res, next) {
  pool.query('SELECT teacher, term, teacher_score, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY teacher_score) AS row_term FROM class_' + res.locals.results.id + ';', function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[curr_index].teacher
      while (curr_index < r.length) {
        curr_teacher = r[curr_index].teacher
        var total = 0
        for (var i = 0; i < res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1; i++) {
          total += res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[i].total
        }

        if (total % 2 == 0) {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].teacher_score = (r[curr_index + Math.floor(total/2)].teacher_score + r[curr_index + Math.floor(total/2)-1].teacher_score) / 2
        }
        else {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].teacher_score = r[curr_index + Math.floor(total/2)].teacher_score
        }

        curr_index += total
      }
    }
    next()
  })
}

function median_overall_teacher_score(req, res, next) {
  pool.query('SELECT term, teacher_score, ROW_NUMBER() OVER(ORDER BY teacher_score) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    if (r.length > 0) {
      if (r.length % 2 == 0) {
        res.locals.term_stats[res.locals.term_stats.length-1].med_teacher_score = (r[Math.floor(r.length/2)].teacher_score + r[Math.floor(r.length/2)-1].teacher_score) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_stats.length-1].med_teacher_score = r[Math.floor(r.length/2)].teacher_score
      }
    }
    next()
  })
}

function get_grade_rank(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY grade DESC) ranking FROM classes WHERE grade >= ' + res.locals.results.grade + ' ORDER BY ranking', function(e,r) {
    res.locals.results.grade_rank = r[r.length-1].ranking
    next()
  })
}

function grade_category(req, res, next) {
  pool.query('SELECT name, RANK() OVER (ORDER BY grade DESC) ranking FROM classes WHERE grade >= ' + res.locals.results.grade + ' AND category="' + res.locals.results.category + '" ORDER BY ranking', function(e,r) {
    res.locals.results.grade_category_rank = r[r.length-1].ranking
    next()
  })
}

function median_grade(req, res, next) {
  pool.query('SELECT term, grade, ROW_NUMBER() OVER(PARTITION BY term ORDER BY grade) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    var curr_ind = 0
    while (curr_ind < r.length) {
      var curr_term = r[curr_ind].term
      var total_nums = res.locals.term_stats[res.locals.term_to_index[curr_term]].total

      if (total_nums % 2 == 0) {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_grade = (r[curr_ind + Math.floor(total_nums/2)].grade + r[(curr_ind + Math.floor(total_nums/2))-1].grade) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_to_index[curr_term]].med_grade = r[curr_ind + Math.floor(total_nums/2)].grade
      }

      curr_ind += total_nums
    }
    next()
  })
}

function teacher_grade(req, res, next) {
  pool.query('SELECT teacher, term, grade, ROW_NUMBER() OVER(PARTITION BY teacher,term ORDER BY grade) AS row_term, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY term) AS row_teacher FROM class_' + res.locals.results.id, function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[0].teacher
      var curr_len = 0

      var curr_term = r[0].term
      var curr_term_len = 0
      var curr_term_index = 0

      for (var i = 0; i < r.length; i++) {
        if (!(curr_term === r[i].term && curr_teacher === r[i].teacher)) {
          if (curr_term_len % 2 == 0) {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].grade = (r[curr_term_index + Math.floor(curr_term_len/2)].grade + r[curr_term_index + Math.floor(curr_term_len/2)-1].grade) / 2
          }
          else {
            res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].grade = r[curr_term_index + Math.floor(curr_term_len/2)].grade
          }

          curr_term_len = 0
          curr_term_index = i
          curr_term = r[i].term
        }
        if (!(curr_teacher === r[i].teacher)) {
          curr_len = 0
          curr_index = i
          curr_teacher = r[i].teacher
        }
        curr_len += 1
        curr_term_len += 1
      }
      if (curr_term_len % 2 == 0) {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].grade = (r[curr_term_index + Math.floor(curr_term_len/2)].grade + r[curr_term_index + Math.floor(curr_term_len/2)-1].grade) / 2
      }
      else {
        res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.term_teacher_to_index[curr_teacher][curr_term]].grade = r[curr_term_index + Math.floor(curr_term_len/2)].grade
      }
    }
    next()
  })
}

function overall_teacher_grade(req, res, next) {
  pool.query('SELECT teacher, term, grade, ROW_NUMBER() OVER(PARTITION BY teacher ORDER BY grade) AS row_term FROM class_' + res.locals.results.id + ';', function(e, r) {
    if (r.length > 0) {
      var curr_index = 0
      var curr_teacher = r[curr_index].teacher
      while (curr_index < r.length) {
        curr_teacher = r[curr_index].teacher
        var total = 0
        for (var i = 0; i < res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1; i++) {
          total += res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[i].total
        }

        if (total % 2 == 0) {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].grade = (r[curr_index + Math.floor(total/2)].grade + r[curr_index + Math.floor(total/2)-1].grade) / 2
        }
        else {
          res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[curr_teacher]].terms.length-1].grade = r[curr_index + Math.floor(total/2)].grade
        }

        curr_index += total
      }
    }
    next()
  })
}

function median_overall_grade(req, res, next) {
  pool.query('SELECT term, grade, ROW_NUMBER() OVER(ORDER BY grade) AS row_num FROM class_' + res.locals.results.id + ';', function(e,r) {
    if (r.length > 0) {
      if (r.length % 2 == 0) {
        res.locals.term_stats[res.locals.term_stats.length-1].med_grade = (r[Math.floor(r.length/2)].grade + r[Math.floor(r.length/2)-1].grade) / 2
      }
      else {
        res.locals.term_stats[res.locals.term_stats.length-1].med_grade = r[Math.floor(r.length/2)].grade
      }
    }
    next()
  })
}

function teacher_grade_num(req, res, next) {
  pool.query('SELECT teacher, term, COUNT(*) AS total FROM class_' + res.locals.results.id + ' WHERE grade >= 0 GROUP BY term, teacher;', function(e ,r) {
    if (r.length > 0) {
      for (var i = 0; i < r.length; i++) {
        res.locals.teachers[res.locals.teacher_to_index[r[i].teacher]].terms[res.locals.term_teacher_to_index[r[i].teacher][r[i].term]].grade_total = r[i].total
      }
    }
    next()
  })
}

function teacher_grade_num_overall(req, res, next) {
  pool.query('SELECT teacher, COUNT(*) AS total FROM class_' + res.locals.results.id + ' WHERE grade >= 0 GROUP BY teacher;', function(e ,r) {
    if (r.length > 0) {
      for (var i = 0; i < r.length; i++) {
        res.locals.teachers[res.locals.teacher_to_index[r[i].teacher]].terms[res.locals.teachers[res.locals.teacher_to_index[r[i].teacher]].terms.length-1].grade_total = r[i].total
      }
    }
    next()
  })
}

var base_middleware = [get_class_info, get_total_classes, num_category, avg_terms, avg_overall, grade_num, get_feedback]
var score_middleware = [get_score_rank, score_category, median_score, teacher_class_score, overall_teacher_score, median_overall_score]
var workload_middleware = [get_workload_rank, workload_category, median_workload, teacher_workload, overall_teacher_workload, median_overall_workload]
var difficulty_middleware = [get_difficulty_rank, difficulty_category, median_difficulty, teacher_difficulty, overall_teacher_difficulty, median_overall_difficulty]
var enjoyment_middleware = [get_enjoyment_rank, enjoyment_category, median_enjoyment, teacher_enjoyment, overall_teacher_enjoyment, median_overall_enjoyment]
var teacher_score_middleware = [get_teacher_score_rank, teacher_score_category, median_teacher_score, teacher_teacher_score, overall_teacher_teacher_score, median_overall_teacher_score]
var grade_middleware = [get_grade_rank, grade_category, median_grade, teacher_grade, overall_teacher_grade, median_overall_grade, teacher_grade_num, teacher_grade_num_overall]

app.get('/', (req, res) => {
  pool.query("SELECT * FROM classes;", function(error, results) {
    res.render('index', {"classes": results})
  })
})

app.get('/class/:classID', base_middleware.concat(score_middleware).concat(workload_middleware).concat(difficulty_middleware).concat(enjoyment_middleware).concat(teacher_score_middleware).concat(grade_middleware), function (req, res) {
  // console.log(res.locals.results)
  // console.log(res.locals.term_stats)
  // console.log(res.locals.teachers)
  console.log(res.locals.feedback)
  res.render('classes', {"class_info": res.locals.results, "term_stats": res.locals.term_stats, "teacher": res.locals.teachers, "feedback": res.locals.feedback})
})

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
})
