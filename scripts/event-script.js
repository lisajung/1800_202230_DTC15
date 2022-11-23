/* Handle a remove bookmark event by removing the event from current users document and changing bookmark icon */
function handleRemoveSaveEvent(e){
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");
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
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let docId = queryParams.get("id");
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

/* Handles the comment submit by storing a review in the reviews collection */
function addComment(userDocRef) {
    let queryStr = window.location.search;
    let queryParams = new URLSearchParams(queryStr);
    let eventId = queryParams.get("id");

    let ratingsSelect = document.querySelector('.form-select');
    let commentTextBox = document.querySelector('.comment-text');
    let userDocId = userDocRef.id;
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

/* Called when a user clicks submit button next to comment */
function handleAddComment(e) {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            addComment(docRef);
        } else {
            // No user is signed in.
        }
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
    for (i = 0; i < ratingNum; i++) {
        let starIcon = document.createElement("i");
        starIcon.setAttribute('class', 'bi bi-star-fill');
        commentNode.querySelector('.rating-container').append(starIcon);
    }
    for (i = ratingNum; i < 5; i++) {
        let emptyStarIcon = document.createElement("i");
        emptyStarIcon.setAttribute('class', 'bi bi-star');
        commentNode.querySelector('.rating-container').append(emptyStarIcon);
    }
}

function displayRatingEvent(ratingNum) {
    let starContainer = document.querySelector('.star-container');
    for (i = 0; i < ratingNum; i++) {
        let starIcon = document.createElement("i");
        starIcon.setAttribute('class', 'bi bi-star-fill');
        starContainer.append(starIcon);
    }
    for (i = ratingNum; i < 5; i++) {
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
    let imgCarousel = document.querySelector('.carousel-img');
    let eventDescription = document.querySelector('.event-description');
    let eventName = document.querySelector('.title');
    //let eventLikes = document.querySelector('.likes-text');
    let eventLocation = document.querySelector('.event-location');
    let eventDate = document.querySelector('.event-date');
    let eventCost = document.querySelector('.event-cost');
    let eventLink = document.querySelector('.event-link a');

    imgCarousel.src = doc.data().posterurl;
    eventDescription.innerHTML = doc.data().description;
    eventName.textContent = doc.data().event;
    //eventLikes.textContent = `${doc.data().likecounter} likes`;
    eventLocation.textContent = doc.data().location;
    eventDate.textContent = doc.data().date;
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
            commentNode.querySelector('img').src = userDoc.data().profilePictureUrl;
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

    /* If user is signed in then customize the page */
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.get().then(displayWidgetState);
        } else {
            //TODO: disable components that non-users can't use
            document.querySelector("#comment-input").style.display = 'none';
            document.querySelector(".bookmark-btn").style.display = 'none';
        }
    });
}
eventInit();