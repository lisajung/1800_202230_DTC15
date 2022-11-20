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
    // [title, link, location, cost, StartDate, EndDate, numericaldate, image, poster, text, rating]
    const columns = row.split(',');
    const eventtitle = columns[0];
    const eventlink = columns[1];
    const eventlocation = columns[2];
    const eventcost = columns[3];
    const startdate = columns[4];
    const enddate = columns[5];
    const eventnumericaldate = Number(columns[6]);
    const eventimage = columns[7];
    const eventposter = columns[8];
    const eventdescription = columns[9];
    const eventrating = Number(columns[10]);

    console.log(eventnumericaldate)
    console.log(eventrating)
    console.log("---break---")
    db.collection("events").add({   //write to firestore
      event: eventtitle,
      link: eventlink,
      location: eventlocation,
      cost: eventcost,
      startdate: startdate,
      enddate: enddate,
      numericaldate: eventnumericaldate,
      imageurl: eventimage,
      posterurl: eventposter,
      description: eventdescription,
      rating: eventrating,
    })
  })
}


function populateCardsDynamically() {
  let eventCardTemplate = document.getElementById("eventCardTemplate");
  let eventCardGroup = document.getElementById("eventCardGroup");
  db.collection("events").orderBy("numericaldate", "asc").get()
    .then(allEvents => {
      allEvents.forEach(doc => {
        var eventName = doc.data().event; //gets the name field
        var eventImg = doc.data().posterurl;
        // var hikeID = doc.data().code; //gets the unique ID field
        // var hikeLength = doc.data().length; //gets the length field
        let testEventCard = eventCardTemplate.content.cloneNode(true);
        testEventCard.querySelector('.card-title').innerHTML = eventName;     //equiv getElementByClassName
        // testEventCard.querySelector('.card-length').innerHTML = hikeLength;  //equiv getElementByClassName
        // testEventCard.querySelector('a').onclick = () => setHikeData(hikeID);//equiv getElementByTagName
        testEventCard.querySelector('img').src = eventImg;   //equiv getElementByTagName
        // create individual links for each event
        testEventCard.querySelector(".event-link").href = `/html/event.html?id=${doc.id}`;

        eventCardGroup.appendChild(testEventCard);
      })

    })
}
populateCardsDynamically();