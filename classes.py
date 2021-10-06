import random
import sys

NUM_OF_STATS = 2

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

print(classes)

num_to_category = {0: "Technology and Engineering Education", 1: "English", 2: "Fine Arts: Music", 3: "Fine Arts: Theatre Arts", 4: "Fine Arts: Visual Arts", 5: "General", 6: "Health/PE", 7: "Mathematics", 8: 'Science', 9: "Social Studies", 10: "World Languages"}
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

	class_dict[classes[curr_cat][curr_typ][curr_ind]] = [class_id_list[i], num_to_category[curr_cat], "Core" if curr_typ == 0 else "Elective", class_credit_len[i], class_credit_weight[i]]

	for i in range(NUM_OF_STATS):
		class_dict[classes[curr_cat][curr_typ][curr_ind]].append(round(random.random() * 10, 2))

	curr_ind += 1
print(class_dict)

file = open("tableout.txt", "w")

for class_name in class_dict:
	file.write("<tr>\n")
	file.write("\t<td>" + class_name + "</td>\n")
	for i in range(len(class_dict[class_name])):
		file.write("\t<td>" + str(class_dict[class_name][i]) + "</td>\n")
	file.write("</tr>\n")


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