### DOES NOT WORK CORRECTLY

from requests_html import HTMLSession
import time
import mysql.connector
from mysql.connector import errorcode

classes = set()

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except Exception as err:
	print(err)

cursor = cnx.cursor()
cursor.execute("SELECT id FROM classes")

result = cursor.fetchall()

for item in result:
	classes.add(item[0])

print(classes)

classes_found = 0
for i in range(10000, 50000):
	print("CURRENTLY ON INDEX %s" % (i))
	session = HTMLSession()
	r = session.get("https://insys.fcps.edu/CourseCatOnline/sharecourse/503/" + str(i) + "/0/0/0/1")
	r.html.render(sleep=1)
	s = r.html.html
	# print(s)
	# print(len(s))

	# print(s.find('<strong _ngcontent-'))
	s = s[s.find('<strong _ngcontent-'):]
	# print(s)

	class_id = s[s.find('(')+1:s.find(')')]
	# print(class_id)

	if class_id in classes:
		classes_found += 1
		print("CLASS FOUND! ID: %s. COUNTER AT %s OUT OF %s" % (class_id, classes_found, len(classes)))
		s = s[s.find('<div _ngcontent')+1:]
		s = s[s.find('<div _ngcontent')+1:]
		s = s[s.find('<div _ngcontent')+1:]
		s = s[s.find('<div _ngcontent')+1:]

		desc = s[s.find(">")+1:s.find("<")]
		# print(desc)

		cursor.execute('UPDATE classes SET description="' + desc + '" WHERE id="' + class_id + '";')


cnx.commit()

cursor.close()
cnx.close()