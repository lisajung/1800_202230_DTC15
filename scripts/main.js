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