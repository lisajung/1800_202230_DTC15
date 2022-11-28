let currentUser;

//------------------------------------------------------
// SEND USER TO HOME PAGE IF NOT SIGNED IN
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function checkUserLoggedIn() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.assign("/index.html");
    }
  })
}
checkUserLoggedIn();

//------------------------------------------------------
// Use global current user document reference to set users document fields based on information entered in edit profile area.
//
// PARAM e > the event object returned after a click event
// RETURN > NONE
//------------------------------------------------------
function handleProfileChange(e) {
  let imageURL = document.querySelector('#image-url');
  let userName = document.querySelector('#display-name');
  let text = document.querySelector('#edit-area');

  currentUser.set({
    name: userName.value,
    description: text.value,
    profilePictureUrl: imageURL.value
  }, { merge: true }).then(() => {
    userName.value = "";
    text.value = "";
    imageURL.value = "";
    location.reload();
  });
}

//------------------------------------------------------
// Set up "edit profile" button event handler.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function addProfileButtonHandler() {
  let profileButton = document.querySelector('.profile-button');
  profileButton.addEventListener('click', handleProfileChange);
}

//------------------------------------------------------
// Set the appropriate 'active' classes for carousel items so that carousel slides.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function activateCarousel() {
  let activeItemNode = document.querySelector(".carousel-item");
  let activeButtonNode = document.querySelector(".carousel-button");

  if (activeItemNode !== null) {
    activeItemNode.setAttribute('class', 'carousel-item active');
    activeButtonNode.setAttribute('class', 'carousel-button active');
  }
}

//------------------------------------------------------
// Fill carousel with all the saved events from users doc.
//
// PARAM doc > the current user document grabbed from users collection in firestore
// RETURN > NONE
//------------------------------------------------------
async function fillSavedEvents(doc) {
  let carouselItemTemplate = document.querySelector("#carousel-template");
  let carouselContainer = document.querySelector(".carousel-inner");

  let carouselButtonTemplate = document.querySelector("#carousel-button-template");
  let carouselButtonContainer = document.querySelector(".carousel-indicators");
  // get the saved events from the current user doc passed in to fill carousel
  let savedEvents = doc.data().savedEvents;
  // remove carousel if there are no events
  if (savedEvents.length <= 0) {
    document.querySelector("#carouselExampleCaptions").style.display = "none";
    document.querySelector(".remove-btn").style.display = "none";
    document.querySelector(".saved-title").style.display = "none";
    return;
  }
  // fill carousel with events
  for (let i = 0; i < savedEvents.length; i++) {
    docRef = db.collection("events").doc(`${savedEvents[i]}`);
    await docRef.get().then((eventDoc) => {
      let carouselItemNode = carouselItemTemplate.content.cloneNode(true);

      carouselItemNode.querySelector('.carousel-item img').src = eventDoc.data().posterurl;
      carouselItemNode.querySelector('.carousel-item a').href = `/html/event.html?id=${eventDoc.id}`
      carouselContainer.appendChild(carouselItemNode);

      let carouselButtonNode = carouselButtonTemplate.content.cloneNode(true);

      carouselButtonNode.querySelector('button').setAttribute('data-bs-slide-to', `${i}`);
      carouselButtonContainer.appendChild(carouselButtonNode);
    });
  }

  activateCarousel();
  removeBookmarkSetup();
}

//------------------------------------------------------
// Setup a button for removing bookmarked events from profile page.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function removeBookmarkSetup() {
  let removeButton = document.querySelector('.remove-btn');
  removeButton.addEventListener('click', (e) => {
    let link = document.querySelector('.carousel-inner .active a').href;
    let url = new URL(link);
    let queryString = url.searchParams;
    let eventId = queryString.get("id");
    // use current user doc saved in global variable to remove an item from the savedEvents array field
    currentUser.update({
      savedEvents: firebase.firestore.FieldValue.arrayRemove(`${eventId}`)
    }).then(() => location.reload());
  });
}

//------------------------------------------------------
// Add event listeners to the settings modal icon.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function addSettingListeners() {
  let radioForm = document.querySelector('.radio-form');

  radioForm.addEventListener('change', (e) => {
    currentUser.update({
      background: e.target.getAttribute('data-url')
    }).then(fillBackground);
  });
}

//------------------------------------------------------
// Get correct personalized settings for settings modal of profile page and update setting state accordingly.
//
// PARAM doc > the current user document grabbed from users collection in firestore
// RETURN > NONE
//------------------------------------------------------
function fillSettings(doc) {
  let currentBackground = doc.data().background;

  // set radio forms with settings state that is taken from user doc above
  let radioForm = document.querySelector('.radio-form');
  let radioNodes = radioForm.querySelectorAll('input[type="radio"]');
  for (const node of radioNodes) {
    if (node.getAttribute('data-url') == currentBackground) {
      node.checked = true;
    }
  }

  addSettingListeners();
}

//------------------------------------------------------
// Callback that uses returned user document to fill out profile section with information.
//
// PARAM doc > the current user document grabbed from users collection in firestore
// RETURN > NONE
//------------------------------------------------------
function fillProfile(doc) {
  let profileUsername = document.querySelector('.profile .profile-username');
  let profileName = document.querySelector('.profile .profile-name');
  let profileDescription = document.querySelector('.profile .profile-text');
  // use user document to get all relevant information for the profile page
  profileUsername.textContent = doc.data().name;
  profileName.textContent = doc.data().email;
  profileDescription.textContent = doc.data().description;

  //fill out "edit profile" section here
  let imageURL = document.querySelector('#image-url');
  let userName = document.querySelector('#display-name');
  let text = document.querySelector('#edit-area');
  imageURL.value = doc.data().profilePictureUrl;
  userName.value = doc.data().name;
  text.value = doc.data().description;

  // fill out profile pic here
  let profileImage = document.querySelector('.profile-pic');
  let imageLink = doc.data().profilePictureUrl;
  if (imageLink !== "") {
    profileImage.src = imageLink;
  } else {
    profileImage.src = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png"
  }
}

//------------------------------------------------------
// Display a notification if user has no saved events.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function displayNotification() {
  let messageNode = document.querySelector(".notify-message");
  messageNode.textContent = "Hmm… it seems you haven’t saved any events. When you explore the catalogue and save an event, it will appear here on the map";
  messageNode.style.color = "red";
}

//------------------------------------------------------
// Shows all the user's saved events on a map.
//
// PARAM docRef > the current user doc grabbed from users collection in firestore
// RETURN > NONE
//------------------------------------------------------
function showEventsOnMap(docRef) {


  // MAPBOX DISPLAY
  mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
  const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: [-123.11535188078236, 49.28274402264293], // starting position
    zoom: 11 // starting zoom
  });


  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

  map.on('load', async () => {
    const features = [];
    // get saved events for user using the user document queried
    let allEvents = docRef.data().savedEvents;
    if (allEvents.length <= 0) {
      displayNotification();
    }

    map.loadImage(
      'https://cdn.iconscout.com/icon/free/png-256/pin-locate-marker-location-navigation-16-28668.png',
      (error, image) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage('cat', image);
    });

    for (let i = 0; i < allEvents.length; i++) {
      // get the event document that we want the coordinates for using a events collection query on the id
      let eventDoc = await db.collection("events").doc(`${allEvents[i]}`).get();
      coordinates = eventDoc.data().coordinates;
      event_name = eventDoc.data().event;
      preview = eventDoc.data().preview;
      img = eventDoc.data().posterurl;
      url = eventDoc.data().link;
      console.log(coordinates);

      features.push({
        'type': 'Feature',
        'properties': {
          'description': `<strong>${event_name}</strong><p>${preview}</p> <img src="${img}" width="100%"> <br> <a href="/html/event.html?id=${eventDoc.id}" target="_blank" title="Opens in a new window">Visit Here</a>`
        },
        'geometry': {
          'type': 'Point',
          'coordinates': coordinates
        }
      });
    }

    map.addSource('places', {
      // This GeoJSON contains features that include an "icon"
      // property. The value of the "icon" property corresponds
      // to an image in the Mapbox Streets style's sprite.
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': features
      }
    });
    // Add a layer showing the places.
    map.addLayer({
      'id': 'places',
      'type': 'symbol',
      'source': 'places',
      'layout': {
        'icon-image': 'cat',
        'icon-size': 0.1,
        'icon-allow-overlap': true
      }
    });

    // When a click event occurs on a feature in the places layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on('click', 'places', (e) => {
      // Copy coordinates array.
      const coordinates = e.features[0].geometry.coordinates.slice();
      const description = e.features[0].properties.description;

      // Ensure that if the map is zoomed out such that multiple
      // copies of the feature are visible, the popup appears
      // over the copy being pointed to.
      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'places', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'places', () => {
      map.getCanvas().style.cursor = '';
    });

  });
}


//------------------------------------------------------
// Initialize the profile page.
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function profileInit() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      // find users document for signed in user and pass to callbacks to fill profile
      currentUser = db.collection("users").doc(`${user.uid}`);
      currentUser.get().then(fillProfile);
      currentUser.get().then(fillSavedEvents);
      currentUser.get().then(fillSettings);
      currentUser.get().then(showEventsOnMap);
      addProfileButtonHandler();
    } else {
      // No user is signed in.
    }
  });
}
profileInit();
