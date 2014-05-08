import re
import math

test_query = "peanut butter, hardware, successful"
test_companies_list = [ 
						{'name': 'apple', 'tag_list': ['big, consumer, successful, hardware']},
						{'name': 'facebook', 'tag_list': ['big, mobile, successful, app, software']},
						{'name': 'amazon', 'tag_list': ['big, successful, books']},
						{'name': 'palantir', 'tag_list': ['big, successful, software']},
						{'name': 'skippy', 'tag_list': ['peanut butter, smooth, creamy, crunchy']}
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

tl = test_companies_list[4]['tag_list']
tl_string = ' '.join(map(str, tl))
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


idfs = find_idfs(test_companies_list)
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
        company_tags_string = ' '.join(map(str, company_tags))
        # print company_tags_string
        #relevances[company_name] = 100.0 * cosine_similarity(searchQuery, company_tags_string, idfs)
        #return relevances
        company["relevance"] = 100.0 * cosine_similarity(searchQuery, company_tags_string, idfs)
    newList = sorted(companiesList, key=lambda k: k['relevance']) 
    return newList
	


# returned = getRelevance(test_companies_list, test_query)
# print returned

#import operator
#sorted_returned = sorted(returned.iteritems(), key=operator.itemgetter(1), reverse=True)
#print sorted_returned



