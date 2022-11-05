/* SEND USER TO HOME PAGE IF NOT SIGNED IN */
// temporarily commented out
/* firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.assign("index.html");
  }
}) */

let changeProfile = function(docref) {
  let userName = document.querySelector('#username');
  let text = document.querySelector('#exampleFormControlTextarea1');

  docref.set({
    name: userName.value,
    description: text.value
  }, {merge: true}).then(() => {
    userName.value = ""; 
    text.value = ""; 
    location.reload();
  });
}

let handleProfileChange = function(e) {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
        // find users document for signed in user and set fields
        docRef = db.collection("users").doc(`${user.uid}`);
        changeProfile(docRef);
    } else {
        // No user is signed in.
    }
  });
}

let profileButton = document.querySelector('.profile-button');
profileButton.addEventListener('click', handleProfileChange);

/* Callback that uses returned document to fill out profile page */
let fillProfile = function(doc) {
  let placeHolders = document.querySelectorAll('.placeholder');
  placeHolders.forEach(e => (e.style.display = 'none'))
  let profileUsername = document.querySelector('.profile .card-title');
  let profileName = document.querySelector('.profile h6');
  let profileDescription = document.querySelector('.profile .card-text');
  profileUsername.textContent = doc.data().name;
  profileName.textContent = doc.data().email;
  profileDescription.textContent = doc.data().description;
};

/* Initialize the profile page */
function profileInit() {
  firebase.auth().onAuthStateChanged(user => {
      // Check if a user is signed in:
      if (user) {
          // find users document for signed in user and pass to callback
          docRef = db.collection("users").doc(`${user.uid}`);
          docRef.get().then(fillProfile);
      } else {
          // No user is signed in.
      }
  });
}
profileInit();