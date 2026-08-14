// ==========================================
// FIREBASE APP
// ==========================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";


// ==========================================
// FIRESTORE
// ==========================================

import { getFirestore } from
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// FIREBASE STORAGE
// ==========================================

import { getStorage } from
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


// ==========================================
// FIREBASE CONFIG
// ==========================================

const firebaseConfig = {

    apiKey:
        "AIzaSyDhnMP9qnXdhXAsIP6UIeOjuMz-5OVwdwE",

    authDomain:
        "mp-frames.firebaseapp.com",

    projectId:
        "mp-frames",

    storageBucket:
        "mp-frames.firebasestorage.app",

    messagingSenderId:
        "1062760470249",

    appId:
        "1:1062760470249:web:37604cd27f43438aff0278",

    measurementId:
        "G-6GZ6PEEH3L"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app =
    initializeApp(firebaseConfig);


// ==========================================
// INITIALIZE FIRESTORE
// ==========================================

const db =
    getFirestore(app);


// ==========================================
// INITIALIZE STORAGE
// ==========================================

const storage =
    getStorage(app);


// ==========================================
// EXPORT
// ==========================================

export {
    app,
    db,
    storage
};
