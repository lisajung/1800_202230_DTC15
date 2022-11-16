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
};

/* Handles the comment submit by storing a review in the reviews collection */
let addComment = function(userDocRef) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let eventId = queryParams.get("id");

    let commentTextBox = document.querySelector('.comment-text');
    let userDocId = userDocRef.id;
    docRef = db.collection("reviews").doc();

    docRef.set({
        text: commentTextBox.value,
        userId: userDocId,
        eventId: eventId
    }).then(() => {
        commentTextBox.value = "";
        location.reload();
    });
};

/* Called when a user clicks submit button next to comment */
let handleAddComment = function(e) {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            addComment(docRef);
        } else {
            // No user is signed in.
        }
    });
};

/* Add interactive functionality to icons, buttons */
let addWidgetListeners = function() {
    let bookmarkIcon = document.querySelector('.widget-bar .bi-bookmark');
    bookmarkIcon.addEventListener('click', handleSaveEvent);

    let submitButton = document.querySelector('.submit-button');
    submitButton.addEventListener('click', handleAddComment);
};

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
};

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

/* Fill comment section of page with appropriate firestore data */
let fillCommentSection = function(docQuery) {
    let commentTemplate = document.querySelector(".comment-template");
    let commentContainer = document.querySelector(".comment-container");
    docQuery.forEach((doc) => {
        let userId = doc.data().userId;
        docRef = db.collection("users").doc(`${userId}`);
        docRef.get().then((userDoc) => {
            let commentNode = commentTemplate.content.cloneNode(true);

            commentNode.querySelector('.username').textContent = userDoc.data().name;
            commentNode.querySelector('.text').textContent = doc.data().text;
            commentNode.querySelector('img').src = userDoc.data().profilePictureUrl;
            commentContainer.appendChild(commentNode);
        });
    });
};

/* Initialize the event page */
let eventInit = function() {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");

    docRef = db.collection("events").doc(`${docId}`);
    docRef.get().then(fillEventPage);

    collectionRef = db.collection("reviews");
    collectionRef.where("eventId", "==", `${docId}`).get().then(fillCommentSection);

    /* If user is signed in then customize the page */
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.get().then(displayWidgetState);
            addWidgetListeners();
        } else {
            //TODO: disable components that non-users can't use

        }   
    });
};
eventInit();