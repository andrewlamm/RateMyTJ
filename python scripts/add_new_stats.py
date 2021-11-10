import mysql.connector
from mysql.connector import errorcode
import random

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except Exception as err:
	print(err)

cursor = cnx.cursor()
cursor.execute("SELECT * FROM classes")

result = cursor.fetchall()
classes = set()

for item in result:
	classes.add(item[2])
	# cursor.execute('ALTER TABLE class_' + item[2] + ' ADD edit_time DATETIME')

	### Shortern term
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="S21" WHERE term="2020-2021 Spring"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="F20" WHERE term="2020-2021 Fall"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="S20" WHERE term="2019-2020 Spring"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="F19" WHERE term="2019-2020 Fall"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="S19" WHERE term="2018-2019 Spring"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="F18" WHERE term="2018-2019 Fall"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="YR20-21" WHERE term="2020-2021"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="YR19-20" WHERE term="2019-2020"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="YR18-19" WHERE term="2018-2019"')

	# cursor.execute('UPDATE class_' + item[2] + ' SET term="Spring 21" WHERE term="S21"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="Fall 20" WHERE term="F20"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="Spring 20" WHERE term="S20"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="Fall 19" WHERE term="F19"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="Spring 19" WHERE term="S19"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="Fall 18" WHERE term="F18"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="2020-21" WHERE term="YR20-21"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="2019-20" WHERE term="YR19-20"')
	# cursor.execute('UPDATE class_' + item[2] + ' SET term="2018-19" WHERE term="YR18-19"')

	cursor.execute('ALTER TABLE class_' + item[2] + ' DROP term_order')
	cursor.execute('ALTER TABLE class_' + item[2] + ' ADD term_order INT')
	if item[5] == "Full Year":
		TERMS = ["Summer 18", "2018-19", "Summer 19", "2019-20", "Summer 20", "2020-21"]
		for i in range(len(TERMS)):	
			cursor.execute('UPDATE class_' + item[2] + ' SET term_order=' + str(i+1) + ' WHERE term="' + TERMS[i] + '"')
	else:
		TERMS = ["Summer 18", "Fall 18", "Spring 19", "Summer 19", "Fall 19", "Spring 20", "Summer 20", "Fall 20", "Spring 21"]
		for i in range(len(TERMS)):
			cursor.execute('UPDATE class_' + item[2] + ' SET term_order=' + str(i+1) + ' WHERE term="' + TERMS[i] + '"')



### ADD COLUMNS TO TABLES
# for item in result:
# 	class_id = item[2]
# 	# print(class_id)
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD difficulty DOUBLE;')
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD enjoyment DOUBLE;')
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD teacher_score DOUBLE;')
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD grade DOUBLE;')
#	cursor.execute('ALTER TABLE class_' + class_id + ' ADD show_teacher BOOL;')

# for class_id in classes:
# 	cursor.execute("SELECT * FROM class_" + class_id)
# 	result = cursor.fetchall()

# 	diff_bound = random.random() * 10
# 	diff_bound_b = random.random() * 10
# 	enjoy_bound = random.random() * 10
# 	enjoy_bound_b = random.random() * 10
# 	teacher_bound = random.random() * 10
# 	teacher_bound_b = random.random() * 10
# 	grade_bound = random.random() * 50 + 50
# 	grade_bound_b = random.random() * 50 + 50

#	for item in result:
# 		user_id = item[0]
# 		cursor.execute('UPDATE class_%s SET show_teacher=1 WHERE user_id=%s' % (class_id, user_id))

# 		if random.random() < 0.8:
# 			cursor.execute('UPDATE class_%s SET difficulty=%s, enjoyment=%s, teacher_score=%s, grade=%s WHERE user_id="%s"' % (class_id, round(random.uniform(diff_bound, diff_bound_b), 2), round(random.uniform(enjoy_bound, enjoy_bound_b), 2), round(random.uniform(teacher_bound, teacher_bound_b), 2), round(random.uniform(grade_bound, grade_bound_b), 2), user_id))
# 		else:
# 			cursor.execute('UPDATE class_%s SET difficulty=%s, enjoyment=%s, teacher_score=%s, grade=NULL WHERE user_id="%s"' % (class_id, round(random.uniform(diff_bound, diff_bound_b), 2), round(random.uniform(enjoy_bound, enjoy_bound_b), 2), round(random.uniform(teacher_bound, teacher_bound_b), 2), user_id))

				


cnx.commit()

cursor.close()
cnx.close()