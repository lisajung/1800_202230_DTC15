//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyDVv9s1-lpA76d31vO6PulkyiyY0UI-5RI",
    authDomain: "ditch-the-cubicle-aa07d.firebaseapp.com",
    projectId: "ditch-the-cubicle-aa07d",
    storageBucket: "ditch-the-cubicle-aa07d.appspot.com",
    messagingSenderId: "422083844888",
    appId: "1:422083844888:web:56191423b7e37139f19c6d"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();