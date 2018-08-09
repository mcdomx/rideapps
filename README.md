
# GroupRide (project 4)
CSCI S-33a - Project 4 - GroupRide

## Overview

### Summary of Features
- Secure user authentication and registration process.
- Users can create routes with optional GPS file. (only GPX file format is supported)
- Viewing a route with a GPS file presents a map with the route overlay from the GPS file.
- Users can download the GPS file directly from the View Route page by clicking the "download GPX file" button.
- Riders can leave a written review a route and give it a rating.
- Users can create a ride event where any other user can "sign up" and indicate their attendance.  A ride can also "unjoin" a previously joined ride.
- Ride's can be marked as "private" where selected riders can be invited.  Only invited riders can see private rides that they are invited to.
- Riders can post chat-style comments on ride events where others can see the comments and join the chat.
- A dashboard for riders to see events they have joined as well as unconfirmed invitations to rides.
- When an admin user logs in, an "Admin" menu item is available that links to database administration.

### Description
GroupRide is an app that will allow cyclists to share cycling routes and organize group rides that can follow those routes.

Users can review routes and rate them.  When creating a route, a user can upload a GPS file (in GPX file format) which users can download when reviewing the route.  When reviewing a route, the route is displayed on a map if a GPX file was uploaded.

Users can also create organized rides.  These rides can have a route from the saved routes.  Ride organizers can choose to make rides private and invite only selected users.  When rides are private, only invited users can see these rides.  Riders can opt to join any ride, but private rides can only be joined by invited riders.  Ride organizers are auto-confirmed for any ride they create.

Upon login, the user is presented with a dashboard consisting of rides that the user has previously chosen to join as well as a list of rides that the user has been invited to, but has not yet confirmed.  From any place that a ride is listed, the user is presented with a button to download a GPX file if it is available.

When viewing a particular organized ride's page, the user can post comments about the ride in chat-style format.

When the admin logs in, the menu changes to that an Admin option is available.

Menus are mobile-responsible and can be viewed on mobile devices; however, the devices functionality may limit the ability to upload and download a GPX file.

A test GPX file has been included in the base directory of this project called "SAMPLEGPXFILE.gpx".

The app has been deployed to Heroku at:
https://mygroupride.herokuapp.com

(Please note that Heroku limits the amount of time that files are stored on the server, so a GPX file may become stale after a few hours and no longer be available for download.)



## Application Design
The application is built using Django and deployed using Heroku.  Locally, the app was designed using sqlite3 as a database and uses PostgreSQL on Heroku.  Bootstrap is heavily used for page formatting and behavior.

Pages are built using Django Templating and page functionality is driven by Javascript.  Care was taken in the design to separate front-end from back-end decisions and behavior.  Front-end functionality that is the responsibility of front-end developers is handled in JavaScript while back-end database work is handled by Python and Django. For example, Django does not drive any HTML output.

Javascript is separated into files for each page on the site.  This was done in an effort to separate code and keep maintenance isolated to functions of the app.  Some code duplication exists, as a result; however, I felt this was better than a single JavaScript file that contained a large amount of code for all the pages.  

The Google Maps API is used to display the map on the view route page.  Routes are displayed on maps.  This is done by sending a request to the server in order to get the GPX file's latitude and longitude points in the file.  Back on the client side, the points are added to a polygon which is added to the map.

In order to get Django templating variables into JavaScript, I used <script> tags to capture the {{}} value in a var variable which effectively becomes a global variable in JavaScript.  The other option was to create an AJAX call to Django for the data, but since this data was already on the client side, making another call to the server seemed inefficient.  

### Google API Key
The Google API is restricted centrally to the published domain, so hiding the map API was not necessary.  Despite this, I still tried to hide it and left the code in that I developed.  



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
- Create map route polygons on the server and send the polygon to the client instead of all of the route points and letting the client draw the polygon


## Summary
In general, this project went better than I expected.  I was very happy to get the Google Maps working with the route.  This was tricky, but was worth the effort.  I initially intended to use the Strava API, but after researching it further, it did not provide the functions that I expected.  I was careful to plan my effort, with daily checklists and action items to make sure I stayed on track.  There is more functionality that could be added, but in general, I am very happy with the result.
