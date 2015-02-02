import json
from pprint import pprint

import urllib
import urllib2

import math

base_url = 'https://maps.googleapis.com/maps/api/geocode/json?'

json_data=open('../tourLocationSets.json')
output = open('latLons.json', 'w')

data = json.load(json_data)
for locationAreaName, locationArea in data.items():

	for location in locationArea:
		name = location['name']
		address = location['address']
		query = name if (address == '') else address

		params = {
			'address': query,
			'sensor': 'false'
		}

		url = base_url + urllib.urlencode(params)
		response = urllib2.urlopen(url).read()
		obj_response = json.loads(response)

		if len(obj_response['results']) > 0:
			location_result = obj_response['results'][0]
			coords = location_result['geometry']['location']
			
			# pprint(location_result)
			if address == '' and not location['latitude'] and not location['longitude']:
				location['address'] = location_result['formatted_address']
				location['latitude'] = coords['lat']
        location['longitude'] = coords['lng']
        location['zoomLevel'] = 18
		else:
			pprint('no results for ' + name)

output.write(json.dumps(data, sort_keys=True, indent=2))
json_data.close()
output.close()
