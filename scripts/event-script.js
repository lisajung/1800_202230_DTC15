let fillEventPage = function(doc) {
    
};

/* Initialize the event page */
let eventInit = function() {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get(id);

    docRef = db.collection("events").doc(`${docId}`);
    docRef.get().then(fillEventPage);
};
eventInit();