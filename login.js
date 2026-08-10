import { app } from "./firebase.js";

import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const auth = getAuth(app);

const loginForm = document.getElementById("loginForm");
const loginBtn = document.getElementById("loginBtn");
const errorMessage = document.getElementById("errorMessage");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    errorMessage.textContent = "";

    if (!email || !password) {
        errorMessage.textContent = "Please enter email and password.";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        window.location.href = "admin.html";

    } catch (error) {

        console.error("Login error:", error);

        if (error.code === "auth/invalid-credential") {
            errorMessage.textContent =
                "Invalid email or password.";
        }
        else if (error.code === "auth/user-not-found") {
            errorMessage.textContent =
                "Admin account not found.";
        }
        else if (error.code === "auth/wrong-password") {
            errorMessage.textContent =
                "Incorrect password.";
        }
        else if (error.code === "auth/too-many-requests") {
            errorMessage.textContent =
                "Too many attempts. Please try again later.";
        }
        else {
            errorMessage.textContent =
                error.message;
        }

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});
