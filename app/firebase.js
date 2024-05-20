// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeUNN7J5J5HDpHgfIUfEp0PUUjhnYugSM",
  authDomain: "expenser-a4845.firebaseapp.com",
  projectId: "expenser-a4845",
  storageBucket: "expenser-a4845.appspot.com",
  messagingSenderId: "1064916842855",
  appId: "1:1064916842855:web:428c4f0214b3f4781557c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);