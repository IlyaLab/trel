import numpy as np
from math import log

gene_in = open('entrez_treg_input.txt','r')
gene_labels = gene_in.read().splitlines()
gene_in.close()

cell_in = open('cellNames_obo.txt','r')
cell_names = cell_in.read().splitlines()
cell_in.close()

cell_pairs = open('cell_pairs.txt','w')

counter = 0
for j in range(len(cell_names)):
	for k in range(j+1,len(cell_names)):
		cell_pairs.write('\t'.join([ str(counter), cell_names[j], cell_names[k], '\n' ]) )
		counter+=1

cell_pairs.close()

num_cells = len(cell_names)

table_out = open('values_table.txt','w')
genes_out = open('genes_table.txt','w')
cells_out = open('cells_table.txt','w')

data_in = open('gene-participation-Teq1.0.tab','r')
gene_counter = 0

def dat2log(x):
	if(x==0):
		return x 
	else:            
		return log(x,2) 

while 1:
	cells = []
	vals = []
	line1 = data_in.readline()
	line2 = data_in.readline()
	line3 = data_in.readline()
	values = [[0]*num_cells for x in xrange(num_cells)]
	genes = [[0]*num_cells for x in xrange(num_cells)]
	counts = [[0]*num_cells for x in xrange(num_cells)]
	if not line3:
		break
	co_cols = line1.rstrip('\n').split('\t')
	co_cols = co_cols[1:]
	va_cols = line2.rstrip('\n').split('\t')
	va_cols = va_cols[1:]
	id_cols = line3.rstrip('\n').split('\t')
	id_cols = id_cols[1:]
	counter = 0

	for j in range(len(cell_names)):
	        for k in range(j+1,len(cell_names)):
			values[j][k] = float(va_cols[counter])
			genes[j][k] = id_cols[counter]
			counts[j][k] = int(co_cols[counter])
			counter += 1
		for k in range(0,j-1):
			values[j][k] = values[k][j] * -1
			genes[j][k] = genes[k][j]
			counts[j][k] = counts[k][j]
		val_ar = np.array(values[j])
		count_ar = counts[j]
		log_count = map(dat2log,count_ar)
		#print [str(c) for c in log_count]
		vals.append(np.negative(val_ar * np.array(log_count)))
		cells.append(('\t').join([str(j),gene_labels[gene_counter],str(np.round_(np.sum(vals[j]),3)),(',').join([str(value) for value in vals[j]])]))
	row_table = []
	row_genes = []
        row_table.append(gene_labels[gene_counter])
	row_genes.append(gene_labels[gene_counter])
       	row_table.append((';').join([(',').join([str(np.round_(value,3)) for value in row]) for row in vals]))

	def assign_id(index): 
		if (int(index) >=1): 
			return str(gene_labels[int(index)-1]) 
		else:
			 return '-1'

	row_genes.append((';').join([(',').join(map(assign_id,row)) for row in genes]))

	#print row_table
	table_out.write(('\t').join(row_table) + '\n')
	genes_out.write(('\t').join(row_genes) + '\n')
	cells_out.write(('\n').join(cells) + '\n')
	gene_counter+=1
data_in.close()

#for j in range(num_cells):
#	cells_out.write(('\t').join([str(j),(';').join(cells[j])]) + '\n')


table_out.close()
genes_out.close()
cells_out.close()
