import {
    getMessaging,
    getToken,
    onMessage
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging.js";

import {
    app,
    db
} from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const messaging = getMessaging(app);

const VAPID_KEY =
"BCfsMWuDmRYo0PK5dCB6gJPcSy-GWxn4iLR7IopNog94XqPHwMPU4GPQEEgst6tF2-WWhryhHrFQv-QAeTDj4Qw";


export async function requestNotificationPermission() {

    try {

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {
            return null;
        }

        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );

        const token =
            await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration
            });

        if (!token) {
            console.log("FCM token not generated");
            return null;
        }

        // Save admin device token
        await addDoc(
            collection(db, "adminNotificationTokens"),
            {
                token: token,
                createdAt: new Date()
            }
        );

        console.log("Notification token saved ✅");

        return token;

    } catch (error) {

        console.error(
            "FCM setup error:",
            error
        );

        return null;
    }
}


onMessage(messaging, payload => {

    console.log(
        "Notification received:",
        payload
    );

});