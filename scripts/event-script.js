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
};
eventInit();