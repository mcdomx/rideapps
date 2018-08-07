from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse, reverse_lazy
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.views import generic
from django import forms
from django.contrib.auth.models import User
from .models import Comment, Review, Route, Ride
from django.core.exceptions import MultipleObjectsReturned
import json
from datetime import datetime, date

def index(request):
    upcoming_rides = Ride.objects.filter(ride_date__gte = datetime.now()).order_by('ride_date')

    if request.user.is_authenticated:
        unconfirmed_rides = Ride.objects.filter(ride_date__gte = datetime.now()).filter(invited_riders__in=[request.user]).all()
    else:
        unconfirmed_rides = None

    context = {
        'upcoming_rides': upcoming_rides,
        'unconfirmed_rides': unconfirmed_rides,
        }
    return render(request, "groupride/index.html", context)


def create_ride(request):
    if request.user.is_authenticated:
        routes = Route.objects.values('id', 'route_name','miles','vertical_feet')
        users = User.objects.all()
        context = {
            'status': 'success',
            'routes': routes,
            'users': users,}
        return render(request, "groupride/create_ride.html", context)

    else:
        context = {
            'status': False
            }

    return render(request, "groupride/create_ride.html", context)


def create_route(request):
    if request.user.is_authenticated:
        context = {
            'status': 'success'
        }
    else:
        context = {
            'status': False
        }

    return render(request, "groupride/create_route.html", context)


def login(request):
    context = {}
    return render(request, "groupride/login.html", context)


def ride(request,ride_id):
    ride = Ride.objects.get(pk = ride_id)
    context = {
        "ride": ride,
    }
    return render(request, "groupride/ride.html", context)


def route(request, route_id):
    try:
        route = Route.objects.get(pk = route_id)
        context = {
            "route": route,
            "ratings": Review.RATINGS,
        }
        return render(request, "groupride/route.html", context)

    except Route.DoesNotExist:
        raise Http404('No such route exists. Sorry.')



def get_reviews(request):
    route_id = request.POST.get("route_id")
    route = Route.objects.get(pk = route_id)
    reviews = route.reviews.all()

    reviews_dict = {}
    for r in reviews:
        if r.user.first_name is None or r.user.last_name is None:
            user_text = f'{r.user.username}'
        else:
            user_text = f'{r.user.first_name[0]}. {r.user.last_name}'

        reviews_dict[r.id] = {
            "user": user_text,
            "date": r.date,
            "text": r.text,
            "rating": r.rating
        }

    context = {
        "reviews": reviews_dict,
        "ratings": Review.RATINGS,
    }

    return JsonResponse(context)


def add_review(request):
    route_id = request.POST.get("route_id")
    rating = request.POST.get("rating")
    text = request.POST.get("text")
    date = datetime.now()
    user = request.user

    new_review = Review()
    new_review.rating = rating
    new_review.text = text
    new_review.date = date
    new_review.user = user
    new_review.save()

    route = Route.objects.get(pk = route_id)
    route.reviews.add(new_review)
    route.save()

    context = {
        "success": True,
    }

    return JsonResponse(context)

def add_comment(request):
    ride_id = request.POST.get("ride_id")
    text = request.POST.get("text")
    date = datetime.now()
    user = request.user

    new_comment = Comment()
    new_comment.text = text
    new_comment.date = date
    new_comment.user = user
    new_comment.save()

    ride = Ride.objects.get(pk = ride_id)
    ride.comments.add(new_comment)
    ride.save()

    context = {
        "success": True,
    }

    return JsonResponse(context)



def rides(request):
    upcoming_rides = Ride.objects.filter(ride_date__gte = datetime.now()).order_by('ride_date')
    past_rides = Ride.objects.filter(ride_date__lt = datetime.now()).order_by('ride_date').reverse()

    context = {
        'upcoming_rides': upcoming_rides,
        'past_rides': past_rides,
        }
    return render(request, "groupride/rides.html", context)


# change the user's confirmation status for a group ride
def toggle_confirmation(request):
    ride_id = request.POST.get("ride_id")
    ride = Ride.objects.get(id = ride_id)

    user_id = request.POST.get("user_id")
    user = User.objects.get(username = user_id)

    #value is True if user is a confirmed rider, otherwise it is false
    rider_confirmed = ride.confirmed_riders.filter(username = user_id).exists()

    if rider_confirmed:
        ride.confirmed_riders.remove(user)
    else: # rider is not confirmed
        ride.confirmed_riders.add(user)

    #get updated confirmation status
    rider_confirmed = ride.confirmed_riders.filter(username = user_id).exists()

    context = {
        "confirmed": rider_confirmed
    }

    return JsonResponse(context)

# serve routes.html page with list of routes to be used in templating
def routes(request):
    routes = Route.objects.values('id', 'route_name', 'origin', 'miles','vertical_feet')
    context = {'routes': routes,}
    return render(request, "groupride/routes.html", context)





# create a new group ride
def create_new_ride(request):
    ride_name = request.POST.get("ride_name")
    rd = []
    rd = request.POST.get("ride_date").split(',')

    ride_date = datetime(int(rd[0]), int(rd[1]), int(rd[2]), int(rd[3]), int(rd[4]))

    route_id = request.POST.get("route_id")

    pr = request.POST.get("private_ride")
    if pr == 'true':
        private_ride = True
    else:
        private_ride = False

    invited_rider_list = request.POST.get("invited_rider_list")
    rider_list = invited_rider_list.split(',')

    # see if a ride with the given name on the same day already exists
    try:
        Ride.objects.get(   ride_name = ride_name,
                            ride_date__year = ride_date.year,
                            ride_date__month = ride_date.month,
                            ride_date__day = ride_date.day)
        context = {
            'success': False,
            'headline': "Sorry! ",
            'message': f"A ride with the name '{ride_name}' already exists on '{ride_date}'. Choose a new route name."
        }
        return JsonResponse(context)

    # if a route with smae name on same day doesn't exist, the create it
    except Ride.DoesNotExist as e:
            new_ride = Ride()
            new_ride.created_by = request.user
            new_ride.created_on = datetime.now()
            new_ride.ride_name = ride_name
            new_ride.ride_date = ride_date
            new_ride.route_id = route_id
            new_ride.private = private_ride
            new_ride.save()
            if private_ride:
                for rider in rider_list:
                    r = User.objects.get(username = rider)
                    new_ride.invited_riders.add(r)

            context = {
                'success': True,
                'headline': "Ride created! ",
                'message': f"'{ride_name}' by '{request.user}'.  Check back later to see who is coming!"
            }

            return JsonResponse(context)

# return comments for ride
def get_ride_comments(request):
    ride_id = request.POST.get("ride_id")
    ride = Ride.objects.get(pk = ride_id)
    comments = ride.comments.all()

    comments_dict = {}
    for r in comments:
        if r.user.first_name is None or r.user.last_name is None:
            user_text = f'{r.user.username}'
        else:
            user_text = f'{r.user.first_name[0]}. {r.user.last_name}'

        comments_dict[r.id] = {
            "user": user_text,
            "user_id": r.user.username,
            "date": r.date,
            "text": r.text,
        }

    context = {
        "comments": comments_dict,
    }

    return JsonResponse(context)

# return a dictionary of user confirmed for a ride with {username: first initial. lastname}
def get_confirmed_riders(request):
    ride_id = request.POST.get("ride_id")
    ride = Ride.objects.get(pk = ride_id)
    confirmed_riders = ride.confirmed_riders.all()

    context = {}
    for r in confirmed_riders:
        if r.user.first_name is None or r.user.last_name is None:
            user_text = f'{r.user.username}'
        else:
            user_text = f'{r.user.first_name[0]}. {r.user.last_name}'

        context[r.username] = user_text

    return JsonResponse(context)


# check if route already exists and create it if it does not
def create_new_route(request):

    route_name = request.POST.get("route_name")
    miles = request.POST.get("miles")
    vertical_feet = request.POST.get("vertical_feet")
    origin = request.POST.get("origin")
    gpxfile = request.FILES['gpxfile']

    print(gpxfile)

    # see if a route with the given name already exists
    try:
        Route.objects.get(route_name = route_name)
        context = {
            'success': False,
            'headline': "Sorry! ",
            'message': f"A route with the name '{route_name}' already exists. Choose a new route name."
        }
        return JsonResponse(context)

    # if the route with the name doesn't exists then create it
    except Route.DoesNotExist as e:
        new_route = Route()
        new_route.created_by = request.user
        new_route.created_on = datetime.now()
        new_route.route_name = route_name
        new_route.miles = float(miles)
        new_route.vertical_feet = int(vertical_feet)
        new_route.origin = origin
        new_route.gpxfile = gpxfile
        new_route.save()

        context = {
            'success': True,
            'headline': "Route created! ",
            'message': f"'{route_name}' by '{request.user}'"
        }

        return JsonResponse(context)


# START User registration form
class RegistrationForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    last_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    email = forms.EmailField(max_length=254, help_text='Required.')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2', )

class Register(generic.CreateView):
    form_class = RegistrationForm
    success_url = reverse_lazy('login')
    template_name = 'registration/register.html'
# END User Registration Form
