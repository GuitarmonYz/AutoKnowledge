from SessionManager import SessionManager
from GraphUtil import GraphUtil
from django.conf import settings
from smart_backend.serializer import NodeSerializer, RelationshipSerializer, PathSerializer
from neo4j.v1 import types


MANAGER = SessionManager(settings.DB_URI, settings.DB_USERNAME, settings.DB_PASSWORD)
GRAPHUITL = GraphUtil()
def test_cypher(conditions, targets, enable_graph, enable_like):
    # cypher = GRAPHUITL.build_cypher(conditions, targets, enable_graph, enable_like)
    cypher = "Match p = (b:Brand)-[r:BELONGS_TO]->()-[:SOLD_BY]->(d:Dealer{siteid:'1'}) return b, d limit 5"
    targets = ["b", "d"]
    with MANAGER.session as session:
        records = session.run(cypher)
        for record in records:
            for key in targets:
                if isinstance(record[key], types.Node):
                    yield NodeSerializer(record[key]).data
                elif isinstance(record[key], types.Relationship):
                    yield RelationshipSerializer(record[key]).data
                elif isinstance(record[key], types.Path):
                    yield PathSerializer(record[key]).data
        
def auto_query(conditions, targets, enable_graph, enable_like):
    cypher_clause, targets = GRAPHUITL.build_cypher(conditions, targets, enable_graph, enable_like)
    node_set = set()
    relation_set = set()
    with MANAGER.session as session:
        records = session.run(cypher_clause)
        for record in records:
            for key in targets:
                if isinstance(record[key], types.Node):
                    if record[key].id not in node_set:
                        node_set.add(record[key].id)
                        yield NodeSerializer(record[key]).data
                elif isinstance(record[key], types.Relationship):
                    if record[key].id not in relation_set:
                        relation_set.add(record[key].id)
                        yield RelationshipSerializer(record[key]).data
                elif isinstance(record[key], types.Path):
                    yield PathSerializer(record[key]).data
