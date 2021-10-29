import mysql.connector
from mysql.connector import errorcode
import random

try:
	cnx = mysql.connector.connect(user='root', password="asdf", host="127.0.0.1", database='RateMyTJ')
except err:
	print(err)

cursor = cnx.cursor()

STATS = ["classScore", "workload"]

classes = [[[],[]]]
category_num = 0
cat_type = 0
with open("class_names.txt") as f:
	for line in f:
		class_name = line.strip()

		if class_name == "":
			if cat_type == 0:
				cat_type += 1
			else:
				classes.append([[],[]])
				category_num += 1
				cat_type = 0
		else:
			classes[category_num][cat_type].append(class_name)

# print(classes)

num_to_category = {0: "Technology and Engineering", 1: "English", 2: "Fine Arts: Music", 3: "Fine Arts: Theatre Arts", 4: "Fine Arts: Visual Arts", 5: "General", 6: "Health/PE", 7: "Mathematics", 8: 'Science', 9: "Social Studies", 10: "World Languages"}
class_dict = {}

class_id_list = []
with open("class_ids.txt") as f:
	for line in f:
		class_id = line.strip()
		class_id_list.append(class_id)

class_credit_len = []
class_credit_weight = []
with open("class_credit.txt") as f:
	for line in f:
		strip_line = line.strip()
		if "/" in strip_line:
			length = strip_line[:strip_line.index("/")-1]
			weight = strip_line[strip_line.index("/")+11:]

			if length == "1":
				class_credit_len.append("Full Year")
			else:
				class_credit_len.append("Semester")

			class_credit_weight.append(weight)
		else:
			if strip_line == "1":
				class_credit_len.append("Full Year")
			else:
				class_credit_len.append("Semester")
			class_credit_weight.append("+0.0")

		# print("%s %s" % (class_credit_len[-1], class_credit_weight[-1]))

curr_cat = 0
curr_typ = 0
curr_ind = 0

for i in range(len(class_id_list)):
	if curr_ind >= len(classes[curr_cat][curr_typ]):
		if curr_typ == 0:
			curr_typ += 1
			curr_ind = 0
		else:
			curr_cat += 1
			curr_ind = 0
			curr_typ = 0
	if curr_ind >= len(classes[curr_cat][curr_typ]):
		if curr_typ == 0:
			curr_typ += 1
			curr_ind = 0
		else:
			curr_cat += 1
			curr_ind = 0
			curr_typ = 0

	class_dict[class_id_list[i]] = [classes[curr_cat][curr_typ][curr_ind], "", num_to_category[curr_cat], "Core" if curr_typ == 0 else "Elective", class_credit_len[i], class_credit_weight[i]]

	for j in range(len(STATS)):
		s = str(round(random.random() * 10, 2))
		while len(s) < 4:
			s += "0"
		class_dict[class_id_list[i]].append(s)

	curr_ind += 1
# print(class_dict)

# add alternate names
class_dict["9828T3"][1] = "Engineering Design Research"
class_dict["122000"][1] = "Broadcast Journalism 1"
class_dict["122012"][1] = "Broadcast Journalism 2"
class_dict["122013"][1] = "Broadcast Journalism 3"
class_dict["122014"][1] = "Broadcast Journalism 4"
class_dict["612000"][1] = "epf"
class_dict["612036"][1] = "epf"
class_dict["3190T1"][1] = "RS1"
class_dict["317861"][1] = "diffeq"
class_dict["318561"][1] = "AP CS"
class_dict["319800"][1] = "Linear Alegbra"
class_dict["3184T1"][1] = "Foundations CS"
class_dict["3184T2"][1] = "Accelerated foundations CS"
class_dict["3199T6"][1] = "ML1"
class_dict["3199T7"][1] = "ML2"
class_dict["3190T3"][1] = "RS3"
class_dict["319862"][1] = "AMT"
class_dict["319917"][1] = "CV2"
class_dict["3190T2"][1] = "RS2"
class_dict["319916"][1] = "CV"
class_dict["319966"][1] = "AI1"
class_dict["319967"][1] = "AI2"
class_dict["3199T3"][1] = "syslab"
class_dict["3199R1"][1] = "mobile web"
class_dict["4520T9"][1] = "Quantum Mechanics"
class_dict["2221T1"][1] = "world history geography"
class_dict["2360T1"][1] = "USVA"
class_dict["231905"][1] = "APUSH"
class_dict["2340T1"][1] = "20th century"
class_dict["280404"][1] = "AP Econ Macro micro"

for class_id in class_dict:
	add_line = ('INSERT INTO classes(name, alt, id, category, type, length, weight, class_score, workload) VALUE ("%s","%s","%s","%s","%s","%s","%s",%s,%s);' % (class_dict[class_id][0], class_dict[class_id][1], class_id, class_dict[class_id][2], class_dict[class_id][3], class_dict[class_id][4], class_dict[class_id][5], class_dict[class_id][6], class_dict[class_id][7]))
	print(add_line)
	cursor.execute(add_line)

# INSERT INTO classes(name, alt, id, category, type, weight, class_score, workload) VALUE ("Mobile/Web App Res", "", "3199R1", "Mathematics", "Elective", "Full Year", "+0.5", 9.8, 2.3)

cnx.commit()

cursor.close()
cnx.close()

### PRINT TO FILE
# file = open("tableout.txt", "w")

# for class_id in class_dict:
# 	file.write("<tr>\n")
# 	file.write("\t<td>" + str(class_dict[class_id][0]) + "</td>\n")
# 	file.write("\t<td>" + class_id + "</td>\n")
# 	for i in range(1, len(class_dict[class_id])):
# 		file.write("\t<td>" + str(class_dict[class_id][i]) + "</td>\n")
# 	file.write("</tr>\n")

# file = open("json.txt", "w")

# file.write("{\n")
# file.write('\t"classes": [\n')
# for class_id in class_dict:
# 	file.write('\t\t{\n')
# 	file.write('\t\t\t"className": "' + class_dict[class_id][0] + '",\n')
# 	file.write('\t\t\t"alternate": "' + class_dict[class_id][1] + '",\n')
# 	file.write('\t\t\t"ID": "' + class_id + '",\n')
# 	file.write('\t\t\t"category": "' + class_dict[class_id][2] + '",\n')
# 	file.write('\t\t\t"type": "' + class_dict[class_id][3] + '",\n')
# 	file.write('\t\t\t"length": "' + class_dict[class_id][4] + '",\n')
# 	file.write('\t\t\t"weight": "' + class_dict[class_id][5] + '",\n')
# 	for i in range(len(STATS)):
# 		if i == len(STATS)-1:
# 			file.write('\t\t\t"' + STATS[i] + '": "' + class_dict[class_id][6+i] + '"\n')
# 		else:
# 			file.write('\t\t\t"' + STATS[i] + '": "' + class_dict[class_id][6+i] + '",\n')
# 	file.write('\t\t},\n')
# file.write('\t],\n')
# file.write("}\n")

# file = open("json_no_newline.txt", "w")

# s = ""

# s += ("{")
# s += ('"classes": [')
# for class_id in class_dict:
# 	s += ('{')
# 	s += ('"className": "' + class_dict[class_id][0] + '",')
# 	s += ('"alternate": "' + class_dict[class_id][1] + '",')
# 	s += ('"ID": "' + class_id + '",')
# 	s += ('"category": "' + class_dict[class_id][2] + '",')
# 	s += ('"type": "' + class_dict[class_id][3] + '",')
# 	s += ('"length": "' + class_dict[class_id][4] + '",')
# 	s += ('"weight": "' + class_dict[class_id][5] + '",')
# 	for i in range(len(STATS)):
# 		if i == len(STATS)-1:
# 			s += ('"' + STATS[i] + '": "' + class_dict[class_id][6+i] + '"')
# 		else:
# 			s += ('"' + STATS[i] + '": "' + class_dict[class_id][6+i] + '",')
# 	s += ('},')
# s += ('],')
# s += ("}")

# s = s[:-4] + s[-3:]
# s = s[:-2] + s[-1:]

# file.write(s)

# <tr>
# 	<td>TJ Math 1</td>
# 	<td>314351</td>
# 	<td>Mathematics</td>
# 	<td>Core</td>
# 	<td>Semester</td>
# 	<td>+0.5</td>
# 	<td>9.21</td>
# 	<td>1.71</td>
# </tr>
