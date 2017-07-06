# -*- coding: utf-8 -*-

from __future__ import unicode_literals

from rest_framework.decorators import api_view
from rest_framework.response import Response
from smart_backend.DBUtil import test_cypher, auto_query

@api_view(["POST"])
def fetch_data(request):
    """test service"""
    if request.method == 'POST':
        # result = test_cypher(request.data['conditions'], request.data['targets'], request.data['enable_graph'], request.data['enable_like'])
        result = auto_query(request.data['conditions'], request.data['targets'], request.data['enable_graph'], request.data['enable_like'])
        # print request.data['statements']
    # conditions = [
    #     {'type':'Brand', 'content': {'id':'1'}},
    #     {'type':'Manufacturer', 'content': {'id': '1'}}
    # ]
    # targets = [
    #     {'type':'Dealer', 'content': {'id':'1'}}
    # ]
    # targets = ["b", "d"]
    # dic = {"a":"test", "b":"test2"}
    return Response(result)
