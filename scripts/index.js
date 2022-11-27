let currentUser;


//------------------------------------------------------
// Change greeting depending on the time of day.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
var todaysDate = new Date()
var currentTime = todaysDate.getHours() // READING from Firestore

if (currentTime < 12) { // Checks if time is in the morning
  document.getElementById("greeting-text").innerHTML = "Good Morning,";
} else if (currentTime <= 16 && currentTime >= 13) { // Checks if time is in the afternoon
  document.getElementById("greeting-text").innerHTML = "Good Afternoon,";
} else { // Checks if the time is in the night
  document.getElementById("greeting-text").innerHTML = "Good Evening,"
}


//------------------------------------------------------
// Displays banner if user is not signed in.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function displayLoginBanner() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      let signIn = document.querySelector('.buttons-container');
      signIn.style.display = 'block'; // Displays log in + sign up buttons
    }
  })
}
displayLoginBanner();


//------------------------------------------------------
// Displays the user's name in banner if signed in.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function insertName() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      let explore = document.querySelector('.explore-container');
      explore.style.display = 'block';
      docRef = db.collection("users").doc(`${user.uid}`); // READING username from "user" collection
      docRef.get().then((doc) => {
        // FILLS CONTENT WITH USER NAME
        user_Name = doc.data().name;
        $("#name-goes-here").text(user_Name);
      });
    } else {
      // No user is signed in.
    }
  });
}
insertName();


//------------------------------------------------------
// Handle a remove bookmark event by removing the event from current users document and changing bookmark icon.
//
// PARAM e > The event object that is returned to a handler after a click
// RETURN > NONE
//------------------------------------------------------
function handleRemoveSaveEvent(e) {
  let docId = e.currentTarget.getAttribute('data-id');

  currentUser.update({ // UPDATES array in Firestore collection
    savedEvents: firebase.firestore.FieldValue.arrayRemove(`${docId}`) // UPDATING in Firestore
  });

  let bookmarkIcon = e.currentTarget.children[0];
  bookmarkIcon.setAttribute('class', 'bi bi-bookmark');
  e.currentTarget.removeEventListener('click', handleRemoveSaveEvent);
  e.currentTarget.addEventListener('click', handleSaveEvent);
}


//------------------------------------------------------
// Handle a save event by storing the event into current users document and changing bookmark icon.
//
// PARAM e > The event object that is returned to a handler after a click
// RETURN > NONE
//------------------------------------------------------
function handleSaveEvent(e) {
  let docId = e.currentTarget.getAttribute('data-id');

  currentUser.update({ // UPDATES array in Firestore collection
    savedEvents: firebase.firestore.FieldValue.arrayUnion(`${docId}`) // UPDATING in Firestore
  });

  let bookmarkIcon = e.currentTarget.children[0];
  bookmarkIcon.setAttribute('class', 'bi bi-bookmark-check');
  e.currentTarget.removeEventListener('click', handleSaveEvent);
  e.currentTarget.addEventListener('click', handleRemoveSaveEvent);
}


//------------------------------------------------------
// Add interactive functionality to save buttons.
//
// PARAM buttonNode > The DOM element returned when queryselector or getelementbyid is called
// RETURN > NONE
//------------------------------------------------------
function addWidgetListeners(buttonNode) {
  let bookmarkIcon = buttonNode.querySelector('.bi-bookmark');
  if (bookmarkIcon !== null) {
    buttonNode.addEventListener('click', handleSaveEvent);
  }

  let checkedBookmarkIcon = buttonNode.querySelector('.bi-bookmark-check');
  if (checkedBookmarkIcon !== null) {
    buttonNode.addEventListener('click', handleRemoveSaveEvent);
  }
}


//------------------------------------------------------
// style all save buttons according to current user document.
//
// PARAM doc > The user document from Firestore
// RETURN > NONE
//------------------------------------------------------
function displayWidgetState(doc) {
  let saveButtons = document.querySelectorAll(".save-button");
  saveButtons.forEach((button) => {
    let eventId = button.getAttribute('data-id');
    let savedEventIds = doc.data().savedEvents; // READING from Firestore
    if (savedEventIds.includes(eventId)) {
      let bookmarkIcon = button.querySelector('.bi-bookmark');
      bookmarkIcon.setAttribute('class', 'bi bi-bookmark-check');
    }
    addWidgetListeners(button);
  });
}

//------------------------------------------------------
// Get data from a CSV file with ".fetch()".
// Uses an async function which must be called in the console to activate.
// File is created using Python.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
async function getCSVdata() {
  console.log("success")
  const response = await fetch('/event_data.csv'); // Send get request
  const data = await response.text();      // Get file response
  const list = data.split('\n').slice(1);  // Get line
  list.forEach(row => {
    // INCOMING FROM CSV > [title, link, location, cost, startDate, endDate, numericalDate, image, poster, description, previewText, longitude, latitude]
    const columns = row.split(',');
    const eventtitle = columns[0];
    const eventlink = columns[1];
    const eventlocation = columns[2];
    const eventcost = columns[3];
    const startdate = columns[4];
    const enddate = columns[5];
    const eventnumericaldate = Number(columns[6]);
    const eventimage = columns[7];
    const eventposter = columns[8];
    const eventdescription = columns[9];
    const eventpreview = columns[10];
    const eventLongitude = Number(columns[11]);
    const eventLatitude = Number(columns[12]);

    db.collection("events").add({   // WRITES the collected values into the "events" collection in Firestore
      event: eventtitle,
      link: eventlink,
      location: eventlocation,
      cost: eventcost,
      startdate: startdate,
      enddate: enddate,
      numericaldate: eventnumericaldate,
      imageurl: eventimage,
      posterurl: eventposter,
      description: eventdescription,
      preview: eventpreview,
      coordinates: [eventLongitude, eventLatitude]
    })
  })
}


//------------------------------------------------------
// Dynamically populates event cards on index.html.
// Uses data stored in "events" collection, using data gathered with Python and stored in Firestore.
//
// PARAM userDoc > The user document from Firestore
// RETURN > NONE
//------------------------------------------------------
async function populateCardsDynamically(userDoc) {
  let eventCardTemplate = document.getElementById("eventCardTemplate"); // Grabbing template from HTML
  let eventCardGroup = document.getElementById("eventCardGroup"); // Grabbing card group from HTML
  await db.collection("events").orderBy("numericaldate", "asc").get() // READING and SORTING events ORDERED BY DATE
    .then(allEvents => {
      allEvents.forEach(doc => {
        var eventName = doc.data().event; // Name
        var eventImg = doc.data().posterurl; // IMG
        var eventStart = doc.data().startdate; // Start Date
        var eventEnd = doc.data().enddate; // End Date
        var eventCost = doc.data().cost; // Cost
        var eventPreview = doc.data().preview; // Preview
        var eventLocation = doc.data().location; // Location
        let testEventCard = eventCardTemplate.content.cloneNode(true);
        // Injects values into HTML
        testEventCard.querySelector('.card-title').innerHTML = eventName;
        testEventCard.querySelector('#location').innerHTML = "Location: " + eventLocation;
        testEventCard.querySelector('#date').innerHTML = "Date: " + eventStart + " to " + eventEnd;
        testEventCard.querySelector('.card-text').innerHTML = eventPreview;
        testEventCard.querySelector('.text-muted').innerHTML = eventCost;
        testEventCard.querySelector('img').src = eventImg;

        testEventCard.querySelector(".event-link").href = `/html/event.html?id=${doc.id}`; // Creates an individual link for each event

        testEventCard.querySelector(".save-button").setAttribute('data-id', `${doc.id}`); // Creates a saved button for each card
        if (userDoc == null) { // Hides save button from users that are not signed in
          testEventCard.querySelector(".save-button").style.display = "none";
        }

        eventCardGroup.appendChild(testEventCard); // Appends cards to group
      })

    })

  if (userDoc == null) {
    return;
  }

  displayWidgetState(userDoc);
}


//------------------------------------------------------
// Calls Card Populater.
// 
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function indexInit() {
  // If user is signed in then customize the page 
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      currentUser = db.collection("users").doc(`${user.uid}`); // READING from firestore
      currentUser.get().then(populateCardsDynamically); // Populates cards after receiving user information from Firestore
    } else {
      populateCardsDynamically(null); // No save buttons
    }
  });
}
indexInit();