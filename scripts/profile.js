/* SEND USER TO HOME PAGE IF NOT SIGNED IN */
// temporarily commented out
/* firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.assign("index.html");
  }
}) */

/* Callback that uses returned document to fill out profile page */
let fillProfile = function (doc) {
  let profileUsername = document.querySelector('.profile .card-title');
  let profileName = document.querySelector('.profile h6');
  profileUsername.textContent = doc.data().name;
  profileName.textContent = doc.data().email;
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