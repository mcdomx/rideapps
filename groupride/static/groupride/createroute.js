// ########################  begin DOMContentLoaded ########################
document.addEventListener('DOMContentLoaded', () => {
  // wait till page loads before setting up javascript elements
  document.getElementById('btn_create_route').onclick = create_route;
  document.getElementById('gpxfile').onchange = () => {
    document.getElementById('txt_gpxfile').innerHTML = document.getElementById('gpxfile').files[0].name;
  }

});
// ########################  end DOMContentLoaded ########################

// send current cart to server
function create_route() {

  document.getElementById('btn_create_route').disabled = true;

  const create_route = new XMLHttpRequest();
  create_route.open('POST', '/create_new_route');
  create_route.setRequestHeader("X-CSRFToken", CSRF_TOKEN);
  create_route.setRequestHeader("enctype", "multipart/form-data");

  route_name = document.getElementById('route_name').value;
  miles = document.getElementById('miles').value;
  vertical_feet = document.getElementById('vertical_feet').value;
  origin = document.getElementById('origin').value;

  // ensure no null fields. return if null exists.
  // server will do remaining data validation.
  test = {"Name":route_name,
          "Distance":miles,
          "Climb":vertical_feet,
          "Origin":origin};
  test_result = test_for_null(test);
  if (test_result) {
    display_message("create_route_message",false, "Fill in all fields! ", `A value for '${test_result}' is missing.`);
    return;
  }

  // upon response from server...
  create_route.onload = () => {
    const message = JSON .parse(create_route.responseText)
    display_message("create_route_message",message.success, message.headline, message.message);

    // clear form if form operation was successful
    if ( message.success == true ) {
      document.getElementById("frm_create_route").reset();
      document.getElementById("txt_gpxfile").innerHTML = "upload a GPX file ... "
      document.getElementById('btn_create_route').disabled = false;
    }
  } //end onload

  // Add data to send with request
  const data = new FormData();
  data.append('enctype', 'multipart/form-data')
  data.append('route_name', document.getElementById('route_name').value);
  data.append('miles', document.getElementById('miles').value);
  data.append('vertical_feet', document.getElementById('vertical_feet').value);
  data.append('origin', document.getElementById('origin').value);
  file_element = document.getElementById('gpxfile');
  data.append('gpxfile', file_element.files[0], file_element.files[0].name )
  create_route.send(data); // Send request

  return false; // avoid sending the form

} // end place_order

// accepts a dictionary of fields and their values
// returns the first null element
// if no elements are null, returns false
function test_for_null (elements) {
  for (e in elements) {
    if (elements[e] == "") { return (e) }
  }
  return false

} // end validate_entry

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
