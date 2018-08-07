from django.db import models
from django.contrib.auth.models import User


class Comment(models.Model):
    # date will be initial time stamp that does not change (auto_add_now)
    date = models.DateTimeField(auto_now_add = True, editable = False, blank = False)
    text = models.CharField(max_length = 1024)
    user = models.ForeignKey(User, on_delete = models.SET_NULL, blank = True, null = True, related_name = "comments")

    def __str__(self):
        return f'{self.date:%Y-%b-%d %H:%M} {self.user}'


class Review(models.Model):

    RATINGS = (
        (None, "no rating given"),
        ('1', "Entire route is not recommended and possibly dangerous."),
        ('2', "Sections of route are not recommended."),
        ('3', "Generally accepable. Nothing Special, but safe."),
        ('4', "Good. Recommended"),
        ('5', "Outstanding!"),
    )

    # date will be initial time stamp that does not change (auto_add_now)
    date = models.DateTimeField(auto_now_add = True, editable = False, blank = False)
    text = models.CharField(max_length = 2048)
    user = models.ForeignKey(User, on_delete = models.SET_NULL, blank = True, null = True, related_name = "reviews")
    rating = models.CharField(max_length = 1, blank = True, choices = RATINGS, default = None)

    def __str__(self):
        return f'{self.date:%Y-%b-%d %H:%M} {self.user} {self.rating}'


class Route(models.Model):
    created_by = models.ForeignKey(User, on_delete = models.SET_NULL, blank = True, null = True, related_name = "created_routes")
    created_on = models.DateTimeField(auto_now_add = True, editable = False, blank = False)
    route_name = models.CharField(max_length = 256, blank = True, null = True)
    miles = models.DecimalField(max_digits = 6, decimal_places = 1, blank = True, null = True)
    vertical_feet = models.IntegerField(blank = True, null = True)
    origin = models.CharField(max_length = 64, blank = True, null = True)
    reviews = models.ManyToManyField(Review, blank = True)
    gpxfile = models.FileField(blank = True, null = True)

    def __str__(self):
        return f'{self.origin} ({self.miles} miles)'

class Ride(models.Model):
    created_by = models.ForeignKey(User, on_delete = models.SET_NULL, blank = True, null = True, related_name = "created_rides")
    created_on = models.DateTimeField(auto_now_add = True, editable = False, blank = False)
    ride_name = models.CharField(max_length = 256, blank = True, null = True)
    ride_date = models.DateTimeField(editable = True, blank = False, null = False)
    private = models.BooleanField(default = False)
    route = models.ForeignKey(Route, on_delete = models.SET_NULL, blank = True, null = True, related_name = "rides")
    confirmed_riders = models.ManyToManyField(User, related_name = "confirmed_ride")
    invited_riders = models.ManyToManyField(User, related_name = "invited_ride")
    comments = models.ManyToManyField(Comment, blank = True)

    def __str__(self):
        return f'{self.ride_date} -- {self.route}'
