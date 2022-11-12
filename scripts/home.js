/* DISPLAY BANNER IF USER IS NOT SIGNED IN */
firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
    let signIn = document.querySelector('.buttons-container');
    signIn.style.display = 'block';
  }
})


function insertName() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      // Do something for the currently logged-in user here:
      //console.log(user.uid);
      //console.log(user.displayName);
      //user_Name = user.displayName;
      docRef = db.collection("users").doc(`${user.uid}`);
      docRef.get().then((doc) => {
        user_Name = doc.data().name;
        $("#name-goes-here").text(user_Name);
      });
      //method #1:  insert with html only
      //document.getElementById("name-goes-here").innerText = user_Name;    //using javascript
      //method #2:  insert using jquery //using jquery

    } else {
      // No user is signed in.
    }
  });
}
insertName(); //run the function


//------------------------------------------------------
// Get data from a CSV file with ".fetch()"
// Since this file is local, you must use "live serve"
//------------------------------------------------------
async function getCSVdata() {
  console.log("hello")
  const response = await fetch('/event_data.csv'); //send get request
  const data = await response.text();      //get file response
  const list = data.split('\n').slice(1);  //get line
  list.forEach(row => {
    const columns = row.split(',');
    const eventtitle = columns[0];
    const eventlink = columns[1];
    const eventlocation = columns[2];
    const eventcost = columns[3];
    const eventdate = columns[4];
    const eventnumericaldate = columns[5]
    const eventimage = columns[6];
    const eventdescription = columns[7]
    const eventlikecount = columns[8]
    db.collection("events").add({   //write to firestore
      event: eventtitle,
      link: eventlink,
      location: eventlocation,
      cost: eventcost,
      date: eventdate,
      numericaldate: eventnumericaldate,
      imageurl: eventimage,
      description: eventdescription,
      likecounter: eventlikecount
    })
  })
}