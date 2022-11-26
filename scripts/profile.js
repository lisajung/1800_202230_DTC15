let currentUser;

/* SEND USER TO HOME PAGE IF NOT SIGNED IN */
function checkUserLoggedIn() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.assign("index.html");
    }
  })
}
checkUserLoggedIn();

/* Use users document reference to set users document fields */
function handleProfileChange(e) {
  let imageURL = document.querySelector('#imageurl');
  let userName = document.querySelector('#username');
  let text = document.querySelector('#exampleFormControlTextarea1');

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

// Set up "edit profile" button handler here
function addProfileButtonHandler() {
  let profileButton = document.querySelector('.profile-button');
  profileButton.addEventListener('click', handleProfileChange);
};
addProfileButtonHandler();

// Set the appropriate classes for carousel items
function activateCarousel() {
  let activeItemNode = document.querySelector(".carousel-item");
  let activeButtonNode = document.querySelector(".carousel-button");

  if (activeItemNode !== null) {
    activeItemNode.setAttribute('class', 'carousel-item active');
    activeButtonNode.setAttribute('class', 'carousel-button active');
  }
}

async function fillSavedEvents(doc) {
  let carouselItemTemplate = document.querySelector("#carousel-template");
  let carouselContainer = document.querySelector(".carousel-inner");

  let carouselButtonTemplate = document.querySelector("#carousel-button-template");
  let carouselButtonContainer = document.querySelector(".carousel-indicators");

  let savedEvents = doc.data().savedEvents;
  if (savedEvents.length <= 0) {
    document.querySelector("#carouselExampleCaptions").style.display = "none";
    document.querySelector(".remove-btn").style.display = "none";
    return;
  }
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

function removeBookmarkSetup() {
  let removeButton = document.querySelector('.remove-btn');
  removeButton.addEventListener('click', (e) => {
    let link = document.querySelector('.carousel-inner .active a').href;
    let url = new URL(link);
    let queryString = url.searchParams;
    let eventId = queryString.get("id");
    currentUser.update({
      savedEvents: firebase.firestore.FieldValue.arrayRemove(`${eventId}`)
    }).then(() => location.reload());
  });
}

function addSettingListeners() {
  let radioForm = document.querySelector('.radio-form');

  radioForm.addEventListener('change', (e) => {
    currentUser.update({
      background: e.target.getAttribute('data-url')
    }).then(fillBackground);
  }
  );
}

/* Get correct personalized settings for settings page of profile page */
function fillSettings(doc) {
  let currentBackground = doc.data().background;

  //also set radio form
  let radioForm = document.querySelector('.radio-form');
  let radioNodes = radioForm.querySelectorAll('input[type="radio"]');
  for (const node of radioNodes) {
    if (node.getAttribute('data-url') == currentBackground) {
      node.checked = true;
    }
  }

  addSettingListeners();
}

/* Callback that uses returned document to fill out profile page */
function fillProfile(doc) {
  let profileUsername = document.querySelector('.profile .card-title');
  let profileName = document.querySelector('.profile h6');
  let profileDescription = document.querySelector('.profile .card-text');
  profileUsername.textContent = doc.data().name;
  profileName.textContent = doc.data().email;
  profileDescription.textContent = doc.data().description;

  //fill out "edit profile" section here
  let imageURL = document.querySelector('#imageurl');
  let userName = document.querySelector('#username');
  let text = document.querySelector('#exampleFormControlTextarea1');
  imageURL.value = doc.data().profilePictureUrl;
  userName.value = doc.data().name;
  text.value = doc.data().description;

  fillSavedEvents(doc);

  // fill out profile pic here
  let profileImage = document.querySelector('.profile-pic');
  let imageLink = doc.data().profilePictureUrl;
  if (imageLink !== "") {
    profileImage.src = imageLink;
  } else {
    profileImage.src = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png"
  }
}


function fillEvent(doc, features) {
  coordinates = doc.data().coordinates;
  event_name = doc.data().event;
  preview = doc.data().preview;
  img = doc.data().posterurl;
  //console.log([-123.11535188078236, 49.28274402264293])
  // coordiantes = doc.data().coordiantes;
  //console.log(coordinates);
  url = doc.data().link;

  features.push({
    'type': 'Feature',
    'properties': {
      'description': `<strong>${event_name}</strong><p>${preview}</p> <img src="${img}" width="100%"> <br> <a href="/html/event.html?id=${doc.id}" target="_blank" title="Opens in a new window">Visit Here</a>`,
      'icon': 'mountain-15'
    },
    'geometry': {
      'type': 'Point',
      'coordinates': coordinates
    }
  });
}

function displayNotification() {
  let messageNode = document.querySelector(".notify-message");
  messageNode.textContent = "Hmm… it seems you haven’t saved any events. When you explore the catalogue and save an event, it will appear here on the map";
  messageNode.style.color = "grey";
}


// MAPBOX DISPLAY
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
    //console.log(docRef);
    let allEvents = docRef.data().savedEvents;
    console.log(allEvents)
    if (allEvents.length <= 0) {
      displayNotification();
    }

    map.loadImage(
      'https://cdn.iconscout.com/icon/free/png-256/pin-locate-marker-location-navigation-16-28668.png',
      (error, image) => {
        if (error) throw error;

        // Add the image to the map style.
        map.addImage('cat', image);
      })

    for (let i = 0; i < allEvents.length; i++) {
      //console.log(allEvents)
      //console.log(allEvents.length)
      //console.log(i)
      let doc = await db.collection("events").doc(`${allEvents[i]}`).get();
      coordinates = doc.data().coordinates;
      event_name = doc.data().event;
      preview = doc.data().preview;
      img = doc.data().posterurl;
      //console.log([-123.11535188078236, 49.28274402264293])
      // coordiantes = doc.data().coordiantes;
      console.log(coordinates);
      url = doc.data().link;

      features.push({
        'type': 'Feature',
        'properties': {
          'description': `<strong>${event_name}</strong><p>${preview}</p> <img src="${img}" width="100%"> <br> <a href="/html/event.html?id=${doc.id}" target="_blank" title="Opens in a new window">Visit Here</a>`
        },
        'geometry': {
          'type': 'Point',
          'coordinates': coordinates
        }
      });
    }

    console.log(features);

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


/* Initialize the profile page */
function profileInit() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      // find users document for signed in user and pass to callback
      currentUser = db.collection("users").doc(`${user.uid}`);
      currentUser.get().then(fillProfile);
      currentUser.get().then(fillSettings);
      currentUser.get().then(showEventsOnMap);
    } else {
      // No user is signed in.
    }
  });
}
profileInit();
