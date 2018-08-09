from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("create_ride/", views.create_ride, name="create_ride"),
    path("create_new_route", views.create_new_route, name="create_new_route"),
    path("create_new_ride", views.create_new_ride, name="create_new_ride"),
    path("create_route/", views.create_route, name="create_route"),
    path("get_reviews", views.get_reviews, name="get_reviews"),
    path("get_ride_comments", views.get_ride_comments, name="get_ride_comments"),
    path("toggle_confirmation", views.toggle_confirmation, name="toggle_confirmation"),
    path("get_confirmed_riders", views.get_confirmed_riders, name="get_confirmed_riders"),
    path("add_comment", views.add_comment, name="add_comment"),
    path("add_review", views.add_review, name="add_review"),
    path("ride/<int:ride_id>", views.ride, name="ride"),
    path("route/<int:route_id>", views.route, name="route"),
    path("rides/", views.rides, name="rides"),
    path("routes/", views.routes, name="routes"),
    path('register/', views.Register.as_view(), name='register'),
    path('get_google_api_key', views.get_google_api_key, name='get_google_api_key'),

]
