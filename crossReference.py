import requests
import time
import pandas as pd
import os
from bs4 import BeautifulSoup
import simplejson
import json
#import html2text

fn = 'server/data/0_10000_MASTER.csv'
data = pd.read_csv(fn,error_bad_lines=False)
api_key = 'ndcq6rwvpenbagu7p9rkxpw6'

#currentDir = os.path.dirname(os.path.abspath(__file__))
#print currentDir

name="23andMe"

print data[ data["name"] == name ]["image1"]

  #print data["image1"]


