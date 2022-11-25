/* SEND USER TO HOME PAGE IF NOT SIGNED IN */
function checkUserLoggedIn() {
  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      window.location.assign("index.html");
    }
  })
}
checkUserLoggedIn();

/* Use users document reference to set users document fields */
function changeProfile(docref) {
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
function handleProfileChange(e) {
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
function addProfileButtonHandler() {
  let profileButton = document.querySelector('.profile-button');
  profileButton.addEventListener('click', handleProfileChange);
};
addProfileButtonHandler();

// Set the appropriate classes for carousel items
function activateCarousel() {
  let activeItemNode = document.querySelector(".carousel-item");
  let activeButtonNode = document.querySelector(".carousel-button");

  if (activeItemNode !== null) {
    activeItemNode.setAttribute('class', 'carousel-item active');
    activeButtonNode.setAttribute('class', 'carousel-button active');
  }
}

async function fillSavedEvents(doc) {
  let carouselItemTemplate = document.querySelector("#carousel-template");
  let carouselContainer = document.querySelector(".carousel-inner");

  let carouselButtonTemplate = document.querySelector("#carousel-button-template");
  let carouselButtonContainer = document.querySelector(".carousel-indicators");

  let savedEvents = doc.data().savedEvents;
  if (savedEvents.length <= 0) {
    document.querySelector("#carouselExampleCaptions").style.display = "none";
    return;
  }
  for (i = 0; i < savedEvents.length; i++) { 
      docRef = db.collection("events").doc(`${savedEvents[i]}`);
      await docRef.get().then((eventDoc) => {
          let carouselItemNode = carouselItemTemplate.content.cloneNode(true);

          carouselItemNode.querySelector('.carousel-item img').src = eventDoc.data().posterurl;
          carouselItemNode.querySelector('.carousel-item a').href = `/html/event.html?id=${eventDoc.id}`
          carouselItemNode.querySelector('.carousel-caption h4').textContent = eventDoc.data().event;
          carouselContainer.appendChild(carouselItemNode);

          let carouselButtonNode = carouselButtonTemplate.content.cloneNode(true);

          carouselButtonNode.querySelector('button').setAttribute('data-bs-slide-to', `${i}`);
          carouselButtonContainer.appendChild(carouselButtonNode);
      });
  }

  activateCarousel();
  removeBookmarkSetup();
}

function removeBookmarkSetup() {
  let removeButton = document.querySelector('.remove-btn');
  removeButton.addEventListener('click', (e) => {
    let link = document.querySelector('.carousel-inner .active a').href;
    let url = new URL(link);
    let queryString = url.searchParams;
    let eventId = queryString.get("id");
    firebase.auth().onAuthStateChanged(user => {
      // Check if a user is signed in:
      if (user) {
        docRef = db.collection("users").doc(`${user.uid}`);
        docRef.update({
            savedEvents: firebase.firestore.FieldValue.arrayRemove(`${eventId}`)
        }).then(() => location.reload());
      } else {
        // No user is signed in.
      }
    });
  });
}

function addSettingListeners() {
  let radioForm = document.querySelector('.radio-form');

  radioForm.addEventListener('change', (e) => {
      firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
          // find users document for signed in user and pass to callback
          docRef = db.collection("users").doc(`${user.uid}`);
          docRef.update({
            background: e.target.getAttribute('data-url')
          }).then(fillBackground);
        } else {
          // No user is signed in.
        }
      });
    }
  );
}

/* Get correct personalized settings for settings page of profile page */
function fillSettings(doc) {
  let currentBackground = doc.data().background;

  //also set radio form
  let radioForm = document.querySelector('.radio-form');
  let radioNodes = radioForm.querySelectorAll('input[type="radio"]');
  for (const node of radioNodes) {
    if (node.getAttribute('data-url') == currentBackground) {
      node.checked = true;
    }
  }
  
  addSettingListeners();
}

/* Callback that uses returned document to fill out profile page */
function fillProfile(doc) {
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

  fillSavedEvents(doc);

  // fill out profile pic here
  let profileImage = document.querySelector('.profile-pic');
  let imageLink = doc.data().profilePictureUrl;
  if (imageLink !== "") {
    profileImage.src = imageLink;
  } else {
    profileImage.src = "https://uxwing.com/wp-content/themes/uxwing/download/peoples-avatars/no-profile-picture-icon.png"
  }
}

/* Initialize the profile page */
function profileInit() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      // find users document for signed in user and pass to callback
      docRef = db.collection("users").doc(`${user.uid}`);
      docRef.get().then(fillProfile);
      docRef.get().then(fillSettings);
    } else {
      // No user is signed in.
    }
  });
}
profileInit();

