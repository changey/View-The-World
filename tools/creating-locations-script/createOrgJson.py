from __future__ import print_function

input = open('leadOrganizations.txt', 'r')
output = open('leadOrganizations.json', 'w')

for line in input:
	lineWithoutLineBreak = line.replace('\n', '')
	print('{')
	print('\"name\": \"' + lineWithoutLineBreak + '\"')
	print('},')

input.close()
output.close()
