// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuSs3F2yUdytj1bztoQ3fuHL0lG19myAs",
  authDomain: "aws-pd.firebaseapp.com",
  projectId: "aws-pd",
  storageBucket: "aws-pd.firebasestorage.app",
  messagingSenderId: "95749356045",
  appId: "1:95749356045:web:5c7a6a0c3e9fbfb80cf344",
  measurementId: "G-GJJ7DN1S6X",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// export const analytics = getAnalytics(app);
