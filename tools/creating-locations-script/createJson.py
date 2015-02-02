from __future__ import print_function

input = open('leadOrganizations.txt', 'r')
output = open('something.json', 'w')

for line in input:
	lineWithoutLineBreak = line.replace('\n', '')
	print('{')
	print('\"name\": \"' + lineWithoutLineBreak + '\",')
	print('\"address\": \"\",')
	print('\"thumbnail\": \"\",')
	print('\"altitude\": 0,')
	print('\"latitudeOffset\": 0,')
	print('\"longitudeOffset\": 0')
	print('},')

input.close()
output.close()