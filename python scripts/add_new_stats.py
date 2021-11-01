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

### ADD COLUMNS TO TABLES
# for item in result:
# 	class_id = item[2]
# 	# print(class_id)
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD difficulty DOUBLE;')
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD enjoyment DOUBLE;')
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD teacher_score DOUBLE;')
# 	cursor.execute('ALTER TABLE class_' + class_id + ' ADD grade DOUBLE;')

for class_id in classes:
	cursor.execute("SELECT * FROM class_" + class_id)
	result = cursor.fetchall()

	diff_bound = random.random() * 10
	diff_bound_b = random.random() * 10
	enjoy_bound = random.random() * 10
	enjoy_bound_b = random.random() * 10
	teacher_bound = random.random() * 10
	teacher_bound_b = random.random() * 10
	grade_bound = random.random() * 50 + 50
	grade_bound_b = random.random() * 50 + 50

	for item in result:
		user_id = item[0]

		if random.random() < 0.8:
			cursor.execute('UPDATE class_%s SET difficulty=%s, enjoyment=%s, teacher_score=%s, grade=%s WHERE user_id="%s"' % (class_id, round(random.uniform(diff_bound, diff_bound_b), 2), round(random.uniform(enjoy_bound, enjoy_bound_b), 2), round(random.uniform(teacher_bound, teacher_bound_b), 2), round(random.uniform(grade_bound, grade_bound_b), 2), user_id))
		else:
			cursor.execute('UPDATE class_%s SET difficulty=%s, enjoyment=%s, teacher_score=%s, grade=NULL WHERE user_id="%s"' % (class_id, round(random.uniform(diff_bound, diff_bound_b), 2), round(random.uniform(enjoy_bound, enjoy_bound_b), 2), round(random.uniform(teacher_bound, teacher_bound_b), 2), user_id))

				


cnx.commit()

cursor.close()
cnx.close()