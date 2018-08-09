// ########################  begin DOMContentLoaded ########################
document.addEventListener('DOMContentLoaded', () => {
  // wait till page loads before setting up javascript elements

  // user has attempted to directly navigate to a private ride that they are not
  // invited to.
  if (early_exit) {
    return;
  }

  if (authenticated == true) {
    setup_chat_elemnts();
    setup_confirmation_elements();
    load_confirmed_riders();
    load_posts(ride_id);
  }

});
// ########################  end DOMContentLoaded ########################

function setup_confirmation_elements() {
  btn = document.getElementById('btn_confirm');
  btn.onclick = () => {
    toggle_confirmation();
  }
} // end setup_confirmation_elements()

function load_confirmed_riders() {

  //clear all confrimed riders from the list
  listing = document.getElementById('confirmed_list');
  while (listing.firstChild) {
    listing.removeChild(listing.firstChild);
  }

  //get conformed riders from server
  // initialize new request
  const get_confirmed_riders = new XMLHttpRequest();

  get_confirmed_riders.open('POST', '/get_confirmed_riders');
  get_confirmed_riders.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

  //when request is completed
  get_confirmed_riders.onload = () => {
    //extract JSON data from request
    const response = JSON.parse(get_confirmed_riders.responseText);

      //clear any posts that are already on the screen
      listing = document.querySelector('#confirmed_list');
      while (listing.firstChild) {
        listing.removeChild(listing.firstChild);
      }

      //add riders
      for (rider in response) {
        add_rider_to_confirmed(rider, response[rider]);
      } // end for loop

      //if current user is in the list of confirmed riders set conf message
      btn = document.getElementById('btn_confirm');
      txt = document.getElementById('conf_status');
      //if the user is confirmed, setup unjoin confirmation
      if (user_id in response) {
        txt.innerHTML = "You are confirmed for this ride"
        btn.className = "btn btn-danger col-5 mr-0";
        btn.innerHTML = "Unjoin"
      } else {
        txt.innerHTML = "You haven't confirmed this ride"
        btn.className = "btn btn-success col-5 mr-0";
        btn.innerHTML = "Join"
      }

  }; // end onload

  // Add route id to request sent to server
  const data = new FormData();
  data.append('ride_id', ride_id);

  // Send request
  get_confirmed_riders.send(data);
  return false; // avoid sending the form and creating an HTTP POST request

} // end load_confirmed_riders()


function add_rider_to_confirmed(username, rider) {

  const rider_div = document.createElement('div');
  rider_div.className = "confirmed_rider"
  rider_div.innerHTML = rider;
  listing = document.querySelector('#confirmed_list');

  //add the newest confirmations to the top
  listing.insertBefore(rider_div, listing.firstChild);

} //end add_rider_to_confirmed()


// toggle confirmatin status on the server side
function toggle_confirmation() {

  const toggle_status = new XMLHttpRequest();

  toggle_status.open('POST', '/toggle_confirmation');
  toggle_status.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

  //when request is completed
  toggle_status.onload = () => {
    //extract JSON data from request
    load_confirmed_riders();

  }; // end onload

  // Add route id to request sent to server
  const data = new FormData();
  data.append('user_id', user_id);
  data.append('ride_id', ride_id);

  // Send request
  toggle_status.send(data);
  return false; // avoid sending the form and creating an HTTP POST request

} // end set_confirmation()


function setup_chat_elemnts() {
  // enable display post review button when text is entered
  txt_add_post = document.getElementById('txt_add_post');
  btn_add_post = document.getElementById('btn_add_post');

  txt_add_post.onkeyup = (e) => {
      if (txt_add_post.value.length > 1) {
          btn_add_post.disabled = false;
          if (e.keyCode == 13) { add_post(); }; //allow enter key to post message
      } else {
          btn_add_post.disabled = true;
          if (e.keyCode == 13) { }; //disallow enter from posting message
      }
  } // end onkeyup

  btn_add_post.onclick = () => {
    add_post();
  }

} // end setup_chat_elemnts()


function add_post() {
    const add_comment = new XMLHttpRequest();

    add_comment.open('POST', '/add_comment');
    add_comment.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

    t = document.getElementById('txt_add_post');
    text = t.value

    //when request is completed
    add_comment.onload = () => {
      //extract JSON data from request
      const response = JSON.parse(add_comment.responseText);


      if (response.success == true) {
        t.value=""; //clear text box
        btn_add_post.disabled = true; //disable post button

        // clear reviews and then re-get reviews
        load_posts(ride_id);
      }
    }; // end onload

    // Add route id to request sent to server
    const data = new FormData();
    data.append('text', text);
    data.append('ride_id', ride_id);

    // Send request
    add_comment.send(data);
    return false; // avoid sending the form and creating an HTTP POST request
} // end add_comment()


// load posts for channel name sent as parameter
function load_posts(ride_id) {

    // initialize new request
    const get_ride_comments = new XMLHttpRequest();

    get_ride_comments.open('POST', '/get_ride_comments');
    get_ride_comments.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

    //when request is completed
    get_ride_comments.onload = () => {
      //extract JSON data from request
      const response = JSON.parse(get_ride_comments.responseText);

        //clear any posts that are already on the screen
        listing = document.querySelector('#post_listing');
        while (listing.firstChild) {
          listing.removeChild(listing.firstChild);
        }

        //add comments
        for (post in response.comments) {
            add_post_to_window(response.comments[post], true);
        } // end for loop

    }; // end onload

    // Add route id to request sent to server
    const data = new FormData();
    data.append('ride_id', ride_id);

    // Send request
    get_ride_comments.send(data);
    return false; // avoid sending the form and creating an HTTP POST request

} // end load_posts()


// append a new post to the current post_listing window
function add_post_to_window(post, full_loading=false) {

  const post_listing = document.querySelector('#post_listing');

  const post_div = document.createElement('div');

  if (post.user_id === user_id) {
    // if post is from owner, put on the right side
    post_div.className = "col-8 offset-4  rounded mb-2 py-1 self_chatbox";
  } else {
    // put on left side
    post_div.className = "col-8           rounded mb-2 py-1 other_chatbox";
  } // end if-else

  //post text for display
  post_time = disp_time(post.date, true);
  post_div.innerHTML = `${post.user} (${post_time}): ${post.text}`;

  //add the newly created posting to the chat listing
  post_listing.appendChild(post_div);
  post_listing.scrollTop = post_listing.scrollHeight


} // end add_post_to_window()

// convert epoch time to human readbale time for display
function disp_time(epoch_time, short=false) {
    t = new Date(epoch_time);
    y = t.getFullYear().toString().slice(-2);
    m = t.getMonth()+1;
    d = t.getDate();
    h = t.getHours();
    mm = ("0" + (t.getMinutes())).slice(-2);

    if (short) {
      return `${m}/${d}/${y} ${h}:${mm}`; //short form
    } else {
      return `${m}/${d}/${y} ${h}:${mm}`; //long form
  }
}
