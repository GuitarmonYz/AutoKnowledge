"""doc"""
from neo4j.v1 import GraphDatabase
from neo4j.v1 import types
import requests
def connect_test():
    """a test function for connect neo4j server using official driver"""
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "root"))
    with driver.session() as session:
        result = session.run("Match p = (b:Brand)-[r:BELONGS_TO]->(m:Masterbrand)-[:SOLD_BY]->(d:Dealer{siteid:'1'}) return p, r, b, d limit 5")
        for item in result:
            print item['p']
            if isinstance(item['p'], types.Path):
                print 'y'

def request_test():
    url = 'http://localhost:7474/db/data/transaction/commit'
    headers = {'Content-Type':'Application/json', 'Authorization':'Basic bmVvNGo6cm9vdA=='}
    data = {"statements" : \
    [{"statement" : "match (a)-[r]->(b) return distinct labels(a),labels(b), type(r)"}]}
    response = requests.post(url, json=data, headers=headers)
    raw_json = response.json()
    for relationship in raw_json['results'][0]['data']:
        pass

def set_test():
    a = set()
    a.add(1)
    print a.add(1)

set_test()
# connect_test()
