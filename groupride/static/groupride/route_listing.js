// ########################  begin DOMContentLoaded ########################
document.addEventListener('DOMContentLoaded', () => {
  // wait till page loads before setting up javascript elements
  // document.getElementById('btn_create_ride').onclick = create_ride;

  // enable display post review button when text is entered
  txt = document.querySelector('#txt_add_review');
  btn = document.querySelector('#btn_add_review');
  txt.onkeyup = () => {
      if (txt.value.length > 1)
          btn.disabled = false;
      else
          btn.disabled = true;
  } // end onkeyup

  btn.onclick = () => {
    add_review();
  }

  load_reviews();

});
// ########################  end DOMContentLoaded ########################


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
        // clear form
        document.getElementById('rating').selectedIndex = 0;
        t.reset;

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

      //clear any reviews already listed
      listing = document.querySelector('#reviews_listing');
      while (listing.firstChild) {
        listing.removeChild(listing.firstChild);
      }

      //add the reviews
      for (review in response.reviews){
        add_review_to_listing(response.reviews[review], response.ratings)
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
  //TODO - add rating text

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
