import { db, storage } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";


let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

cart.forEach(item => {
    total += Number(item.price) * (item.quantity || 1);
});

document.getElementById("total").innerText = total;


window.placeOrder = async function () {

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const address = document.getElementById("address").value.trim();
    const photoInput = document.getElementById("photo");

    if (!name || !phone || !address) {
        alert("Please fill all customer details");
        return;
    }

    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    if (!photoInput || !photoInput.files.length) {
        alert("Please upload your frame photo");
        return;
    }

    const photoFile = photoInput.files[0];

    // Allow only images
    if (!photoFile.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
    }

    // 5 MB limit
    if (photoFile.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5 MB");
        return;
    }


    try {

        // Disable button while processing
        const button = document.querySelector(".checkout button");

        if (button) {
            button.disabled = true;
            button.innerText = "Uploading...";
        }


        // Unique file name
        const fileName =
            `orders/${Date.now()}_${photoFile.name}`;


        // Firebase Storage reference
        const storageRef = ref(storage, fileName);


        // Upload image
        await uploadBytes(storageRef, photoFile);


        // Get image URL
        const photoURL =
            await getDownloadURL(storageRef);


        // Create one order for each cart item
        for (const item of cart) {

            await addDoc(collection(db, "orders"), {

                customerName: name,

                phone: phone,

                address: address,

                frameName: item.name,

                category: item.category || "",

                quantity: item.quantity || 1,

                price: Number(item.price),

                message: "",

                photo: photoURL,

                photoName: photoFile.name,

                status: "Pending",

                createdAt: new Date()

            });

        }


        // WhatsApp message
        const whatsapp =
`🛒 New Order - MP Frames

Name: ${name}

Phone: ${phone}

Address: ${address}

Total: ₹${total}

Status: Pending`;


        window.open(
            "https://wa.me/6382667556?text=" +
            encodeURIComponent(whatsapp),
            "_blank"
        );


        // Clear cart
        localStorage.removeItem("cart");


        alert("Order Placed Successfully!");


        // Go home
        window.location.href = "index.html";


    } catch (error) {

        console.error("Order error:", error);

        alert(
            "Order failed!\n\n" +
            error.message
        );


        const button = document.querySelector(".checkout button");

        if (button) {
            button.disabled = false;
            button.innerText = "Place Order";
        }

    }

};
