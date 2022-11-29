//------------------------------------------------------
// Selects the background image on webpage
//
// PARAM doc > User document from firebase
// RETURN > NONE
//------------------------------------------------------
function setBackground(doc) {
    currentBackground = doc.data().background;
    bodyNode = document.querySelector('body');
    if (currentBackground == "") {
        bodyNode.setAttribute('style', "");
        return;
    }
    bodyNode.setAttribute('style', `background-image: url(${currentBackground}); background-repeat: no-repeat; background-attachment: fixed; background-size: cover;`);
}

//------------------------------------------------------
// Fills the background of the page with the selected image
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function fillBackground() {
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.get().then(setBackground);
        } else {
            // No user is signed in.
        }
    });
}

//------------------------------------------------------
// Sets up the nav bar
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function setUpNavbar() {
    insertNavProfilePic();
    displayLogoutButton();
    addLogoutHandler();
}

//------------------------------------------------------
// Loads the nav bar and footer into webpages
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function loadSkeleton() {
    $('#navbarPlaceholder').load('../text/navbar.html', setUpNavbar);
    $('#footerPlaceholder').load('../text/footer.html');
    fillBackground();
}
loadSkeleton();

//------------------------------------------------------
// Logs the user out of the website
//
// PARAM e > An unused object caught by the function
// RETURN > NONE
//------------------------------------------------------
function handleLogout(e) {
    firebase.auth().signOut().then(() => { // Signs user out of website
        // Sign-out successful.
        location.reload();
    }).catch((error) => {
        // An error happened.
        console.log(error);
    });
}

//------------------------------------------------------
// Adds listener to log out button
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function addLogoutHandler() {
    let logOutBtn = document.querySelector('.logoutbtn');
    logOutBtn.addEventListener('click', handleLogout);
}

//------------------------------------------------------
// Loads the logout button onto the nav bar
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function displayLogoutButton() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            let signOut = document.querySelector('.logoutbtn');
            signOut.style.display = 'block';
        }
    })
}

//------------------------------------------------------
// Inserts the profile picture into the nav bar
//
// PARAM > NONE
// RETURN > NONE
//------------------------------------------------------
function insertNavProfilePic() {
    firebase.auth().onAuthStateChanged(user => {
        let profileImage = document.getElementById("navpic");
        let profileImageContainer = document.querySelector(".navprofilepic");
        // Check if a user is signed in:
        if (user) {
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.get().then((doc) => {
                profileImage.style.visibility = 'visible';
                // fill out profile pic here
                let imageLink = doc.data().profilePictureUrl; // READ image url from firebase
                if (imageLink !== "") {
                    profileImage.src = imageLink;
                } else {
                    profileImage.src = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png"
                }
            });
        } else {
            profileImage.style.visibility = 'hidden';
            profileImageContainer.style.display = 'none';
        }
    });
}