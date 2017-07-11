# -*- coding: utf-8 -*-
"""此模块通过调用GraphUtil和Serializer提供查询入口的底层函数"""
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
    """
    综合调用先前写好的模块进行查询并返回结果，需要注意，为了节约服务器内存，使用了yield直接返回neo4j-driver返回的每一行数据，因此无法归类，需要用户得到数据后进行处理
    :params conditions: 用户请求中的conditions
    :params targets: 用户请求中的targets
    :params enable_graph: 返回图数据或者需求数据
    :yield serial后的每一行数据
    """
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
