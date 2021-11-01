import mysql.connector
from mysql.connector import errorcode

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except Exception as err:
	print(err)

cursor = cnx.cursor()

line_num = 0
curr_id = ""
with open("final_desc.txt", encoding='utf8') as f:
	for line in f:
		text = line.strip()
		print("%s: %s" % (line_num, text))

		if line_num % 2 == 0:
			curr_id = text
		else:
			cursor.execute('UPDATE classes SET description="' + text + '" WHERE id="' + curr_id + '";')

		line_num += 1

cnx.commit()

cursor.close()
cnx.close()