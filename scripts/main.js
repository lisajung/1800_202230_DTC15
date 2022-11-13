function handleLogout(e) {
    /* Sign user out */
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        location.reload();
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
}

/* DISPLAY logout button IF USER IS SIGNED IN */
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("signed in");
        let signOut = document.querySelector('.logoutbtn');
        signOut.style.display = 'block';
    }
    console.log("not signed in");
})

function addLogoutHandler() {
    let logOutBtn = document.querySelector('.logoutbtn');
    logOutBtn.addEventListener('click', handleLogout);
}
addLogoutHandler();


// function populateCardsDynamically() {
//     let eventCardTemplate = document.getElementById("eventCardTemplate");
//     let eventCardGroup = document.getElementById("eventCardGroup");
//     db.collection("events").get()
//         .then(allEvents => {
//             allEvents.forEach(doc => {
//                 var eventName = doc.data().event; //gets the name field
//                 var eventImg = doc.data().imageurl;
//                 // var hikeID = doc.data().code; //gets the unique ID field
//                 // var hikeLength = doc.data().length; //gets the length field
//                 let testEventCard = eventCardTemplate.content.cloneNode(true);
//                 testEventCard.querySelector('.card-title').innerHTML = eventName;     //equiv getElementByClassName
//                 // testEventCard.querySelector('.card-length').innerHTML = hikeLength;  //equiv getElementByClassName
//                 // testEventCard.querySelector('a').onclick = () => setHikeData(hikeID);//equiv getElementByTagName
//                 testEventCard.querySelector('img').src = eventImg;   //equiv getElementByTagName
//                 eventCardGroup.appendChild(testEventCard);
//             })

//         })
// }
// populateCardsDynamically();