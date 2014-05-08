#!/usr/bin/env python

#Written by PJ


import string
import flask
from flask import request, flash, jsonify, Flask
import requests
import json
from flask.ext.restful import Resource, Api
# import relevance
import pandas as pd
import numpy as np

from datetime import timedelta
from flask import make_response, request, current_app
from functools import update_wrapper


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers

            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

#from flask.ext.cors import origin

'''
try:
  import flask_cors.origin # support local usage without installed package
  print "1st"
except:
   # this is how you would normally import
  print "2nd"
'''


application = flask.Flask(__name__)
app = application
app.secret_key = 'some_secret'
app.debug = True
api = Api(app)

#api.decorators=[cors.crossdomain(origin='*')]

api_key = 'ndcq6rwvpenbagu7p9rkxpw6'
#user_key = '41bf8e5a3861db3fd954d9b31ca64e36'

numResults = 20
relevance_threshhold = 0
#returned_json = {}

fn = 'data/master_all.csv'
data = pd.read_csv(fn,error_bad_lines=False)

class SearchAPI(Resource):
  def post(self):
        restQuery = request.form['restQuery']
        print restQuery
        response= searchAPI(restQuery)
        return response
        #response = make_response(response) 
        #response.headers['Access-Control-Allow-Origin'] = "*" return response
#api.add_resource(TodoSimple, '/<string:todo_id>')
#api.add_resource(SearchAPI, '/api')
api.add_resource(SearchAPI, '/searchAPI')

@app.route('/searchAPI', methods=['POST','GET'])
@crossdomain(origin='*')
def searchAPI(restQuery):
  
  if 'searchTerm' in request.form:
    print "rest API"
    searchTerm = request.form['searchTerm']
  else:
    searchTerm = restQuery 
  
  if 'category_code' in request.form:
    category_code = request.form['category_code']
  else:
    category_code = 'all'
  
  #Generate A JSON Object of Most Relevant Result
  companiesList = getCompaniesList(searchTerm, numResults, category_code)
  results = getResults(companiesList)
  sortedResults = getListSortedByRelevance(results,searchTerm)
  
  #return flask.render_template(
   #         'results.html',searchTerm=searchTerm,results=results)
  #return flask.jsonify(results)
  return json.dumps(sortedResults, ensure_ascii=False)


def getCategory_codes():
  category_codes=list(data.columns.values)
  return category_codes

@app.route('/', methods=['GET'])
def home():  
  cc = getCategory_codes()
  return flask.render_template(
            'home.html',list=cc)

@app.route('/home', methods=['GET'])
def stuff():
  return home()


@app.route('/search', methods=['POST','GET'])
def search():

  if 'searchTerm' in request.form:
    print "rest API"
    searchTerm = request.form['searchTerm']
  else:
    searchTerm = restQuery 
  
  if 'category_code' in request.form:
    category_code = request.form['category_code']
  else:
    category_code = 'all'
  
  #Generate A JSON Object of Most Relevant Result
  companiesList = getCompaniesList(searchTerm, numResults, category_code)
  results = getResults(companiesList)
  sortedResults = getListSortedByRelevance(results,searchTerm)
  
  return flask.render_template(
   'results.html',searchTerm=searchTerm,results=results)
  #return flask.jsonify(results)
  #return json.dumps(sortedResults, ensure_ascii=False)

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

        combined_results.append(individual_company)

  return combined_results


fn_rel = 'data/relevant_master_all.csv'
data_rel = pd.read_csv(fn_rel, error_bad_lines=False, header=0)
d = data_rel.applymap(lambda x: np.nan if isinstance(x, basestring) and x.isspace() else x)
data_all_cleansed = d.fillna('a')

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


idfs = find_idfs(companiesList)
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

def getTagListFromPandas(companyName):
  locate_row = data_all_cleansed[data_all_cleansed['name'] == companyName]
  tl = locate_row['tag_list'].tolist()
  tl_string = ' '.join(map(str, tl))
  return [str(tl_string)]

  #VARUN IMPLEMENT THIS SHIZ
  #inputs company name as a string
  #outputs company's tag list as a python list/whatever form you need for your relevance score 

def getListSortedByRelevance(companiesList,searchQuery):
  return getRelevance(companiesList, searchQuery)

def getResults(companiesList):
  i = 1

  for companyDict in companiesList:
    companyDict['founded_year'] = 1950+ 10*i
    i = i+1
    #companyDict["image1"] = data[ data["name"] == companyDict["name"]]["image1"]
    #print companyDict["image1"]
  return companiesList

def error():
  print "OH SHI ERROR"

@app.errorhandler(404)
def page_not_found(e):
    return flask.render_template('404.html'), 404

def getTEST(company):
  companyAPI = 'http://api.crunchbase.com/v/1/company/'+company+'.js?api_key='+api_key
  r = requests.get(companyAPI)
  if (r.status_code!= 200) or r.text is None:
    error()
  returned_json = json.loads(r.text, strict= False)

if __name__ == "__main__":
    app.run('0.0.0.0')
    #app.run(port=int(63046))
    #app.run(port=int(environ['FLASK_PORT']))
    #app.run()

