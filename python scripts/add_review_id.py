import mysql.connector
from mysql.connector import errorcode
from datetime import datetime
import random

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except Exception as err:
	print(err)

cursor = cnx.cursor()

# cursor.execute("SELECT user_id, class_id, term FROM userfeedback")

# result = cursor.fetchall()

# used_id = set()
# for item in result:
# 	new_id = random.random()*1000000
# 	while new_id in used_id:
# 		new_id = random.random()*1000000
# 	used_id.add(new_id)

# 	cursor.execute('UPDATE userfeedback SET review_id=' + str(new_id) + ' WHERE user_id=' + str(item[0]) + ' AND class_id="' + item[1] + '" AND term="' + item[2] + '";')
# 	cursor.execute('UPDATE class_' + item[1] + ' SET review_id=' + str(new_id) + ' WHERE user_id=' + str(item[0]) + ' AND term="' + item[2] + '";')

# cnx.commit()

cursor.execute("SELECT * FROM classes")

result = cursor.fetchall()

for item in result:
	print(item[2])
	# cursor.execute('ALTER TABLE class_%s ADD likes INT DEFAULT 0, ADD dislikes INT DEFAULT 0, ADD funny INT DEFAULT 0;' % (item[2]))
	# cursor.execute('CREATE TABLE class_%s_feedback (reviewer_id INT, review_id INT, like_dislike BOOL, value BOOL, PRIMARY KEY(reviewer_id, review_id));' % (item[2]))
	cursor.execute('ALTER TABLE class_%s_feedback DROP COLUMN like_dislike, DROP COLUMN value;' % (item[2]))
	cursor.execute('ALTER TABLE class_%s_feedback ADD likes INT, ADD funny BOOL;' % (item[2]))

cursor.close()
cnx.close()