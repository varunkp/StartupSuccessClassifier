import re
import math
import string
import flask
from flask import request, flash, jsonify, Flask
import requests
import json
from flask.ext.restful import Resource, Api
import relevance
import pandas as pd
import numpy as np
import html2text

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper

application = flask.Flask(__name__)
app = application
app.secret_key = 'some_secret'
app.debug = True
api = Api(app)

#api.decorators=[cors.crossdomain(origin='*')]

api_key = 'ndcq6rwvpenbagu7p9rkxpw6'

fn_rel = 'data/master_all.csv'
data_rel = pd.read_csv(fn_rel, error_bad_lines=False, header=0)
d = data_rel.applymap(lambda x: np.nan if isinstance(x, basestring) and x.isspace() else x)
data_all_cleansed = d.fillna('a')

# print data_all_cleansed['tag_list'].head()
# print data_all_cleansed['overview'].head()

def getTagListFromPandas(companyName):
  locate_row = data_all_cleansed[data_all_cleansed['name'] == companyName]
  tl = locate_row['tag_list'].tolist()
  tl_string = ' '.join(map(str, tl))
  return [str(tl_string)]

def getOverviewFromPandas(companyName):
    # companyName = unicode(companyName, errors='ignore')
    locate_row = data_all_cleansed[data_all_cleansed['name'] == companyName]

    # tl = str(locate_row['tag_list'])
    # print type(tl)
    ov = str(locate_row['overview'])
    # ov = locate_row['overview'].tolist()
    # print ov_str
    ov = unicode(ov, errors='ignore')
    ov_string = ' '.join(map(str, ov))

    return str(html2text.html2text(ov))

def getListSortedByRelevance(companiesList,searchQuery):
  return relevance.getRelevance(companiesList, searchQuery)

def getCompaniesList(query,num,category_code):
  combined_results = []
  for page in range(1,num/10):
    searchAPI = 'http://api.crunchbase.com/v/1/search.js?query='+query+'&page='+str(page)+'&api_key='+api_key
    r = requests.get(searchAPI)
    if (r.status_code!= 200) or r.text is None:
      continue

    returned_json = json.loads(r.text, strict= False)
    

    for resultNum in range(0,len(returned_json["results"])-1):
      individual_company = {}
      
      if "namespace" in returned_json["results"][resultNum] \
      and returned_json["results"][resultNum]["namespace"] == "company":
        company = returned_json["results"][resultNum]
        print resultNum
        
        individual_company["name"]=company["name"]

        if "image" in company and company["image"] is not None:
          img = company["image"]["available_sizes"][0][1]
          print img
          individual_company["image"] = img
          #individual_company["image1"]= company["image"]["available_sizes"][0][1]
        else:
          individual_company["image"] = None

        individual_company["tag_list"] = getTagListFromPandas(individual_company["name"])
        individual_company["overview"] = getOverviewFromPandas(individual_company["name"])


        combined_results.append(individual_company)

  return combined_results


searchTerm = 'data'
numResults = 20
category_code = 0
companiesList = getCompaniesList(searchTerm, numResults, category_code)

test_query = "peanut butter, hardware, successful"
test_companies_list = [ 
						{'name': 'apple', 'tag_list': ['big, consumer, successful, hardware'], 'overview': 'I am a camper'},
						{'name': 'facebook', 'tag_list': ['big, mobile, successful, app, software'], 'overview': 'I am a walrus'},
						{'name': 'amazon', 'tag_list': ['big, successful, books'], 'overview': 'I am a John Lennon'},
						{'name': 'palantir', 'tag_list': ['big, successful, software'], 'overview': 'I am a Beatle'},
						{'name': 'skippy', 'tag_list': ['peanut butter, smooth, creamy, crunchy'], 'overview': 'I am a peanut'}
						]

# for c in test_companies_list:
# 	for t in c['tag_list']:
# 		print t

# print test_companies_list

DATA_PATH = './'

def load_lines(path):
    with open("%s/%s" % (DATA_PATH, path)) as f:
        return [line.rstrip('\r\n') for line in f]

STOPWORDS_PATH = "stopwords.txt"
stopwords = set(load_lines(STOPWORDS_PATH)) 

split_regex = r'\W+'


def simple_tokenize(string):
    return [t for t in re.split(split_regex, string.lower()) if len(t)]


# print simple_tokenize(
# print simple_tokenize(test_query)

def tokenize(string):
    return [t for t in simple_tokenize(string) if t not in stopwords]

# print tokenize(tl_string)
# print tokenize(test_query)

def tf(tokens):
    counts = {}
    for t in tokens:
        counts.setdefault(t, 0.0)
        counts[t] += 1
    return { t: counts[t] / len(tokens) for t in counts }

def find_idfs(companiesList):
    counts = {}
    for companyDict in companiesList:
        seen = set()
        tl = companyDict['tag_list']
        tl_string = ' '.join(map(str, tl))
        tokenized_tl = tokenize(tl_string)
        for t in tokenized_tl:
            if t not in seen:
                counts.setdefault(t, 0.0)
                counts[t] += 1
                seen.add(t)
    return { t: float(len(companiesList)) / counts[t] for t in counts }

def find_idfs_overview(companiesList):
    counts = {}
    for companyDict in companiesList:
        seen = set()
        tl = companyDict['overview']
        # tl_string = ' '.join(map(str, tl))
        tokenized_tl = tokenize(tl)
        for t in tokenized_tl:
            if t not in seen:
                counts.setdefault(t, 0.0)
                counts[t] += 1
                seen.add(t)
    return { t: float(len(companiesList)) / counts[t] for t in counts }

companiesList = test_companies_list
# idfs = find_idfs(companiesList)
idfs = find_idfs_overview(companiesList)

print idfs
# print idfs

def tfidf(tokens, idfs):
    tfs = tf(tokens)
    # print tfs
    return { t: tfs[t] * idfs[t] if t in tfs and t in idfs else 0 for t in tfs }

# test_weights = tfidf(tokenize(test_query), idfs)
# print test_weights


def dotprod(a, b):
    return sum([a[t] * b[t] for t in a if t in b])

def norm(a):
    return math.sqrt(dotprod(a, a))

def cossim(a, b):
	if norm(a) != 0 and norm(b) != 0:
		return dotprod(a, b) / norm(a) / norm(b)
	else:
		return 0

def cosine_similarity(string1, string2, idfs):
    w1 = tfidf(tokenize(string1), idfs)
    w2 = tfidf(tokenize(string2), idfs)
    return cossim(w1, w2)

# print cosine_similarity(tl_string, test_query, idfs)

# print cosine_similarity(test_query, "peanut butter and jelly sandwich hardware", idfs)

def getRelevance(companiesList,searchQuery):
    relevances = {}
    for company in companiesList:
        company_name = company['name']
        company_tags = company['tag_list']
        print company_tags
        company_tags_string = ' '.join(map(str, company_tags))
        print company_tags_string
        # print company_tags_string
        #relevances[company_name] = 100.0 * cosine_similarity(searchQuery, company_tags_string, idfs)
        #return relevances
        company["relevance"] = 100.0 * cosine_similarity(searchQuery, company_tags_string, idfs)
    newList = sorted(companiesList, key=lambda k: k['relevance']) 
    return newList
	
def getRelevanceByOverview(companiesList,searchQuery):
    relevances = {}
    for company in companiesList:
        company_name = company['name']
        company_ov = company['overview']
        company_ov_string = ' '.join(map(str, company_ov))
        # print company_tags_string
        #relevances[company_name] = 100.0 * cosine_similarity(searchQuery, company_tags_string, idfs)
        #return relevances
        company["relevanceByOverview"] = 100.0 * cosine_similarity(searchQuery, company_ov_string, idfs)
    newList = sorted(companiesList, key=lambda k: k['relevanceByOverview']) 
    return newList


# returned = getRelevance(test_companies_list, test_query)
# print returned

#import operator
#sorted_returned = sorted(returned.iteritems(), key=operator.itemgetter(1), reverse=True)
#print sorted_returned



