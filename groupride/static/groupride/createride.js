// ########################  begin DOMContentLoaded ########################
document.addEventListener('DOMContentLoaded', () => {
  // wait till page loads before setting up javascript elements

  setup_page_elements();
  setup_blank_ride();

});
// ########################  end DOMContentLoaded ########################


function setup_page_elements() {

  document.getElementById('btn_create_ride').onclick = create_ride;
  document.getElementById('ckbox_private').onchange = toggle_private_ride;
  document.getElementById('btn_invite_rider').onclick = add_rider_to_invite_list;

  document.getElementById('invite_select').onchange = () => {
    if (invite_select.selectedIndex) {
      document.getElementById('btn_invite_rider').disabled = false;
    } else {
      document.getElementById('btn_invite_rider').disabled = true;
    }
  }

} //end setup_page_elements()

function setup_blank_ride () {

  //clear list of invited riders
  listing = document.getElementById('invited_riders');
  while (listing.firstChild) {
    listing.removeChild(listing.firstChild);
  }

  //add the ride organizer to the list of invited riders
  rider_list = document.getElementById('invited_riders');
  rider_div = document.createElement('div');
  rider_div.id = user_id;
  rider_div.innerHTML = `${user_first_name} ${user_last_name} (${user_id})`;
  rider_list.appendChild(rider_div);

  //setup private ride section to default
  document.getElementById('invite_select').disabled = true;
  document.getElementById('btn_invite_rider').disabled = true;
  document.getElementById('invited_list').hidden = true;

}

function toggle_private_ride() {

  // set back to default status of list
  invite_select.selectedIndex = 0;

  ckbox = document.getElementById('ckbox_private');
  if (ckbox.checked) {
    private_on = true;
    document.getElementById('invite_select').disabled = false;
    document.getElementById('btn_invite_rider').disabled = true;
    document.getElementById('invited_list').hidden = false;

  } else {
    private_on = false;
    document.getElementById('invite_select').disabled = true;
    document.getElementById('btn_invite_rider').disabled = true;
    document.getElementById('invited_list').hidden = true;
  }

  document.getElementById('ckbox_private').disabled = false;

} // toggle_private_ride()

function add_rider_to_invite_list () {
  invited_riders = document.getElementById('invited_riders');
  rider_list = document.getElementById('rider_list');
  invite_select = document.getElementById('invite_select');
  rider_text = invite_select.options[invite_select.selectedIndex].text;

  rider_div = document.createElement('div');
  rider_id = invite_select.options[invite_select.selectedIndex].value;
  rider_div.id = rider_id;
  rider_div.innerHTML = `${rider_text}`;


  // add a remove button to the invited users list
  const remove_but = document.createElement('span');
  remove_but.className = "badge badge-pill badge-danger ml-2";
  remove_but.innerHTML = "&times;";

  remove_but.onclick = (self) => {
    // code to remove item from the list
    this_item = self.path[1];
    this_item.parentNode.removeChild(this_item);
    sel_item = document.querySelector(`option[value=${this_item.id}`);
    sel_item.disabled = false;
  }

    rider_div.appendChild(remove_but);
    invited_riders.appendChild(rider_div);

  //remove user from list of people that can be invited
  sel_item = document.querySelector(`option[value=${rider_id}`);
  sel_item.disabled = true;

  // set back to default status of list
  invite_select.selectedIndex = 0;
  document.getElementById('btn_invite_rider').disabled = true;
}


// send current cart to server
function create_ride() {

  document.getElementById('btn_create_ride').disabled = true;

  const create_ride = new XMLHttpRequest();
  create_ride.open('POST', '/create_new_ride');
  create_ride.setRequestHeader("X-CSRFToken", CSRF_TOKEN);

  ride_name = document.getElementById('ride_name').value;

  rd = document.getElementById('ride_date').value;
  rd_split = rd.split('-');

  rt = document.getElementById('ride_time').value;
  rt_split = rt.split(':');
  ride_date = rd_split.concat(rt_split);

  r = document.getElementById('route');
  route_id = r.options[r.selectedIndex].value;

  var private_ride = false;
  invited_rider_list = [];

  p = document.getElementById('ckbox_private');
  if (p.checked == true) {
    private_ride = true;
    //create a list of invited riders' usernames

    //iterate through the div elements in #invited_riders and add the value to the list
    var elements = document.getElementById('invited_riders').getElementsByTagName('div');
    for (var i=0; i<elements.length; i++) {
      invited_rider_list.push(elements[i].id);
    }
  }

  // ensure no null fields. return if null exists.
  // server will do remaining data validation.
  fields_to_validate = {"Name":ride_name,
                        "Date":ride_date,
                        "Time":ride_time,
                        "Route":r.selectedIndex};
  validation_result = test_for_null(fields_to_validate);
  if (validation_result) {
    display_message("create_ride_message",false, "Fill in all fields! ", `A value for '${validation_result}' is missing.`);
    return;
  }

  // upon response from server...
  create_ride.onload = () => {
    const message = JSON .parse(create_ride.responseText)
    display_message("create_ride_message",message.success, message.headline, message.message);

    // clear form if form operation was successful
    if ( message.success == true ) {
      document.getElementById("frm_create_ride").reset();
      document.getElementById('btn_create_ride').disabled = false;
      setup_blank_ride();
    }
  } //end onload

  // Add data to send with request
  const data = new FormData();
  data.append('ride_name', ride_name);
  data.append('ride_date', ride_date);
  data.append('route_id',route_id);
  data.append('private_ride', private_ride);
  data.append('invited_rider_list', invited_rider_list);

  create_ride.send(data); // Send request

  return false; // avoid sending the form

} // end place_order

// accepts a dictionary of fields and their values
// returns the first null element
// if no elements are null, returns false
function test_for_null (elements) {
  for (e in elements) {
    if (elements[e] == "" || elements[e] == 0) { return (e) }
  }
  return false
} // end test_for_null

//will unhide alert on screen
//args.  (text divid for alert, bool, bold text, error text)
//the bool value drives the alert being red or green
function display_message(divid, success, headline, message) {
  alert = document.getElementById(divid);

  if (success == true){
    alert.className = "alert alert-success";
  } else {
    alert.className = "alert alert-danger";
  }

  document.getElementById("headline").innerHTML = headline;
  document.getElementById("error").innerHTML = message;
  alert.hidden = false;

} // end display_message()
