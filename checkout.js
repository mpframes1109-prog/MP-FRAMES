import { db } from "./firebase.js";

import {
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

cart.forEach(item => {
    total += item.price * (item.quantity || 1);
});

document.getElementById("total").innerText = total;

window.placeOrder = async function () {

    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let address = document.getElementById("address").value.trim();

    if (!name || !phone || !address) {
        alert("Fill all details");
        return;
    }

    if (cart.length == 0) {
        alert("Cart is empty");
        return;
    }

    for (const item of cart) {

        await addDoc(collection(db, "orders"), {

            customerName: name,
            phone: phone,
            address: address,

            frameName: item.name,
            category: item.category || "",

            quantity: item.quantity || 1,

            price: item.price,

            message: "",

            status: "Pending",

            createdAt: new Date()

        });

    }

    let whatsapp = `🛒 New Order

Name : ${name}

Phone : ${phone}

Address : ${address}

Total : ₹${total}`;

    window.open(
        "https://wa.me/6382667556?text=" +
        encodeURIComponent(whatsapp),
        "_blank"
    );

    localStorage.removeItem("cart");

    alert("Order Placed Successfully");

    location.href = "index.html";
}
