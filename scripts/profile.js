/* SEND USER TO HOME PAGE IF NOT SIGNED IN */
// temporarily commented out
/* firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.assign("index.html");
  }
}) */

/* Use users document reference to set users document fields */
let changeProfile = function (docref) {
  let imageURL = document.querySelector('#imageurl');
  let userName = document.querySelector('#username');
  let text = document.querySelector('#exampleFormControlTextarea1');

  docref.set({
    name: userName.value,
    description: text.value,
    profilePictureUrl: imageURL.value
  }, { merge: true }).then(() => {
    userName.value = "";
    text.value = "";
    imageURL.value = "";
    location.reload();
  });
}

/* Find users document reference for signed in user and pass to changeProfile function */
let handleProfileChange = function (e) {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      docRef = db.collection("users").doc(`${user.uid}`);
      changeProfile(docRef);
    } else {
      // No user is signed in.
    }
  });
}

// Set up "edit profile" button handler here
let profileButton = document.querySelector('.profile-button');
profileButton.addEventListener('click', handleProfileChange);

/* Callback that uses returned document to fill out profile page */
let fillProfile = function (doc) {
  let placeHolders = document.querySelectorAll('.placeholder');
  placeHolders.forEach(e => (e.style.display = 'none'))
  let profileUsername = document.querySelector('.profile .card-title');
  let profileName = document.querySelector('.profile h6');
  let profileDescription = document.querySelector('.profile .card-text');
  profileUsername.textContent = doc.data().name;
  profileName.textContent = doc.data().email;
  profileDescription.textContent = doc.data().description;

  //fill out "edit profile" section here
  let imageURL = document.querySelector('#imageurl');
  let userName = document.querySelector('#username');
  let text = document.querySelector('#exampleFormControlTextarea1');
  imageURL.value = doc.data().profilePictureUrl;
  userName.value = doc.data().name;
  text.value = doc.data().description;

  // fill out profile pic here
  let profileImage = document.querySelector('.profile-pic');
  let imageLink = doc.data().profilePictureUrl;
  console.log(imageLink);
  if (imageLink !== "") {
    profileImage.src = imageLink;
  }
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

/* Sign user out */
function logout() {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
  }).catch((error) => {
    // An error happened.
  });
}