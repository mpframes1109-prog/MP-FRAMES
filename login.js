import { app } from "./firebase.js";

import {
  getAuth,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const auth = getAuth(app);

window.login = async function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Please enter email and password");
        return;
    }

    try {

        await signInWithEmailAndPassword(auth, email, password);

        alert("Login Successful");

        window.location.href = "admin.html";

    } catch (error) {
      
      
        console.log(error);
alert(error.code + "\n" + error.message);








    }

}