import { db } from "./firebase.js";

import {
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==========================================
// RAZORPAY
// ==========================================

let cart =
    JSON.parse(localStorage.getItem("cart")) || [];


// ==========================================
// CALCULATE TOTAL
// ==========================================

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


// ==========================================
// DISPLAY TOTAL
// ==========================================

const totalElement =
    document.getElementById("total");

if (totalElement) {

    totalElement.innerText =
        total.toFixed(2);

}


const itemCountElement =
    document.getElementById("itemCount");

if (itemCountElement) {

    itemCountElement.innerText =
        itemCount;

}


// ==========================================
// CHECK CART
// ==========================================

if (cart.length === 0) {

    console.warn(
        "Cart is empty"
    );

}


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

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

                body:
                    JSON.stringify({

                        amount:
                            total,

                        receipt:
                            `MPFRAMES_${Date.now()}`

                    })

            }
        );


    const data =
        await response.json();


    console.log(
        "Create order response:",
        data
    );


    if (!response.ok) {

        throw new Error(
            data.error ||
            "Unable to create Razorpay order"
        );

    }


    if (!data.orderId) {

        throw new Error(
            "Razorpay Order ID was not received"
        );

    }


    if (!data.keyId) {

        throw new Error(
            "Razorpay Key ID was not received"
        );

    }


    return data;

}


// ==========================================
// PLACE ORDER
// ==========================================

window.placeOrder =
    async function () {


        // ==================================
        // GET CUSTOMER DETAILS
        // ==================================

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


        // ==================================
        // VALIDATION
        // ==================================

        if (!name) {

            alert(
                "Please enter your name."
            );

            return;

        }


        if (!phone) {

            alert(
                "Please enter your phone number."
            );

            return;

        }


        if (!address) {

            alert(
                "Please enter your address."
            );

            return;

        }


        if (cart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;

        }


        // ==================================
        // PHOTO VALIDATION
        // ==================================

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

                button.disabled =
                    true;

                button.innerText =
                    "Opening Payment...";

            }


            // ==================================
            // IMPORTANT
            // ==================================
            // Currently the image itself is NOT
            // uploaded to Firebase Storage.
            //
            // We temporarily keep the image name.
            //
            // Cloudinary upload can be connected
            // later.
            // ==================================

            const photoName =
                photoFile.name;


            // ==================================
            // CREATE RAZORPAY ORDER
            // ==================================

            const razorpayOrder =
                await createRazorpayOrder();


            console.log(
                "Razorpay order:",
                razorpayOrder
            );


            // ==================================
            // RAZORPAY OPTIONS
            // ==================================

            const options = {

                key:
                    razorpayOrder.keyId,

                amount:
                    razorpayOrder.amount,

                currency:
                    razorpayOrder.currency ||
                    "INR",

                name:
                    "MP Frames",

                description:
                    "MP Frames Order",

                order_id:
                    razorpayOrder.orderId,


                // ==================================
                // PAYMENT SUCCESS
                // ==================================

                handler:
                    async function (
                        paymentResponse
                    ) {

                        console.log(
                            "Payment response:",
                            paymentResponse
                        );


                        if (button) {

                            button.innerText =
                                "Verifying Payment...";

                        }


                        // ==================================
                        // FIRST SAVE ORDER IN FIRESTORE
                        // ==================================

                        const orderDocIds =
                            [];


                        try {

                            for (
                                const item
                                of cart
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


                                    // PHOTO

                                    photo:
                                        "",

                                    photoName:
                                        photoName,


                                    // PAYMENT

                                    paymentStatus:
                                        "Processing",

                                    paymentMethod:
                                        "Razorpay",

                                    paymentId:
                                        paymentResponse
                                            .razorpay_payment_id,

                                    razorpayOrderId:
                                        paymentResponse
                                            .razorpay_order_id,


                                    // ORDER

                                    status:
                                        "Pending",

                                    orderTotal:
                                        total,

                                    createdAt:
                                        new Date()

                                };


                                const docRef =
                                    await addDoc(
                                        collection(
                                            db,
                                            "orders"
                                        ),
                                        orderData
                                    );


                                orderDocIds.push(
                                    docRef.id
                                );

                            }


                            console.log(
                                "Firestore order IDs:",
                                orderDocIds
                            );


                            // ==================================
                            // VERIFY PAYMENT
                            // ==================================

                            const verifyResponse =
                                await fetch(
                                    "/api/verify-payment",
                                    {

                                        method:
                                            "POST",

                                        headers: {

                                            "Content-Type":
                                                "application/json"

                                        },

                                        body:
                                            JSON.stringify({

                                                razorpay_order_id:
                                                    paymentResponse
                                                        .razorpay_order_id,

                                                razorpay_payment_id:
                                                    paymentResponse
                                                        .razorpay_payment_id,

                                                razorpay_signature:
                                                    paymentResponse
                                                        .razorpay_signature,

                                                orderDocIds:
                                                    orderDocIds

                                            })

                                    }
                                );


                            const verifyData =
                                await verifyResponse
                                    .json();


                            console.log(
                                "Payment verification:",
                                verifyData
                            );


                            if (
                                !verifyResponse.ok ||
                                !verifyData.success
                            ) {

                                throw new Error(
                                    verifyData.error ||
                                    "Payment verification failed"
                                );

                            }


                            // ==================================
                            // WHATSAPP
                            // ==================================

                            const whatsapp =
`🛒 MP FRAMES - NEW ORDER

💰 PAYMENT: PAID ✅

Name: ${name}

Phone: ${phone}

Address: ${address}

Items: ${itemCount}

Total: ₹${total.toFixed(2)}

Payment ID:
${paymentResponse.razorpay_payment_id}

Razorpay Order ID:
${paymentResponse.razorpay_order_id}

Order Status: Pending

Message:
${message || "No message"}

Photo:
${photoName}`;


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
                                "Payment successful! Order placed successfully."
                            );


                            // ==================================
                            // HOME
                            // ==================================

                            window.location.href =
                                "index.html";

                        }
                        catch (error) {

                            console.error(
                                "After payment error:",
                                error
                            );


                            alert(
                                "Payment was successful, but order processing failed.\n\n" +
                                error.message
                            );


                            if (button) {

                                button.disabled =
                                    false;

                                button.innerText =
                                    "Place Order";

                            }

                        }

                    },


                // ==================================
                // PAYMENT FAILED
                // ==================================

                modal: {

                    ondismiss:
                        function () {

                            console.log(
                                "Razorpay checkout closed"
                            );

                            if (button) {

                                button.disabled =
                                    false;

                                button.innerText =
                                    "Place Order";

                            }

                        }

                },


                prefill: {

                    name:
                        name,

                    contact:
                        phone

                },


                notes: {

                    address:
                        address,

                    message:
                        message

                },


                theme: {

                    color:
                        "#111111"

                }

            };


            // ==================================
            // OPEN RAZORPAY
            // ==================================

            if (
                typeof Razorpay ===
                "undefined"
            ) {

                throw new Error(
                    "Razorpay SDK not loaded. Check checkout.html."
                );

            }


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
                        "Payment failed.\n\n" +
                        (
                            response.error?.description ||
                            "Something went wrong"
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
                "Checkout error:",
                error
            );


            alert(
                "Payment gateway error:\n\n" +
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
