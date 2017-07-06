from django.conf.urls import url
import services
urlpatterns = [
    url(r'^query/$', services.fetch_data),
]