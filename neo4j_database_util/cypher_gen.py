with open('style.csv','r') as infile:
	header = infile.readline()[0:-1]
	headers = header.split(',')
	for item in headers:
		item = item.lstrip('''"''')
		item = item.rstrip('''"''')
		print item+': row.'+item+',',
	
