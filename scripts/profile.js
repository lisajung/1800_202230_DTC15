/* SEND USER TO HOME PAGE IF NOT SIGNED IN */
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    window.location.assign("index.html");
  }
})
