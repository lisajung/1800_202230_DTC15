/* Callback function to setup navbar once skeleton is loaded */
function setUpNavbar() {
    insertNavProfilePic();
    displayLogoutButton();
    addLogoutHandler();
}

/* load navbar and footer into all pages of web app */
function loadSkeleton(){
    $('#navbarPlaceholder').load('../text/navbar.html', setUpNavbar);
    $('#footerPlaceholder').load('../text/footer.html');
}
loadSkeleton();

/* Logout user when they click logout button */
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

/* Add handler function to logout button */
function addLogoutHandler() {
    let logOutBtn = document.querySelector('.logoutbtn');
    logOutBtn.addEventListener('click', handleLogout);
}

/* Display logout button if user is signed in */
function displayLogoutButton() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            let signOut = document.querySelector('.logoutbtn');
            signOut.style.display = 'block';
        }
    })
}

/* Insert the user's profile pic into navbar */
function insertNavProfilePic() {
    firebase.auth().onAuthStateChanged(user => {
        let profileImage = document.getElementById("navpic");
        let profileImageContainer = document.querySelector(".navprofilepic");
        // Check if a user is signed in:
        if (user) {
            // Do something for the currently logged-in user here:
            docRef = db.collection("users").doc(`${user.uid}`);
            docRef.get().then((doc) => {
                profileImage.style.visibility = 'visible';
                // fill out profile pic here
                let imageLink = doc.data().profilePictureUrl;
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