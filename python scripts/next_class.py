import mysql.connector
from mysql.connector import errorcode
from datetime import datetime
import random

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except Exception as err:
	print(err)

cursor = cnx.cursor()
cursor.execute("SELECT id, prereq, coreq FROM classes")

result = cursor.fetchall()

classes = set()
for item in result:
	classes.add(item[0])

file = open("next_class.txt", "w")

for item in result:
	classes_to_add = set()
	if item[1] is not None:
		words = item[1].split(' ')
		for w in words:
			if w == "": continue
			if w[0] == '(':
				classes_to_add.add(w[1:])
			elif w[-1] == ')':
				classes_to_add.add(w[:-1])
			else:
				if w in classes:
					classes_to_add.add(w)
	
	if item[2] is not None:
		classes_to_add.add(item[2])

	for c in classes_to_add:
		file.write('UPDATE classes SET next_class=CONCAT(next_class, " %s") WHERE id="%s";\n' % (item[0], c))

	print(item[0])
	print(classes_to_add)
