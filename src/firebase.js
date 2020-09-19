import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
    apiKey: "AIzaSyC_Wv4ezfmucF_911dXKtrovaghrTKEOV8",
    authDomain: "instagram-clone-rr.firebaseapp.com",
    databaseURL: "https://instagram-clone-rr.firebaseio.com",
    projectId: "instagram-clone-rr",
    storageBucket: "instagram-clone-rr.appspot.com",
    messagingSenderId: "552049540234",
    appId: "1:552049540234:web:8d5ebe70cda700ed538173"
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

export { db, auth, storage };