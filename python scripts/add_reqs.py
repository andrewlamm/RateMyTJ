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

classes = {}
for item in result:
	classes[item[2]] = item[0]

file = open("sql_reqs.txt", "w")

line_num = 0
curr_class = ""
with open('reqs.txt') as f:
	for line in f:
		string = line.strip()

		if line_num % 2 == 0:
			curr_class = string
		else:
			curr = string.split()
			file.write('UPDATE classes SET prereq="%s" WHERE id="%s";' % (string, curr_class))
			file.write('\n')

			print("%s: %s" % (curr_class, classes[curr_class]))
			for i in curr:
				i = i.replace('(', '')
				i = i.replace(')', '')
				if i in classes:
					print("%s: %s - " % (i, classes[i]), end="")
			print()

		line_num += 1
