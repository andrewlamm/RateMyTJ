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

### DELETE TABLES
# for item in result:
# 	cursor.execute('DROP TABLE class_' + item[2])

### CREATING TABLES
# for item in result:
# 	class_id = item[2]
# 	# print('CREATE TABLE %s (user_id int, review_time datetime, term VARCHAR(25), teacher VARCHAR(20), class_score DOUBLE, workload DOUBLE, feedback VARCHAR(2500), edited bool, PRIMARY KEY(user_id));' % (class_id))
# 	cursor.execute('CREATE TABLE class_%s (user_id int, review_time datetime, term VARCHAR(25), teacher VARCHAR(20), class_score DOUBLE, workload DOUBLE, feedback VARCHAR(2500), edited bool, PRIMARY KEY(user_id));' % (class_id))

# user_id, review_time, term, teacher, class_score, workload, feedback, edited

TEACHERS = ["Teacher" + chr(ord("A")+i) for i in range(26)]
TERMS_YR = ["2020-2021", "2019-2020", "2018-2019"]
TERMS_SEM = [ "2020-2021 Spring", "2020-2021 Fall", "2019-2020 Spring", "2019-2020 Fall", "2018-2019 Spring", "2018-2019 Fall"]

# cursor.execute('INSERT INTO class_119504(user_id, review_time, term, teacher, class_score, workload, feedback, edited) VALUE (10000,"' + str(datetime.now()) + '", "2020-2021", "TeacherB", 5.43, 1.23, "", 0);')

TEACHERS_CLASS = random.sample(TEACHERS, int(random.random()*25)+1)
print(TEACHERS_CLASS)
num_terms = 6
while random.random() < 0.1 and num_terms > 1:
	num_terms -= 1

TERMS_CLASS = random.sample(TERMS_SEM, num_terms)
print(TERMS_CLASS)

# ## ADD TO TABLES
# for item in result:
# 	class_id = item[2]
# 	class_length = item[5]

# 	print(class_id)

# 	start_val = random.random() * 10
# 	end_val = random.random() * 10

# 	start_val_b = random.random() * 10
# 	end_val_b = random.random() * 10

# 	start_val_c = random.random() * 10
# 	end_val_c = random.random() * 10

# 	start_val_d = random.random() * 10
# 	end_val_d = random.random() * 10

# 	start_val_e = random.random() * 10
# 	end_val_e = random.random() * 10

# 	start_val_f = (random.random() * 50)
# 	end_val_f = (random.random() * 50) + 50

# 	TEACHERS_CLASS = random.sample(TEACHERS, int(random.random()*25)+1)
# 	TERMS_CLASS = []
# 	if class_length == "Full Year":
# 		num_terms = 3
# 		while random.random() < 0.3 and num_terms > 1:
# 			num_terms -= 1
# 		TERMS_CLASS = random.sample(TERMS_YR, num_terms)
# 	else:
# 		num_terms = 6
# 		while random.random() < 0.3 and num_terms > 1:
# 			num_terms -= 1
# 		TERMS_CLASS = random.sample(TERMS_SEM, num_terms)

# 	TEACHER_TERMS = {}
# 	for teacher in TEACHERS_CLASS:
# 		num_terms = len(TERMS_CLASS)
# 		while random.random() < 0.3 and num_terms > 1:
# 			num_terms -= 1
# 		TEACHER_TERMS[teacher] = random.sample(TERMS_CLASS, num_terms)

# 	for user in range(9000, 10000):
# 		if random.random() < 0.75:
# 			teacher = random.choice(TEACHERS_CLASS)
# 			# print('INSERT INTO class_feedback (user_id, class_id, review_time, term, teacher, class_score, workload, difficulty, enjoyment, teacher_score, show_teacher, grade, feedback, edited) VALUE (%s, "%s", "%s", "%s", "%s", %s, %s, %s, %s, %s, true, %s, "", false);' % (user, class_id, str(datetime.now()), random.choice(TEACHER_TERMS[teacher]), teacher, round(random.uniform(start_val, end_val), 2), round(random.uniform(start_val_b, end_val_b), 2), round(random.uniform(start_val_c, end_val_c), 2), round(random.uniform(start_val_d, end_val_d), 2), round(random.uniform(start_val_e, end_val_e), 2), round(random.uniform(start_val_f, end_val_f), 2)))
# 			if random.random() < 0.7:
# 				cursor.execute('INSERT INTO class_feedback (user_id, class_id, review_time, term, teacher, class_score, workload, difficulty, enjoyment, teacher_score, show_teacher, grade, feedback, edited) VALUE (%s, "%s", "%s", "%s", "%s", %s, %s, %s, %s, %s, true, %s, "", false);' % (user, class_id, str(datetime.now()), random.choice(TEACHER_TERMS[teacher]), teacher, round(random.uniform(start_val, end_val), 2), round(random.uniform(start_val_b, end_val_b), 2), round(random.uniform(start_val_c, end_val_c), 2), round(random.uniform(start_val_d, end_val_d), 2), round(random.uniform(start_val_e, end_val_e), 2), round(random.uniform(start_val_f, end_val_f), 2)))
# 			else:
# 				cursor.execute('INSERT INTO class_feedback (user_id, class_id, review_time, term, teacher, class_score, workload, difficulty, enjoyment, teacher_score, show_teacher, feedback, edited) VALUE (%s, "%s", "%s", "%s", "%s", %s, %s, %s, %s, %s, true, "", false);' % (user, class_id, str(datetime.now()), random.choice(TEACHER_TERMS[teacher]), teacher, round(random.uniform(start_val, end_val), 2), round(random.uniform(start_val_b, end_val_b), 2), round(random.uniform(start_val_c, end_val_c), 2), round(random.uniform(start_val_d, end_val_d), 2), round(random.uniform(start_val_e, end_val_e), 2)))

###UPDATE MAIN classes TABLE

NEW_STATS = ["workload", "difficulty", "enjoyment", "teacher_score", "grade"]
for item in result:
	class_id = item[2]
	print(class_id)

	if item[5] == "Full Year":
		cursor.execute("SELECT class_score, ROW_NUMBER() OVER(ORDER BY class_score desc) rownum FROM class_" + class_id + ';')
	else:
		cursor.execute("SELECT class_score, ROW_NUMBER() OVER(ORDER BY class_score desc) rownum FROM class_" + class_id + ';')
	class_result = cursor.fetchall()

	total_len = len(class_result)
	new_median = 0

	if total_len % 2 != 0:
		new_median = class_result[total_len // 2][0]
	else:
		new_median = (class_result[(total_len // 2)-1][0] + class_result[(total_len // 2)][0]) / 2

	cursor.execute('UPDATE classes SET class_score =' + str(new_median) + ' WHERE id="' + class_id + '";')

	for s in NEW_STATS:
		if item[5] == "Full Year":
			cursor.execute("SELECT " + s + ", ROW_NUMBER() OVER(ORDER BY " + s + ") rownum FROM class_" + class_id + ' WHERE ' + s + ' IS NOT NULL;')
		else:
			cursor.execute("SELECT " + s + ", ROW_NUMBER() OVER(ORDER BY " + s + ") rownum FROM class_" + class_id + ' WHERE ' + s + ' IS NOT NULL;')
		class_result = cursor.fetchall()

		total_len = len(class_result)
		new_median = 0

		if total_len % 2 != 0:
			new_median = class_result[total_len // 2][0]
		else:
			new_median = (class_result[(total_len // 2)-1][0] + class_result[(total_len // 2)][0]) / 2

		cursor.execute('UPDATE classes SET ' + s + ' =' + str(new_median) + ' WHERE id="' + class_id + '";')

	total = 0
	if item[5] == "Full Year":
		cursor.execute("SELECT " + s + ", ROW_NUMBER() OVER(ORDER BY " + s + ") rownum FROM class_" + class_id + ';')
	else:
		cursor.execute("SELECT " + s + ", ROW_NUMBER() OVER(ORDER BY " + s + ") rownum FROM class_" + class_id + ';')
	grade_result = cursor.fetchall()

	for i in grade_result:
		if i[0] is not None:
			total += 1
	cursor.execute('UPDATE classes SET grade_inputs=' + str(total) + ' WHERE id="' + class_id + '";')
	cursor.execute('UPDATE classes SET total=' + str(len(grade_result)) + ' WHERE id="' + class_id + '";')

cnx.commit()

cursor.close()
cnx.close()
