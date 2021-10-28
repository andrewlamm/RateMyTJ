import mysql.connector
from mysql.connector import errorcode

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except err:
	print(err)

cursor = cnx.cursor()
cursor.execute("SELECT * FROM classes")

result = cursor.fetchall()

classes = {}

for item in result:
	# print(item)
	class_name = item[0]
	class_id = item[2]
	# print("%s %s" % (class_name, class_id))

	class_name = class_name.lower()
	name_split = class_name.split()

	for i in range(len(name_split)):
		if name_split[i] == "ap":
			name_split[i] = "AP"
		elif name_split[i] == "adv":
			name_split[i] = "Advanced"
		elif name_split[i] == "tj":
			name_split[i] = "TJ"
		elif name_split[i] == "sci":
			name_split[i] = "Science"
		elif name_split[i] == "comp":
			name_split[i] = "Computer"
		elif name_split[i] == "ment":
			name_split[i] = "Mentorship"
		elif name_split[i] == "res":
			name_split[i] = "Research"
		elif name_split[i] == "w/ap":
			name_split[i] = "w/ AP"
		elif name_split[i] == "w/":
			name_split[i] = "w/"
		elif name_split[i] == "w/us":
			name_split[i] = "w/ US"
		elif name_split[i] == "history/geography":
			name_split[i] = "History/Geography"
		elif name_split[i] == "us":
			name_split[i] = "US"
		elif name_split[i] == "va":
			name_split[i] = "VA"
		elif name_split[i] == "sem":
			name_split[i] = ""
		elif name_split[i] == "journ":
			name_split[i] = "Journalism"
		elif name_split[i] == "gov":
			name_split[i] = "Government"
		elif name_split[i] == "hist":
			name_split[i] = "History"
		elif name_split[i] == "eng":
			name_split[i] = "English"
		elif name_split[i] == "lang":
			name_split[i] = "Language"
		elif name_split[i] == "lit":
			name_split[i] = "Literature"
		elif name_split[i] == "astr":
			name_split[i] = "Astronomy"
		elif name_split[i] == "dna":
			name_split[i] = "DNA"
		elif name_split[i] == "pe":
			name_split[i] = "PE"
		elif name_split[i] == "stud":
			name_split[i] = "Studio"
		elif name_split[i] == "des":
			name_split[i] = "Design"
		elif name_split[i] == "and":
			name_split[i] = "and"
		else:
			name_split[i] = name_split[i][0].upper() + name_split[i][1:]

	class_name = ' '.join(name_split)
	# print("%s %s" % (class_name, class_id))

	classes[class_id] = class_name

## hard code class names

classes["2219T1"] = "Ancient & Classical Civilizations"
classes["244561"] = "AP US Governemnt w/ AP English Language"
classes["280404"] = "AP Macro and Microeconomics"
classes["2900T1"] = "Psychology: Brain & Behavior"
classes["2996T2"] = "America/World Since 1989"
classes["317004"] = "AP Calclus AB"
classes["317704"] = "AP Calclus BC"
classes["317860"] = "Multivariable Calclus"
classes["3184T1"] = "Foundations of Computer Science"
classes["3184T2"] = "Accelerated Foundations of Computer Science"
classes["319966"] = "Artificial Intelligence 1"
classes["319967"] = "Artificial Intelligence 2"
classes["3199R1"] = "Mobile/Web App Research"
classes["4420T2"] = "Chemical Analysis Research"
classes["4420T4"] = "Introduction to Organic Chemistry 1"
classes["4520T1"] = "Computational Physics"
classes["457004"] = "AP Physics C-Mechanics and Electricity And Magnetism"
classes["612000"] = "Economics and Personal Finance"
classes["612036"] = "Economics and Personal Finance Honors"
classes["6120SD"] = "Self-Directed Online Economics and Personal Finance"
classes["906200"] = "Teachers for Tomorrow"
classes["914804"] = "AP Art: Studio Art 2D"
classes["918032"] = "Computer Graphics 1"
classes["918132"] = "Computer Graphics 2"
classes["925015"] = "Percussion Ensemble"
classes["9826T1"] = "Advanced Microprocessor Systems"
classes["9826T2"] = "Micro Electronics Research"
classes["9826T7"] = "Automation/Robotics Micro Systems"
classes["9826T8"] = "Automation/Robotics Systems"
classes["9826T9"] = "Automation Robotics Research"
classes["9828T0"] = "Prototyping 1"
classes["9828T4"] = "Prototyping 2"
classes["9828T3"] = "Engineering Design Research"
classes["9828T5"] = "Intro Engr Acc Adv"
classes["9828T6"] = "Prototype Development Research"
classes["4260T4"] = "Advanced Astronomy Solar Systems"
classes["2996T1"] = "History of Science"
classes["9153T0"] = "Art for Engineers"
classes["3199J2"] = "Mobile App Development"
classes["3199J1"] = "Web App Development"
	
for class_id in classes:
	print("%s %s" % (classes[class_id], class_id))
	alt = input("Alternates? ")
	# print(alt)
	cursor.execute('UPDATE classes SET name="%s",alt="%s" WHERE id="%s";' % (classes[class_id], alt, class_id))

cnx.commit()

cursor.close()
cnx.close()