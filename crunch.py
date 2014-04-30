import requests
import time
'''
r = requests.get('http://warm-dawn-6399.herokuapp.com/diagnosis')
rj= r.json()
print rj['diagnosisText']
'''

api_key = 'ndcq6rwvpenbagu7p9rkxpw6'
COMP_NAME='microsoft'
start = time.time()
print start
#r = requests.get('http://api.crunchbase.com/v/1/company/box.js?api_key=ndcq6rwvpenbagu7p9rkxpw6')
url1 = 'http://api.crunchbase.com/v/1/company/'+COMP_NAME+'.js?api_key='+api_key
url2 = 'http://api.crunchbase.com/v/1/companies/permalink?name='+COMP_NAME+'&api_key='+api_key

returned_json = requests.get(url1).json()

end1 = time.time()
print end1

print returned_json['image']['available_sizes']
#print returned_json['crunchbase_url']
end = time.time()

print end1 - start
print end - start

#category_code
'''
json does not have 
company_region
company_category
'''