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


def API_test():

  #company = unicode(company, errors='ignore')
  company = "Minerva Surgical"
  query = 'fun'

  startGET = time.time()

  url1 = 'http://api.crunchbase.com/v/1/company/'+company+'.js?api_key='+api_key
  url2 = 'http://api.crunchbase.com/v/1/search.js?query='+query+'&page=1&api_key='+api_key

  r = requests.get(url2)
  if (r.status_code!= 200) or r.text is None:
    return

  #print r.text
  try:
    returned_json = json.loads(r.text, strict= False)
  except ValueError:
    return

  #returned_json = r.json()
  #print returned_json

  if 'error' in returned_json:
    return

  #print returned_json["results"][1]
  for i in range (1,10):
    if "namespace" in returned_json["results"][i] \
    and returned_json["results"][i]["namespace"] == "company":
      print returned_json["results"][i]["name"]

if __name__ == '__main__':
    API_test()