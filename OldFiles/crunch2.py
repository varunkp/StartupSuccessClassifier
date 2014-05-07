import requests
import time
import unicodecsv
import pandas as pd
import os




with open('test.csv','rbU') as csvinput:
  with open('test11.csv','w') as csvoutput: #files, not the readers or writers
    r = unicodecsv.reader(csvinput,)
    w = unicodecsv.writer(csvoutput)

    #r.next()


    for row in r:
      