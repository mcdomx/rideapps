# project4
CSCI S-33a - Project 4 - GroupRide


# GroupRide

## Overview

GroupRide is an app that will allow cyclists to share cycling routes and organize group rides that can follow those routes.

Users can review routes and rate them.  When creating a route, a user can upload a GPS file (in GPX file format) which users can download when reviewing the route.  When reviewing a route, the route is displayed on a map if a GPX file was uploaded.

Users can also create organized rides.  These rides can have a route from the saved routes.  Ride organizers can choose to make rides private and invite only selected users.  When rides are private, only invited users can see these rides.  Riders can opt to join any ride, but private rides can only be joined by invited riders.

Upon login, the user is presented with a dashboard consisting of rides that the user has previously chosen to join as well as a list of rides that the user has been invited to, but has not yet confirmed.  From any place that a ride is listed, the user is presented with a button to download a GPX file if it is available.

When viewing a particular organized ride's page, the user can post comments about the ride in chat-style format.

When the admin logs in, the menu changes to that an Admin option is available.

Menus are mobile-responsible and can be viewed on mobile devices; however, the devices functionality may limit the ability to upload and download a GPX file.

A test GPX file has been included in the base directory of this project called "SAMPLEGPXFILE.gpx".

The app has been deployed to Heroku at:
https://mygroupride.herokuapp.com

(Please note that Heroku limits the amount of time that files are stored on the server, so a GPX file may become stale after a few hours and no longer be available for download.)

## Application Design
The application is built using Django and deployed using Heroku.  Locally, the app was designed using sqlite3 as a database and uses PostgreSQL on Heroku.  Bootstrap is heavily used for elements.

Pages are built using Django Templates and page functionality is driven by Javascript.  Care was taken in the design to separate front-end from back-end decisions and behavior.  Front-end functionality that is the responsibility of front-end developers is handled in JavaScript while back-end database work is handled by Python and Django. For example, Django does not drive any HTML output.

Javascript is separated into files for each page on the site.  This was done in an effort to separate code and keep maintenance isolated to functions of the app.  

Google Maps API is used to display the map on the view route page.  The API is restricted to the published domain, so hiding the map API was not necessary.

In order to get Django templating variables into JavaScript, I used <script> tabs to capture the {{}} value in a var variable which effectively becomes a global variable in JavaScript.  The other option was to create an AJAX call to Django for the data, but since this data was already on the client side, making another call to the server seemed inefficient.  



## Database Model
The database model consists of Comments, Reviews, Ride and Route.  ManyToMany fields and ForeignKey relationships ties these tables together.

The Routes table includes a field "gpxfile".  This holds a link to an uploaded file in the "uploads/" directory.

In an effort to simplify development, all time is in EST and no support for timezones is included.


## Configuration
Secret key can be set to a local environment variable using "source ./env_variables.sh" at the command line.

Note: the Google Maps API key is not hidden per guidance from Google.  Instead, usage of the key is restricted to the published domain.


## Special Application Behavior
The app takes care to validate data and prevent errors.  For example:
- if a user is not logged in, there is no access to pages that require a user name
- data input is validated on the front-end to ensure clean data is sent to the server
- when clicking a submit of any kind, the button is disabled until a response comes back from the server to prevent the user for clicking twice out of impatience with a slow connection.
- the user can use the enter key to submit text that is being entered in a text field
- invalid selections are visibly disabled so the user can clearly see that selection is not possible
- a function was created that will load a route's GPX file data into a Google Map.


## Improvements
Some additional items that I would like to have accomplished include:
- Setting a ride's origin to the address at the lat/lon coordinates of the first point in a GPX file if a ride uses a route with a GPX file.  
- Calculating a route's distance and vertical climb statistics from the GPS file.
- email notifications when a user receives an invitation to a private ride as well as notifications to rider organizers when people opt to join a ride.
- Include average ratings for rides
