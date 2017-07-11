# -*- coding: utf-8 -*-
"""This module provides the entry to web services, note that to use restframework, all functions have to be decorated by @api_view"""
from __future__ import unicode_literals

from rest_framework.decorators import api_view
from rest_framework.response import Response
from smart_backend.DBUtil import auto_query

@api_view(["POST"])
def fetch_data(request):
    """
    read user posted json requests and use recieved json params to perform query and return to user
    :param request: 用户上传的json请求，被restframework封装过一次，可通过request.data获取原始数据，注意数据已经被转化为python的数据类型而不是原始数据类型
    """
    if request.method == 'POST':
        result = auto_query(request.data['conditions'], request.data['targets'], request.data['enable_graph'], request.data['enable_like'])
    else:
        Response("must use post method to call service")
    return Response(result)
