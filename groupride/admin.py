from django.contrib import admin
from .models import Comment, Review, Route, Ride


class ReviewAdmin(admin.ModelAdmin):
	list_display = ('date','user','rating')  #field will be displayed in column
	list_filter = ('date','user','rating')  #will allow items to be filtered

admin.site.register(Review, ReviewAdmin)

class CommentAdmin(admin.ModelAdmin):
	list_display = ('date','user')  #field will be displayed in column
	list_filter = ('date','user')  #will allow items to be filtered

admin.site.register(Comment, CommentAdmin)

class RouteAdmin(admin.ModelAdmin):
	list_display = ('id', 'route_name', 'created_by', 'miles', 'vertical_feet', 'origin')  #field will be displayed in column
	list_filter = ('created_by', 'miles', 'vertical_feet')  #will allow items to be filtered

admin.site.register(Route, RouteAdmin)

class RideAdmin(admin.ModelAdmin):
	list_display = ('id', 'ride_name', 'created_by','created_on', 'ride_date', 'private')  #field will be displayed in column
	list_filter = ('created_by','created_on', 'ride_date', 'private')  #will allow items to be filtered

admin.site.register(Ride, RideAdmin)
