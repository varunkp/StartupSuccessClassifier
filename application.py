#!/usr/bin/env python

#Written by PJ


import string
import flask
from flask import request, flash, jsonify
import pandas as pd
import requests
import json
from os import environ
from flask.ext.restful import Resource, Api
import relevance

application = flask.Flask(__name__)
app = application
app.secret_key = 'some_secret'
app.debug = True
api = Api(app)
api_key = 'ndcq6rwvpenbagu7p9rkxpw6'
#user_key = '41bf8e5a3861db3fd954d9b31ca64e36'

numResults = 20
relevance_threshhold = 0
#returned_json = {}

fn = 'data/0_10000_MASTER.csv'
data = pd.read_csv(fn,error_bad_lines=False)

class Search(Resource):
  def get(self):
        restQuery = request.form['restQuery']
        return hello(restQuery)
#api.add_resource(TodoSimple, '/<string:todo_id>')
api.add_resource(Search, '/search2')

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

@app.route('/hello', methods=['POST','GET'])
def hello(restQuery):
  
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

def getTagListFromPandas(companyName):
  #VARUN IMPLEMENT THIS SHIZ
  #inputs company name as a string
  #outputs company's tag list as a python list/whatever form you need for your relevance score 
  return ["bob","the","builder"]

def getListSortedByRelevance(companiesList,searchQuery):
  return relevance.getRelevance(companiesList, searchQuery)

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
