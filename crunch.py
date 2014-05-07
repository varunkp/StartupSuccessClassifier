import requests
import time
import pandas as pd
import os
from bs4 import BeautifulSoup
import simplejson
import json
#import html2text


api_key = 'ndcq6rwvpenbagu7p9rkxpw6'

#currentDir = os.path.dirname(os.path.abspath(__file__))
#print currentDir

data['overview'] = " "
data['tag_list'] = " "
data["image1"] = " "
data["image2"] = " "
data["image3"] = " "
data["number_of_employees"] = " "
data["office_latitude"] = " "
data["office_longitude"] = " " 

row = -1

initial = time.time()
for company in data['name'][row+1:]:
  row = row+1

  company = unicode(company, errors='ignore')
  #company = "Illumix Software"

  startGET = time.time()
  
  url1 = 'http://api.crunchbase.com/v/1/company/'+company+'.js?api_key='+api_key
  r = requests.get(url1)
  if (r.status_code!= 200) or r.text is None:
    continue

  #print r.text
  try:
    returned_json = json.loads(r.text, strict= False)
  except ValueError:
    continue

  #returned_json = r.json()
  #print returned_json

  if 'error' in returned_json:
    continue

  '''  
  l = ['overview','tag_list','number_of_employees']
  for jsonKey in l:
    if returned_json[jsonKey] is None:
      continue
    data[jsonKey][row] = returned_json[jsonKey]
    
  if returned_json["image"] is not None and "image" in returned_json and len(returned_json["image"])>0:
    data["image1"][row] =returned_json["image"]["available_sizes"][0][1]
    data["image2"][row] =returned_json["image"]["available_sizes"][1][1]
    data["image3"][row] =returned_json["image"]["available_sizes"][2][1]

  if len(returned_json["offices"])>0 and returned_json["offices"] is not None:
    data["office_latitude"][row] = returned_json["offices"][0]["latitude"]
    data["office_longitude"][row] = returned_json["offices"][0]["longitude"]

  endGET = time.time()
  print company + " took " + str((endGET-startGET))

  '''

  
  if returned_json["overview"] is not None:   # and "overview" in returned_json
    
    cleanedHTML= BeautifulSoup((''.join(returned_json["overview"])))

    #text = html2text.html2text(cleanedHTML)
    #text = html2text.html2text(returned_json["overview"])
    #print cleanedHTML  
    data['overview'][row] = cleanedHTML


  if returned_json["tag_list"] is not None: # and "tag_list" in returned_json
    data['tag_list'][row] = returned_json["tag_list"]

  if returned_json["number_of_employees"] is not None: # and "number_of_employees" in returned_json
    data["number_of_employees"][row] = returned_json["number_of_employees"]

  if returned_json["image"] is not None and "image" in returned_json and len(returned_json["image"])>0:
    data["image1"][row] =returned_json["image"]["available_sizes"][0][1]
    data["image2"][row] =returned_json["image"]["available_sizes"][1][1]
    data["image3"][row] =returned_json["image"]["available_sizes"][2][1]

  if len(returned_json["offices"])>0 and returned_json["offices"] is not None: # and "offices" in returned_json
    data["office_latitude"][row] = returned_json["offices"][0]["latitude"]
    data["office_longitude"][row] = returned_json["offices"][0]["longitude"]

  endGET = time.time()
  print company + " took " + str((endGET-startGET))

  if row == 20000:
    end20000 = time.time()
    print "20,000 companies took" + str(end20000-initial)

  data.to_csv('32729_34999_MASTER.csv')

  
final = time.time()
print "All companies took" + str(final-initial)

