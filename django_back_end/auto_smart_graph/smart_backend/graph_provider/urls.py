# -*- coding: utf-8 -*-
from django.conf.urls import url
import graph_provider.services as services
"""为webservice分配url"""
urlpatterns = [
    url(r'^query/$', services.fetch_data),
]

