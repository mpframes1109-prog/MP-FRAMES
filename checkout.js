import { db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// =====================================================
// CONFIGURATION
// =====================================================

// Cloudinary
const CLOUDINARY_CLOUD_NAME = "YOUR_CLOUD_NAME";
const CLOUDINARY_UPLOAD_PRESET = "YOUR_UNSIGNED_UPLOAD_PRESET";

// Razorpay TEST Key ID
const RAZORPAY_KEY_ID = "rzp_test_YOUR_KEY_ID";


// =====================================================
// CART
// =====================================================

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


// =====================================================
// CALCULATE TOTAL
// =====================================================

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


// =====================================================
// DISPLAY TOTAL
// =====================================================

const totalElement =
    document.getElementById("total");

if (totalElement) {

    totalElement.innerText =
        total.toFixed(2);

}


// =====================================================
// DISPLAY ITEM COUNT
// =====================================================

const itemCountElement =
    document.getElementById("itemCount");

if (itemCountElement) {

    itemCountElement.innerText =
        itemCount;

}


// =====================================================
// CLOUDINARY IMAGE UPLOAD
// =====================================================

async function uploadImageToCloudinary(file) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    const response =
        await fetch(
            uploadURL,
            {
                method: "POST",
                body: formData
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Cloudinary error:",
            data
        );

        throw new Error(
            data.error?.message ||
            "Image upload failed"
        );

    }


    return {

        url: data.secure_url,

        publicId: data.public_id

    };

}


// =====================================================
// CREATE RAZORPAY ORDER
// =====================================================

async function createRazorpayOrder() {

    const response =
        await fetch(
            "/api/create-order",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    amount: total,

                    receipt:
                        `MP_${Date.now()}`

                })

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Razorpay order error:",
            data
        );

        throw new Error(
            data.error ||
            "Unable to create payment order"
        );

    }


    return data;

}


// =====================================================
// PLACE ORDER
// =====================================================

window.placeOrder =
    async function () {


        // =============================================
        // CUSTOMER DETAILS
        // =============================================

        const name =
            document
                .getElementById("name")
                ?.value
                .trim();


        const phone =
            document
                .getElementById("phone")
                ?.value
                .trim();


        const address =
            document
                .getElementById("address")
                ?.value
                .trim();


        const message =
            document
                .getElementById("message")
                ?.value
                .trim() || "";


        const photoInput =
            document.getElementById("photo");


        // =============================================
        // VALIDATION
        // =============================================

        if (
            !name ||
            !phone ||
            !address
        ) {

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


        // =============================================
        // IMAGE VALIDATION
        // =============================================

        if (
            !photoFile.type.startsWith(
                "image/"
            )
        ) {

            alert(
                "Please select a valid image."
            );

            return;

        }


        // 5 MB maximum

        if (
            photoFile.size >
            5 * 1024 * 1024
        ) {

            alert(
                "Image must be less than 5 MB."
            );

            return;

        }


        // =============================================
        // BUTTON
        // =============================================

        const button =
            document.querySelector(
                ".place-order-btn"
            );


        try {


            if (button) {

                button.disabled = true;

                button.innerText =
                    "Opening Payment...";

            }


            // =========================================
            // CHECK RAZORPAY
            // =========================================

            if (
                typeof Razorpay ===
                "undefined"
            ) {

                throw new Error(
                    "Razorpay Checkout is not loaded. Add the Razorpay script to checkout.html."
                );

            }


            // =========================================
            // CREATE RAZORPAY ORDER
            // =========================================

            const razorpayOrder =
                await createRazorpayOrder();


            console.log(
                "Razorpay Order:",
                razorpayOrder
            );


            // =========================================
            // RAZORPAY OPTIONS
            // =========================================

            const options = {

                key:
                    RAZORPAY_KEY_ID,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency ||
                    "INR",

                name:
                    "MP Frames",

                description:
                    "Photo Frame Order",

                order_id:
                    razorpayOrder.id,


                prefill: {

                    name:
                        name,

                    contact:
                        phone

                },


                notes: {

                    customer_name:
                        name,

                    phone:
                        phone,

                    address:
                        address

                },


                theme: {

                    color:
                        "#111111"

                },


                // =====================================
                // PAYMENT SUCCESS
                // =====================================

                handler:
                    async function (
                        paymentResponse
                    ) {


                        try {


                            console.log(
                                "Payment successful:",
                                paymentResponse
                            );


                            if (button) {

                                button.innerText =
                                    "Uploading Photo...";

                            }


                            // =================================
                            // UPLOAD PHOTO TO CLOUDINARY
                            // =================================

                            const image =
                                await uploadImageToCloudinary(
                                    photoFile
                                );


                            console.log(
                                "Cloudinary image:",
                                image.url
                            );


                            if (button) {

                                button.innerText =
                                    "Saving Order...";

                            }


                            // =================================
                            // CREATE FIRESTORE ORDERS
                            // =================================

                            const orderIds = [];


                            for (
                                const item of cart
                            ) {


                                const quantity =
                                    Number(
                                        item.quantity
                                    ) || 1;


                                const price =
                                    Number(
                                        item.price
                                    ) || 0;


                                const orderData = {

                                    // CUSTOMER

                                    customerName:
                                        name,

                                    phone:
                                        phone,

                                    address:
                                        address,


                                    // PRODUCT

                                    frameName:
                                        item.name ||
                                        "",

                                    category:
                                        item.category ||
                                        "",

                                    quantity:
                                        quantity,

                                    price:
                                        price,


                                    // MESSAGE

                                    message:
                                        message,


                                    // IMAGE

                                    photo:
                                        image.url,

                                    photoName:
                                        photoFile.name,

                                    cloudinaryPublicId:
                                        image.publicId,


                                    // PAYMENT

                                    paymentStatus:
                                        "Paid",

                                    paymentId:
                                        paymentResponse.razorpay_payment_id,

                                    razorpayOrderId:
                                        paymentResponse.razorpay_order_id,

                                    razorpaySignature:
                                        paymentResponse.razorpay_signature,


                                    // ORDER STATUS

                                    status:
                                        "Pending",


                                    // TOTAL

                                    orderTotal:
                                        total,


                                    // DATE

                                    createdAt:
                                        new Date()

                                };


                                const orderRef =
                                    await addDoc(
                                        collection(
                                            db,
                                            "orders"
                                        ),
                                        orderData
                                    );


                                orderIds.push(
                                    orderRef.id
                                );

                            }


                            // =================================
                            // WHATSAPP MESSAGE
                            // =================================

                            const whatsapp =
`🛒 MP FRAMES - NEW ORDER

━━━━━━━━━━━━━━━━━━

👤 Name:
${name}

📱 Phone:
${phone}

📍 Address:
${address}

🖼️ Items:
${itemCount}

💰 Total:
₹${total.toFixed(2)}

💳 Payment:
PAID ✅

💳 Payment ID:
${paymentResponse.razorpay_payment_id}

📦 Order Status:
Pending

💬 Message:
${message || "No message"}

🖼️ Customer Photo:
${image.url}

━━━━━━━━━━━━━━━━━━

Order IDs:
${orderIds.join(", ")}`;


                            // =================================
                            // OPEN WHATSAPP
                            // =================================

                            window.open(
                                "https://wa.me/6382667556?text=" +
                                encodeURIComponent(
                                    whatsapp
                                ),
                                "_blank"
                            );


                            // =================================
                            // CLEAR CART
                            // =================================

                            localStorage.removeItem(
                                "cart"
                            );


                            // =================================
                            // SUCCESS
                            // =================================

                            alert(
                                "Payment Successful!\n\nOrder placed successfully."
                            );


                            // =================================
                            // HOME
                            // =================================

                            window.location.href =
                                "index.html";


                        }

                        catch (error) {


                            console.error(
                                "Post-payment error:",
                                error
                            );


                            alert(
                                "Payment was successful, but order saving/upload failed.\n\nPlease contact MP Frames with your Payment ID:\n" +
                                paymentResponse.razorpay_payment_id
                            );


                            if (button) {

                                button.disabled =
                                    false;

                                button.innerText =
                                    "Place Order";

                            }

                        }

                    },


                // =====================================
                // PAYMENT FAILED
                // =====================================

                modal: {

                    ondismiss:
                        function () {

                            console.log(
                                "Payment window closed."
                            );


                            if (button) {

                                button.disabled =
                                    false;

                                button.innerText =
                                    "Place Order";

                            }

                        }

                }

            };


            // =============================================
            // OPEN RAZORPAY
            // =============================================

            const razorpay =
                new Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                function (
                    response
                ) {


                    console.error(
                        "Payment failed:",
                        response
                    );


                    alert(
                        "Payment Failed!\n\n" +
                        (
                            response.error?.description ||
                            "Please try again."
                        )
                    );


                    if (button) {

                        button.disabled =
                            false;

                        button.innerText =
                            "Place Order";

                    }

                }
            );


            razorpay.open();


        }

        catch (error) {


            console.error(
                "Order error:",
                error
            );


            alert(
                "Unable to start payment.\n\n" +
                error.message
            );


            if (button) {

                button.disabled =
                    false;

                button.innerText =
                    "Place Order";

            }

        }

    };
