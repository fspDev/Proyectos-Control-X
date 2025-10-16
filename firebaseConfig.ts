// src/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQVzlyJ4TpPdYOVm-ffcYnwG0L7euO8GI",
  authDomain: "proyectos-control-x.firebaseapp.com",
  projectId: "proyectos-control-x",
  storageBucket: "proyectos-control-x.appspot.com",
  messagingSenderId: "1053427107149",
  appId: "1:1053427107149:web:4e0a32eec1d46e9ec72304"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };