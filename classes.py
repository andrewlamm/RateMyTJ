import random
import sys
import json

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

	class_dict[class_id_list[i]] = [classes[curr_cat][curr_typ][curr_ind], num_to_category[curr_cat], "Core" if curr_typ == 0 else "Elective", class_credit_len[i], class_credit_weight[i]]

	for j in range(len(STATS)):
		s = str(round(random.random() * 10, 2))
		while len(s) < 4:
			s += "0"
		class_dict[class_id_list[i]].append(s)

	curr_ind += 1
print(class_dict)

# file = open("tableout.txt", "w")

# for class_id in class_dict:
# 	file.write("<tr>\n")
# 	file.write("\t<td>" + str(class_dict[class_id][0]) + "</td>\n")
# 	file.write("\t<td>" + class_id + "</td>\n")
# 	for i in range(1, len(class_dict[class_id])):
# 		file.write("\t<td>" + str(class_dict[class_id][i]) + "</td>\n")
# 	file.write("</tr>\n")

file = open("json.txt", "w")

file.write("{\n")
file.write('\t"classes": [\n')
for class_id in class_dict:
	file.write('\t\t{\n')
	file.write('\t\t\t"className": "' + class_dict[class_id][0] + '",\n')
	file.write('\t\t\t"ID": "' + class_id + '",\n')
	file.write('\t\t\t"Category": "' + class_dict[class_id][1] + '",\n')
	file.write('\t\t\t"Type": "' + class_dict[class_id][2] + '",\n')
	file.write('\t\t\t"Length": "' + class_dict[class_id][3] + '",\n')
	file.write('\t\t\t"Weight": "' + class_dict[class_id][4] + '",\n')
	for i in range(len(STATS)):
		if i == len(STATS)-1:
			file.write('\t\t\t"' + STATS[i] + '": "' + class_dict[class_id][5+i] + '"\n')
		else:
			file.write('\t\t\t"' + STATS[i] + '": "' + class_dict[class_id][5+i] + '",\n')
	file.write('\t\t},\n')
file.write('\t],\n')
file.write("}\n")

file = open("json_no_newline.txt", "w")

s = ""

s += ("{")
s += ('"classes": [')
for class_id in class_dict:
	s += ('{')
	s += ('"className": "' + class_dict[class_id][0] + '",')
	s += ('"ID": "' + class_id + '",')
	s += ('"Category": "' + class_dict[class_id][1] + '",')
	s += ('"Type": "' + class_dict[class_id][2] + '",')
	s += ('"Length": "' + class_dict[class_id][3] + '",')
	s += ('"Weight": "' + class_dict[class_id][4] + '",')
	for i in range(len(STATS)):
		if i == len(STATS)-1:
			s += ('"' + STATS[i] + '": "' + class_dict[class_id][5+i] + '"')
		else:
			s += ('"' + STATS[i] + '": "' + class_dict[class_id][5+i] + '",')
	s += ('},')
s += ('],')
s += ("}")

s = s[:-4] + s[-3:]
s = s[:-2] + s[-1:]

file.write(s)


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
