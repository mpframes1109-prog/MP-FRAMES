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


// ======================================
// CART
// ======================================

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


// ======================================
// TOTAL
// ======================================

let total = 0;
let itemCount = 0;

cart.forEach(item => {

    const price =
        Number(item.price) || 0;

    const quantity =
        Number(item.quantity) || 1;

    total += price * quantity;

    itemCount += quantity;

});


// Display total

const totalElement =
    document.getElementById("total");

if (totalElement) {

    totalElement.innerText =
        total.toFixed(2);

}


// Display item count

const itemCountElement =
    document.getElementById("itemCount");

if (itemCountElement) {

    itemCountElement.innerText =
        itemCount;

}


// ======================================
// PLACE ORDER
// ======================================

window.placeOrder = async function () {

    const name =
        document.getElementById("name")
            ?.value
            .trim();

    const phone =
        document.getElementById("phone")
            ?.value
            .trim();

    const address =
        document.getElementById("address")
            ?.value
            .trim();

    const message =
        document.getElementById("message")
            ?.value
            .trim() || "";

    const photoInput =
        document.getElementById("photo");


    // ==================================
    // VALIDATION
    // ==================================

    if (!name || !phone || !address) {

        alert(
            "Please fill your Name, Phone Number and Address."
        );

        return;

    }


    if (cart.length === 0) {

        alert(
            "Your cart is empty."
        );

        return;

    }


    if (
        !photoInput ||
        !photoInput.files ||
        photoInput.files.length === 0
    ) {

        alert(
            "Please upload your frame photo."
        );

        return;

    }


    const photoFile =
        photoInput.files[0];


    // ==================================
    // IMAGE VALIDATION
    // ==================================

    if (!photoFile.type.startsWith("image/")) {

        alert(
            "Please select a valid image file."
        );

        return;

    }


    // Maximum 5 MB

    if (
        photoFile.size >
        5 * 1024 * 1024
    ) {

        alert(
            "Image must be less than 5 MB."
        );

        return;

    }


    // ==================================
    // BUTTON
    // ==================================

    const button =
        document.querySelector(
            ".place-order-btn"
        );


    try {

        if (button) {

            button.disabled = true;

            button.innerText =
                "Uploading Photo...";

        }


        // ==================================
        // UPLOAD PHOTO
        // ==================================

        const safeFileName =
            photoFile.name
                .replace(/[^a-zA-Z0-9._-]/g, "_");


        const fileName =
            `orders/${Date.now()}_${safeFileName}`;


        const storageRef =
            ref(
                storage,
                fileName
            );


        await uploadBytes(
            storageRef,
            photoFile
        );


        // ==================================
        // GET IMAGE URL
        // ==================================

        const photoURL =
            await getDownloadURL(
                storageRef
            );


        // ==================================
        // CREATE ORDERS
        // ==================================

        if (button) {

            button.innerText =
                "Saving Order...";

        }


        for (const item of cart) {

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(item.price) || 0;


            await addDoc(
                collection(db, "orders"),
                {

                    // CUSTOMER

                    customerName:
                        name,

                    phone:
                        phone,

                    address:
                        address,


                    // PRODUCT

                    frameName:
                        item.name || "",

                    category:
                        item.category || "",

                    quantity:
                        quantity,

                    price:
                        price,


                    // CUSTOMER MESSAGE

                    message:
                        message,


                    // IMAGE

                    photo:
                        photoURL,

                    photoName:
                        photoFile.name,


                    // PAYMENT

                    paymentStatus:
                        "Not Paid",


                    // ORDER STATUS

                    status:
                        "Pending",


                    // TOTAL

                    orderTotal:
                        total,


                    // DATE

                    createdAt:
                        new Date()

                }
            );

        }


        // ==================================
        // WHATSAPP MESSAGE
        // ==================================

        const whatsapp =
`🛒 MP Frames - New Order

Name: ${name}

Phone: ${phone}

Address: ${address}

Items: ${itemCount}

Total: ₹${total.toFixed(2)}

Payment: Not Paid

Order Status: Pending

Message: ${message || "No message"}

Photo: ${photoURL}`;


        // Open WhatsApp

        window.open(
            "https://wa.me/6382667556?text=" +
            encodeURIComponent(
                whatsapp
            ),
            "_blank"
        );


        // ==================================
        // CLEAR CART
        // ==================================

        localStorage.removeItem(
            "cart"
        );


        alert(
            "Order placed successfully!"
        );


        // ==================================
        // HOME
        // ==================================

        window.location.href =
            "index.html";


    } catch (error) {

        console.error(
            "Order error:",
            error
        );


        alert(
            "Order failed!\n\n" +
            error.message
        );


        if (button) {

            button.disabled = false;

            button.innerText =
                "Place Order";

        }

    }

};
