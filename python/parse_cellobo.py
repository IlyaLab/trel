
cell_in = open('cell.obo','r')
cell_out = open('cell_out.txt','w')

cell_out.write('id' + '\t' + 'name' + '\t' + 'definition' + '\t' + 'comment' + '\t' + 'is_a' + '\t' + 'synonym' + '\t' + 'xref' + '\t' + 'relationship' + '\n')

for line in cell_in:
	line = line.rstrip('\n')
	if line == '[Term]':
		is_a = []
		synonym = []
		name = ''
		comment = ''
		definition = ''
		xref = ''
		relationship = ''
		id = ''
		pass
	if line == '' :	
		cell_out.write(id + '\t' + name + '\t' + definition + '\t' + comment + '\t' + (',').join(is_a) + '\t' + (',').join(synonym) + '\t' + xref + '\t' + relationship + '\n')
		pass
	parsed_line = line.split(':',1)
	if parsed_line[0] == 'id' : 
		id = parsed_line[1]
	if parsed_line[0] == 'is_a' :
			is_a.append(parsed_line[1])
	elif parsed_line[0] == 'name' :
			name = parsed_line[1]
	elif parsed_line[0] == 'def':
			definition = parsed_line[1]
	if parsed_line[0] == 'comment' :
			comment = parsed_line[1]
	if parsed_line[0] == 'synonym' :
			synonym.append(parsed_line[1])
	if parsed_line[0] == 'xref' :
			xref = parsed_line[1]
	if parsed_line[0] == 'relationship' :
			relationship = parsed_line[1]

cell_in.close()

cell_out.close()
		
