let currentUser;

/* Handle a remove bookmark event by removing the event from current users document and changing bookmark icon */
function handleRemoveSaveEvent(e) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    currentUser.update({
        savedEvents: firebase.firestore.FieldValue.arrayRemove(`${docId}`)
    });

    let bookmarkIcon = e.currentTarget.children[0];
    bookmarkIcon.setAttribute('class', 'bi bi-bookmark');
    e.currentTarget.removeEventListener('click', handleRemoveSaveEvent);
    e.currentTarget.addEventListener('click', handleSaveEvent);
}

/* Handle a save event by storing the event into current users document and changing bookmark icon */
function handleSaveEvent(e) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    currentUser.update({
        savedEvents: firebase.firestore.FieldValue.arrayUnion(`${docId}`)
    });

    let bookmarkIcon = e.currentTarget.children[0];
    bookmarkIcon.setAttribute('class', 'bi bi-bookmark-check');
    e.currentTarget.removeEventListener('click', handleSaveEvent);
    e.currentTarget.addEventListener('click', handleRemoveSaveEvent);
}

/* Handles the comment submit by storing a review in the reviews collection */
function handleAddComment(e) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let eventId = queryParams.get("id");

    let ratingsSelect = document.querySelector('.form-select');
    let commentTextBox = document.querySelector('.comment-text');
    let userDocId = currentUser.id;
    docRef = db.collection("reviews").doc();

    docRef.set({
        text: commentTextBox.value,
        rating: (ratingsSelect.value != "" ? parseInt(ratingsSelect.value) : 0),
        userId: userDocId,
        eventId: eventId
    }).then(() => {
        commentTextBox.value = "";
        location.reload();
    });
}

/* Add interactive functionality to icons, buttons */
function addWidgetListeners() {
    let bookmarkIcon = document.querySelector('.widget-bar .bi-bookmark');
    if (bookmarkIcon !== null) {
        let bookmarkButton = document.querySelector('.widget-bar .bookmark-btn');
        bookmarkButton.addEventListener('click', handleSaveEvent);
    }

    let checkedBookmarkIcon = document.querySelector('.widget-bar .bi-bookmark-check');
    if (checkedBookmarkIcon !== null) {
        let bookmarkButton = document.querySelector('.widget-bar .bookmark-btn');
        bookmarkButton.addEventListener('click', handleRemoveSaveEvent);
    }

    let submitButton = document.querySelector('.submit-button');
    submitButton.addEventListener('click', handleAddComment);
}

/* style widgets according to current user document */
function displayWidgetState(doc) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    let savedEventIds = doc.data().savedEvents;
    if (savedEventIds.includes(docId)) {
        let bookmarkIcon = document.querySelector('.widget-bar .bi-bookmark');
        bookmarkIcon.setAttribute('class', 'bi bi-bookmark-check');
    }
    addWidgetListeners();
}

/* display a rating using filled-stars */
function displayRating(ratingNum, commentNode) {
    if (ratingNum == 0) {
        return;
    }
    for (let i = 0; i < ratingNum; i++) {
        let starIcon = document.createElement("i");
        starIcon.setAttribute('class', 'bi bi-star-fill');
        commentNode.querySelector('.rating-container').append(starIcon);
    }
    for (let i = ratingNum; i < 5; i++) {
        let emptyStarIcon = document.createElement("i");
        emptyStarIcon.setAttribute('class', 'bi bi-star');
        commentNode.querySelector('.rating-container').append(emptyStarIcon);
    }
}

function displayRatingEvent(ratingNum) {
    let starContainer = document.querySelector('.star-container');
    for (let i = 0; i < ratingNum; i++) {
        let starIcon = document.createElement("i");
        starIcon.setAttribute('class', 'bi bi-star-fill');
        starContainer.append(starIcon);
    }
    for (let i = ratingNum; i < 5; i++) {
        let emptyStarIcon = document.createElement("i");
        emptyStarIcon.setAttribute('class', 'bi bi-star');
        starContainer.append(emptyStarIcon);
    }
}

/* display the rating for the event page */
async function displayEventRating(docQuery) {
    let ratingNum = 0;
    let reviewerCount = 0;
    docQuery.forEach((doc) => {
        //let userId = doc.data().userId;
        //docRef = db.collection("users").doc(`${userId}`);
        ratingNum += doc.data().rating;
        if (doc.data().rating != 0) {
            reviewerCount += 1;
        }
    });

    if (reviewerCount == 0) {
        reviewerCount = 1;
    }
    let averageRating = Math.ceil(ratingNum / reviewerCount);
    displayRatingEvent(averageRating);
}

/* Fill event page with appropriate firestore data */
function fillEventPage(doc) {
    let imgEvent = document.querySelector('.event-img');
    let eventDescription = document.querySelector('.event-description');
    let eventName = document.querySelector('.title');
    //let eventLikes = document.querySelector('.likes-text');
    let eventLocation = document.querySelector('.event-location');
    let eventDate = document.querySelector('.event-date');
    let eventCost = document.querySelector('.event-cost');
    let eventLink = document.querySelector('.event-link');

    imgEvent.src = doc.data().posterurl;
    eventDescription.innerHTML = doc.data().description;
    eventName.textContent = doc.data().event;
    //eventLikes.textContent = `${doc.data().likecounter} likes`;
    eventLocation.textContent = doc.data().location;
    eventDate.textContent = doc.data().startdate + " - " + doc.data().enddate;
    eventCost.textContent = doc.data().cost;
    eventLink.href = doc.data().link;
}

/* Fill comment section of page with appropriate firestore data */
function fillCommentSection(docQuery) {
    let commentTemplate = document.querySelector(".comment-template");
    let commentContainer = document.querySelector(".comment-container");
    docQuery.forEach((doc) => {
        let userId = doc.data().userId;
        docRef = db.collection("users").doc(`${userId}`);
        docRef.get().then((userDoc) => {
            let commentNode = commentTemplate.content.cloneNode(true);

            displayRating(doc.data().rating, commentNode);
            commentNode.querySelector('.username').textContent = userDoc.data().name;
            commentNode.querySelector('.text').textContent = doc.data().text;
            let pfpUrl = userDoc.data().profilePictureUrl
            if (pfpUrl == "") {
                pfpUrl = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png";
            }
            commentNode.querySelector('img').src = pfpUrl;
            commentContainer.appendChild(commentNode);
        });
    });
}

/* Initialize the event page */
function eventInit() {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    docRef = db.collection("events").doc(`${docId}`);
    docRef.get().then(fillEventPage);

    let collectionRef = db.collection("reviews");
    collectionRef.where("eventId", "==", `${docId}`).get().then(fillCommentSection);

    let collectRef = db.collection("reviews");
    collectRef.where("eventId", "==", `${docId}`).get().then(displayEventRating);

    showEventsOnMap();

    /* If user is signed in then customize the page */
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            currentUser = db.collection("users").doc(`${user.uid}`);
            currentUser.get().then(displayWidgetState);
        } else {
            document.querySelector("#comment-input").style.display = 'none';
            document.querySelector(".bookmark-btn").style.display = 'none';
        }
    });
}
eventInit();

function displayNotification() {
    let messageNode = document.querySelector(".notify-message");
    messageNode.textContent = "Oops, we couldn’t find this event on the map. It may occur online, or it could possibly have multiple locations";
    messageNode.style.color = "red";
}

// MAPBOX DISPLAY
async function showEventsOnMap() {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let eventId = queryParams.get("id");

    let doc = await db.collection("events").doc(`${eventId}`).get();
    let location = doc.data().coordinates;
    let zoomLevel = 14;

    if (isNaN(location[0])) {
        location = [-123.11535188078236, 49.28274402264293];
        zoomLevel = 11;
        displayNotification();
    }

    // MAPBOX DISPLAY
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWRhbWNoZW4zIiwiYSI6ImNsMGZyNWRtZzB2angzanBjcHVkNTQ2YncifQ.fTdfEXaQ70WoIFLZ2QaRmQ';
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v11', // style URL
        center: location, // starting position
        zoom: zoomLevel // starting zoom
    });


    // Add zoom and rotation controls to the map.
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
        const features = [];
        coordinates = doc.data().coordinates;
        event_name = doc.data().event;
        preview = doc.data().preview;
        img = doc.data().posterurl;
        //console.log([-123.11535188078236, 49.28274402264293])
        // coordiantes = doc.data().coordiantes;
        //console.log(coordinates);
        url = doc.data().link;

        map.loadImage(
            'https://cdn.iconscout.com/icon/free/png-256/pin-locate-marker-location-navigation-16-28668.png',
            (error, image) => {
                if (error) throw error;

                // Add the image to the map style.
                map.addImage('cat', image);

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
            })
    });
}