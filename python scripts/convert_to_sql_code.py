import mysql.connector
from mysql.connector import errorcode
from datetime import datetime
import random

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except Exception as err:
	print(err)

cursor = cnx.cursor()
cursor.execute("SELECT * FROM classes")

result = cursor.fetchall()

file = open("sql_code.txt", "w") 

file.write("CREATE TABLE classes(name VARCHAR(100), alt VARCHAR(200), id VARCHAR(10), category VARCHAR(40), type VARCHAR(20), length VARCHAR(10), weight VARCHAR(5), class_score DOUBLE, workload DOUBLE, description VARCHAR(2500), difficulty DOUBLE, enjoyment DOUBLE, teacher_score DOUBLE, grade_inputs INT, grade DOUBLE, total INT, PRIMARY KEY(id));")
file.write('\n')

for item in result:
	class_id = item[2]
	file.write('CREATE TABLE class_%s(user_id INT, review_time DATETIME, term VARCHAR(25), teacher VARCHAR(20), class_score DOUBLE, workload DOUBLE, feedback VARCHAR(2500), edited BOOL, difficulty DOUBLE, enjoyment DOUBLE, teacher_score DOUBLE, grade DOUBLE, show_teacher BOOL, edit_time DATETIME, term_order INT, review_id INT, likes INT, dislikes INT, funny INT, PRIMARY KEY(user_id, term));' % (class_id))
	file.write('\n')
	file.write('CREATE TABLE class_%s_feedback(reviewer_id INT, review_id INT, likes INT, funny BOOL, PRIMARY KEY(reviewer_id, review_id));' % (class_id))
	file.write('\n')

file.write('CREATE TABLE userfeedback(user_id INT, username VARCHAR(20), class_id VARCHAR(10), review_time DATETIME, term VARCHAR(25), teacher VARCHAR(20), class_score DOUBLE, workload DOUBLE, feedback VARCHAR(2500), difficulty DOUBLE, enjoyment DOUBLE, teacher_score DOUBLE, grade DOUBLE, show_teacher BOOLEAN, grade_input VARCHAR(5), edit_time DATETIME, review_id INT, PRIMARY KEY(user_id, class_id, term));')
file.write('\n')

for item in result:
	file.write('INSERT INTO classes VALUES("%s", "%s", "%s", "%s", "%s", "%s", "%s", 0, 0, "%s", 0, 0, 0, 0, 0, 0);' % (item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[9]))
	file.write('\n')