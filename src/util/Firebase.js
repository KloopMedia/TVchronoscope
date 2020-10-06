import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyA7eaMwb1kmociq3AJFOBjOZ8N-Pfue1eY",
    authDomain: "humanrights-1338c.firebaseapp.com",
    databaseURL: "https://humanrights-1338c.firebaseio.com",
    projectId: "humanrights-1338c",
    storageBucket: "humanrights-1338c.appspot.com",
    messagingSenderId: "1098148360327",
    appId: "1:1098148360327:web:4aa8cd22b6c6de445e8822"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const provider = new firebase.auth.GoogleAuthProvider();
  export const signInWithGoogle = () => {
    firebase.auth().signInWithPopup(provider);
  };

export default firebase;