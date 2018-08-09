// ########################  begin DOMContentLoaded ########################
document.addEventListener('DOMContentLoaded', () => {
  // wait till page loads before setting up javascript elements

if (authenticated == true) {
  setup_review_elements();
}

load_reviews();

});
// ########################  end DOMContentLoaded ########################

// UNUSED Function:  Attepted to hide Google Maps API key.  This code will
// still show the API key in a script tag in the page
// Hiding is determined not to be necessary.  Google MAPS is designed
// to restrict key by configuring the domains that the key can be used in on
// the API configuration console.
function get_google_api_key() {
  // initialize new request
  const get_api_key = new XMLHttpRequest();

  get_api_key.open('POST', '/get_google_api_key');
  get_api_key.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

  //when request is completed
  get_api_key.onload = () => {
    //extract JSON data from request
    const response = JSON.parse(get_api_key.responseText);
    map_url = `https://maps.googleapis.com/maps/api/js?key=${response['key']}&callback=initMap`
    var map_source_tag = document.getElementById('map_source');
    map_source_tag.setAttribute('src', map_url);
    initMap();

  }; // end onload
  // Add route id to request sent to server
  const data = new FormData();
  data.append('route_id', route_id);

  // Send request
  get_api_key.send(data);
  return false; // avoid sending the form and creating an HTTP POST request
}


// initMap() run by google api call in HTML
// got guidance from:
// https://stackoverflow.com/questions/15829048/best-way-to-import-coordinates-from-gpx-file-and-display-using-google-maps-api#15830122
// function will get lat and lon coordinates from server.  server parses file and
// returns a dictionary of points which are added to the map
function initMap() {

   const get_gpx = new XMLHttpRequest();
   get_gpx.open('POST', '/get_route_gpx_points');
   get_gpx.setRequestHeader("X-CSRFToken", CSRF_TOKEN);
   get_gpx.onload = () => {
     //returns GPX file points in a dictionary
     const response = JSON.parse(get_gpx.responseText);
     var route_points = [];
     var map_bounds = new google.maps.LatLngBounds();

     // get the track points in the XML file and extract the lat an lon coordinates
     // add the coordinates to the a new g_maps coordinate point
     // then add the g_maps coordinate point to the route_points list
     for (p in response) {

       var point = new google.maps.LatLng(response[p].lat, response[p].lon);
       route_points.push(point);
       map_bounds.extend(point);
      }

      // create a polygon of the route
      var route_drawing = new google.maps.Polyline({
           path: route_points,
           strokeColor: "red",
      });

      // create new map object
      var mapOptions = { mapTypeId: 'terrain' };
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);

      // set the polygon on the map and set the bounds to match
      route_drawing.setMap(map);
      map.fitBounds(map_bounds);
   } // end on_load()

   // Add route id to request sent to server
   const data = new FormData();
   data.append('route_id', route_id);

   // Send request
   get_gpx.send(data);
   return false; // avoid sending the form and creating an HTTP POST request

} // end initMap()

// ensures a review has more than 1 character
// allows the enter key to accept a post
function setup_review_elements() {
  // enable display post review button when text is entered
  txt = document.querySelector('#txt_add_review');
  btn = document.querySelector('#btn_add_review');
  txt.onkeyup = (e) => {
      if (txt.value.length > 1) {
          btn.disabled = false;
          if (e.keyCode == 13) { add_review(); }; //allow enter key to post message
      } else {
          btn.disabled = true;
          if (e.keyCode == 13) { }; //disallow enter from posting message
      }
  } // end onkeyup

  btn.onclick = () => {
    add_review();
  }

} // end setup_review_elements()

// adds review to server when Post is clicked or enter key is pressed
function add_review() {
    const add_review = new XMLHttpRequest();

    add_review.open('POST', '/add_review');
    add_review.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

    rating = document.getElementById('rating').value;
    t = document.getElementById('txt_add_review');
    text = t.value

    //when request is completed
    add_review.onload = () => {
      //extract JSON data from request
      const response = JSON.parse(add_review.responseText);

      if (response.success) {
        // clear form and disable button
        document.getElementById('rating').selectedIndex = 0;
        t.value = "";
        btn = document.querySelector('#btn_add_review');
        btn.disabled = true;

        // clear reviews and then re-get reviews
        load_reviews();
      }
    }; // end onload

    // Add route id to request sent to server
    const data = new FormData();
    data.append('rating', rating);
    data.append('text', text);
    data.append('route_id', route_id);

    // Send request
    add_review.send(data);
    return false; // avoid sending the form and creating an HTTP POST request
} // end add_review()


// load posts for channel name sent as parameter
function load_reviews() {

    // initialize new request
    const get_reviews = new XMLHttpRequest();

    get_reviews.open('POST', '/get_reviews');
    get_reviews.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

    //when request is completed
    get_reviews.onload = () => {
      //extract JSON data from request
      const response = JSON.parse(get_reviews.responseText);

      // only list reviews if any exist
      if (Object.keys(response.reviews).length > 0 ) {
        //clear any reviews already listed
        listing = document.querySelector('#reviews_listing');
        while (listing.firstChild) {
          listing.removeChild(listing.firstChild);
        }

        //add the reviews
        for (review in response.reviews){
          add_review_to_listing(response.reviews[review], response.ratings)
        }
      }

    }; // end onload

    // Add route id to request sent to server
    const data = new FormData();
    data.append('route_id', route_id);

    // Send request
    get_reviews.send(data);
    return false; // avoid sending the form and creating an HTTP POST request

} // end load_posts()


// append a new review card to the current reviews_listing
function add_review_to_listing(review, ratings) {

  const reviews_listing = document.querySelector('#reviews_listing');
  const review_div = document.createElement('div');

  // CARD
  const card = document.createElement('div');
  if (review.rating < 3) {
    card.className = "card shadow my-3 border-danger";
  } else if (review.rating >3){
    card.className = "card shadow my-3 border-success";
  } else {
    card.className = "card shadow my-3 border-warning";
  }
  card.style["width"] = "100%";

  // CARD BODY
  const card_body = document.createElement('div');
  card_body.className = "card-body";

  // CARD TITLE LINES
  const card_head1 = document.createElement('div');
  card_head1.className = "card-subtitle mb-2 text-muted";
  card_head1.innerHTML = `${review.user} (${disp_time(review.date,true)})`
  const card_head2 = document.createElement('div');
  card_head2.className = "card-subtitle mb-2 text-muted";
  card_head2.innerHTML = `Rating: ${review.rating} - ${ratings[review.rating][1]}`

  // CARD TEXT
  const card_text = document.createElement('div');
  var card_text_attr = document.createAttribute("class");
  card_text.className = "card-text";
  card_text.innerHTML = review.text;


  //BUILD CARD
  card_body.appendChild(card_head1);
  card_body.appendChild(card_head2);
  card_body.appendChild(card_text);
  card.appendChild(card_body);

  //add the new review card to the top of the reviews
  reviews_listing.insertBefore(card, reviews_listing.firstChild);

} // end add_post_to_window()

// convert epoch time to human readbale time for display
function disp_time(epoch_time, short=false) {
    t = new Date(epoch_time);
    y = t.getFullYear().toString();
    m = t.getMonth()+1;
    d = t.getDate();
    h = t.getHours();
    mm = ("0" + (t.getMinutes())).slice(-2);

    if (short) {
      return `${y}/${m}/${d} ${h}:${mm}`; //short form
    } else {
      return `${m}/${d}/${y} ${h}:${mm}`; //long form
  }
}
