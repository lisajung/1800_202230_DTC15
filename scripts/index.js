/* CHANGE GREETING DEPENDING ON THE TIME OF DAY */
var todaysDate = new Date()
var currentTime = todaysDate.getHours()
if (currentTime < 12) {
  document.getElementById("greeting-text").innerHTML = "Good Morning";
} else if (currentTime <= 16 && currentTime >= 13) {
  document.getElementById("greeting-text").innerHTML = "Good Afternoon";
} else {
  document.getElementById("greeting-text").innerHTML = "Good Evening"
}

/* DISPLAY BANNER IF USER IS NOT SIGNED IN */
function displayLoginBanner() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      let signIn = document.querySelector('.buttons-container');
      signIn.style.display = 'block';
    }
  })
}
displayLoginBanner();

function insertName() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      // Do something for the currently logged-in user here:
      //console.log(user.uid);
      //console.log(user.displayName);
      //user_Name = user.displayName;
      docRef = db.collection("users").doc(`${user.uid}`);
      docRef.get().then((doc) => {
        user_Name = doc.data().name;
        $("#name-goes-here").text(user_Name);
      });
      //method #1:  insert with html only
      //document.getElementById("name-goes-here").innerText = user_Name;    //using javascript
      //method #2:  insert using jquery //using jquery

    } else {
      // No user is signed in.
    }
  });
}
insertName(); //run the function

/* Handle a remove bookmark event by removing the event from current users document and changing bookmark icon */
function handleRemoveSaveEvent(e){
  let docId = e.target.getAttribute('data-id');
  console.log("clicked remove");
  /* If user is signed in then save the event page into firestore */
  firebase.auth().onAuthStateChanged((user) => {
      if (user) {
          docRef = db.collection("users").doc(`${user.uid}`);
          docRef.update({
              savedEvents: firebase.firestore.FieldValue.arrayRemove(`${docId}`)
          });

          let bookmarkIcon = e.target.children[0];
          bookmarkIcon.setAttribute('class', 'bi bi-bookmark');
          e.target.removeEventListener('click', handleRemoveSaveEvent);
          e.target.addEventListener('click', handleSaveEvent);
      } else {

      }
  });
}

/* Handle a save event by storing the event into current users document and changing bookmark icon */
function handleSaveEvent(e) {
  let docId = e.target.getAttribute('data-id');
  console.log("clicked save");
  /* If user is signed in then save the event page into firestore */
  firebase.auth().onAuthStateChanged((user) => {
      if (user) {
          docRef = db.collection("users").doc(`${user.uid}`);
          docRef.update({
              savedEvents: firebase.firestore.FieldValue.arrayUnion(`${docId}`)
          });

          let bookmarkIcon = e.target.children[0];
          bookmarkIcon.setAttribute('class', 'bi bi-bookmark-check');
          e.target.removeEventListener('click', handleSaveEvent);
          e.target.addEventListener('click', handleRemoveSaveEvent);
      } else {

      }
  });
}

/* Add interactive functionality to save buttons */
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

/* style all save buttons according to current user document */
function displayWidgetState(doc) {
  let saveButtons = document.querySelectorAll(".save-button");
  saveButtons.forEach((button) => {
      let eventId = button.getAttribute('data-id');
      let savedEventIds = doc.data().savedEvents;
      if (savedEventIds.includes(eventId)) {
          let bookmarkIcon = button.querySelector('.bi-bookmark');
          bookmarkIcon.setAttribute('class', 'bi bi-bookmark-check');
      }
      addWidgetListeners(button);
  });
}

//------------------------------------------------------
// Get data from a CSV file with ".fetch()"
// Since this file is local, you must use "live serve"
//------------------------------------------------------
async function getCSVdata() {
  console.log("hello")
  const response = await fetch('/event_data.csv'); //send get request
  const data = await response.text();      //get file response
  const list = data.split('\n').slice(1);  //get line
  list.forEach(row => {
    // [title, link, location, cost, StartDate, EndDate, numericaldate, image, poster, text, rating]
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

    db.collection("events").add({   //write to firestore
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
      longitude: eventLongitude,
      latitude: eventLatitude
    })
  })
}


async function populateCardsDynamically(userDoc) {
  let eventCardTemplate = document.getElementById("eventCardTemplate");
  let eventCardGroup = document.getElementById("eventCardGroup");
  await db.collection("events").orderBy("numericaldate", "asc").get()
    .then(allEvents => {
      allEvents.forEach(doc => {
        var eventName = doc.data().event; //gets the name field
        var eventImg = doc.data().posterurl;
        var eventStart = doc.data().startdate;
        var eventEnd = doc.data().enddate;
        var eventCost = doc.data().cost;
        var eventPreview = doc.data().preview;
        var eventLocation = doc.data().location;
        // var hikeID = doc.data().code; //gets the unique ID field
        // var hikeLength = doc.data().length; //gets the length field
        let testEventCard = eventCardTemplate.content.cloneNode(true);
        testEventCard.querySelector('.card-title').innerHTML = eventName;     //equiv getElementByClassName
        testEventCard.querySelector('#location').innerHTML = "Location: " + eventLocation;
        testEventCard.querySelector('#date').innerHTML = "Date: " + eventStart + " to " + eventEnd;
        testEventCard.querySelector('.card-text').innerHTML = eventPreview;
        testEventCard.querySelector('.text-muted').innerHTML = eventCost;
        // testEventCard.querySelector('.card-length').innerHTML = hikeLength;  //equiv getElementByClassName
        // testEventCard.querySelector('a').onclick = () => setHikeData(hikeID);//equiv getElementByTagName
        testEventCard.querySelector('img').src = eventImg;   //equiv getElementByTagName
        // create individual links for each event
        testEventCard.querySelector(".event-link").href = `/html/event.html?id=${doc.id}`;

        testEventCard.querySelector(".save-button").setAttribute('data-id', `${doc.id}`);
        if (userDoc == null) {
          testEventCard.querySelector(".save-button").style.display = "none";
        }

        eventCardGroup.appendChild(testEventCard);
      })

  })

  return userDoc;
}

function indexInit() {
    /* If user is signed in then customize the page */
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
          docRef = db.collection("users").doc(`${user.uid}`);
          docRef.get().then(populateCardsDynamically).then(displayWidgetState);
      } else {
          populateCardsDynamically(null);
      }
    });
}
indexInit();