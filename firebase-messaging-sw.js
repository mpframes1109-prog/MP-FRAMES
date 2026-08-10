importScripts(
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyDhnMP9qnXdhXAsIP6UIeOjuMz-5OVwdwE",
    authDomain: "mp-frames.firebaseapp.com",
    projectId: "mp-frames",
    storageBucket: "mp-frames.firebasestorage.app",
    messagingSenderId: "1062760470249",
    appId: "1:1062760470249:web:37604cd27f43438aff0278"
});

const messaging =
    firebase.messaging();


messaging.onBackgroundMessage(
    payload => {

        const title =
            payload.notification?.title ||
            "MP Frames";

        const options = {

            body:
                payload.notification?.body ||
                "New notification",

            icon: "/images/logo.png"
        };


        self.registration.showNotification(
            title,
            options
        );
    }
);