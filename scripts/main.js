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
        //console.log("signed in");
        let signOut = document.querySelector('.logoutbtn');
        signOut.style.display = 'block';
    }
    //console.log("not signed in");
})

function addLogoutHandler() {
    let logOutBtn = document.querySelector('.logoutbtn');
    logOutBtn.addEventListener('click', handleLogout);
}
addLogoutHandler();

function insertNavProfilePic() {
    firebase.auth().onAuthStateChanged(user => {
        let profileImage = document.getElementById("navpic")
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here:
            //console.log(user.uid);
            //console.log(user.displayName);
            //user_Name = user.displayName;
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.get().then((doc) => {
                profileImage.style.visibility = 'visible'
                // fill out profile pic here
                let imageLink = doc.data().profilePictureUrl;
                if (imageLink !== "") {
                    profileImage.src = imageLink;
                } else {
                    profileImage.src = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png"
                }
            });
            //method #1:  insert with html only
            //document.getElementById("name-goes-here").innerText = user_Name;    //using javascript
            //method #2:  insert using jquery //using jquery
        } else {
            profileImage.style.visibility = 'hidden'
        }
    });
}
insertNavProfilePic(); //run the function


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