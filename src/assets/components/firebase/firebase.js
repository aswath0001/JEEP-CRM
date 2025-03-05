// Import necessary Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, get, set, push, update, remove, } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB2y-5GglXBfWxV0yCjx6MtN7NjMsPcbGU",
    authDomain: "service-crm-be437.firebaseapp.com",
    databaseURL: "https://service-crm-be437-default-rtdb.asia-southeast1.firebasedatabase.app/", // Realtime Database URL
    projectId: "service-crm-be437",
    storageBucket: "service-crm-be437.appspot.com",
    messagingSenderId: "1038465222860",
    appId: "1:1038465222860:web:82af71e12e919bcc689a69",
    measurementId: "G-3QNGZ33QWT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication
const database = getDatabase(app); // Realtime Database

// Export Firebase services and Realtime Database functions
export {
    app,
    auth,
    database,
    ref,
    get,
    set,
    push,
    update,
    
    remove
};