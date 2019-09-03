import firebase from 'firebase'

const config = {
  apiKey: "AIzaSyD3C0GHIqn8g-CMATS60LDcoQotkqM3ex8",
  authDomain: "stage-db-b035c.firebaseapp.com",
  databaseURL: "https://stage-db-b035c.firebaseio.com",
  projectId: "stage-db-b035c",
  storageBucket: "stage-db-b035c.appspot.com",
  messagingSenderId: "950510485815"
}

firebase.initializeApp(config)

export const ref = firebase.database().ref();
export const db = firebase.database();
export const authRef = firebase.auth;
export const urlToGetImage = "https://mrps-orderform.firebaseapp.com/";
