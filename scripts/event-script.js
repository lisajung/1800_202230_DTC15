/* Handle a save event by storing the event into current users document */
let handleSaveEvent = function(e) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    /* If user is signed in then save the event page into firestore */
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.update({
                savedEvents: firebase.firestore.FieldValue.arrayUnion(`${docId}`)
            });

            e.target.setAttribute('class', 'bi bi-bookmark-check');
        } else {

        }   
    });    
}

let handleLikeEvent = function() {

}

/* Add interactive functionality to icons */
let addWidgetListeners = function() {
    let bookmarkIcon = document.querySelector('.widget-bar .bi-bookmark');
    bookmarkIcon.addEventListener('click', handleSaveEvent);
}

/* style widgets according to current user document */
let displayWidgetState = function(doc) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    let savedEventIds = doc.data().savedEvents;
    if (savedEventIds.includes(docId)) {
        let bookmarkIcon = document.querySelector('.widget-bar .bi-bookmark');
        bookmarkIcon.setAttribute('class', 'bi bi-bookmark-check');
    }
}

/* Fill event page with appropriate firestore data */
let fillEventPage = function(doc) {
    let imgCarousel = document.querySelector('.carousel-img');
    let eventDescription = document.querySelector('.event-description');
    let eventName = document.querySelector('.title');
    let eventLikes = document.querySelector('.likes-text');
    let eventLocation = document.querySelector('.event-location');
    let eventDate = document.querySelector('.event-date');
    let eventCost = document.querySelector('.event-cost');
    let eventLink = document.querySelector('.event-link a');
    
    imgCarousel.src = doc.data().imageurl;
    eventDescription.textContent = doc.data().description;
    eventName.textContent = doc.data().event;
    eventLikes.textContent = `${doc.data().likecounter} likes`;
    eventLocation.textContent = doc.data().location;
    eventDate.textContent = doc.data().date;
    eventCost.textContent = doc.data().cost;
    eventLink.href = doc.data().link;
};

/* Initialize the event page */
let eventInit = function() {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    docRef = db.collection("events").doc(`${docId}`);
    docRef.get().then(fillEventPage);

    /* If user is signed in then customize the page */
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.get().then(displayWidgetState);
            addWidgetListeners();
        } else {

        }   
    });
};
eventInit();