import crypto from "crypto";

import {
    initializeApp,
    cert,
    getApps
} from "firebase-admin/app";

import {
    getFirestore
} from "firebase-admin/firestore";

import {
    getMessaging
} from "firebase-admin/messaging";


// =====================================
// FIREBASE ADMIN INITIALIZATION
// =====================================

if (!getApps().length) {

    const serviceAccount =
        JSON.parse(
            process.env.FIREBASE_SERVICE_ACCOUNT
        );

    initializeApp({
        credential:
            cert(serviceAccount)
    });
}


const db =
    getFirestore();

const messaging =
    getMessaging();


// =====================================
// API HANDLER
// =====================================

export default async function handler(
    req,
    res
) {

    // Only POST
    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            error:
                "Method not allowed"

        });

    }


    try {

        const {

            razorpay_order_id,

            razorpay_payment_id,

            razorpay_signature,

            orderDocIds

        } = req.body;


        // =================================
        // VALIDATE PAYMENT DATA
        // =================================

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                error:
                    "Missing payment details"

            });

        }


        // =================================
        // RAZORPAY SECRET
        // =================================

        const secret =
            process.env.RAZORPAY_KEY_SECRET;


        if (!secret) {

            throw new Error(
                "RAZORPAY_KEY_SECRET is not configured"
            );

        }


        // =================================
        // VERIFY SIGNATURE
        // =================================

        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;


        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    secret
                )
                .update(body)
                .digest("hex");


        if (
            expectedSignature !==
            razorpay_signature
        ) {

            console.error(
                "Invalid Razorpay signature"
            );


            return res.status(400).json({

                success: false,

                error:
                    "Payment verification failed"

            });

        }


        console.log(
            "Payment verified:",
            razorpay_payment_id
        );


        // =================================
        // UPDATE FIRESTORE ORDERS
        // =================================

        let updatedOrders = 0;


        if (
            Array.isArray(orderDocIds) &&
            orderDocIds.length > 0
        ) {

            for (
                const docId
                of orderDocIds
            ) {

                if (!docId) {
                    continue;
                }


                await db
                    .collection("orders")
                    .doc(docId)
                    .update({

                        paymentStatus:
                            "Paid",

                        paymentMethod:
                            "Razorpay",

                        paymentId:
                            razorpay_payment_id,

                        razorpayOrderId:
                            razorpay_order_id,

                        paymentVerified:
                            true,

                        paidAt:
                            new Date()

                    });


                updatedOrders++;

            }

        }


        // =================================
        // ADMIN FCM TOKENS
        // =================================

        const snapshot =
            await db
                .collection(
                    "adminNotificationTokens"
                )
                .get();


        const tokens =
            snapshot.docs
                .map(
                    doc =>
                        doc.data().token
                )
                .filter(Boolean);


        // =================================
        // ADMIN NOTIFICATION
        // =================================

        if (tokens.length > 0) {

            const message = {

                notification: {

                    title:
                        "💰 MP Frames - Payment Received",

                    body:
                        `Payment successful. ₹ order paid. Payment ID: ${razorpay_payment_id}`

                },

                data: {

                    type:
                        "PAYMENT_SUCCESS",

                    paymentId:
                        razorpay_payment_id,

                    razorpayOrderId:
                        razorpay_order_id

                },

                tokens:
                    tokens

            };


            try {

                const result =
                    await messaging
                        .sendEachForMulticast(
                            message
                        );


                console.log(
                    "FCM success:",
                    result.successCount
                );


                console.log(
                    "FCM failed:",
                    result.failureCount
                );

            }
            catch (
                notificationError
            ) {

                console.error(
                    "FCM notification error:",
                    notificationError
                );

            }

        }
        else {

            console.log(
                "No admin notification tokens found"
            );

        }


        // =================================
        // SUCCESS RESPONSE
        // =================================

        return res.status(200).json({

            success: true,

            message:
                "Payment verified successfully",

            paymentStatus:
                "Paid",

            paymentId:
                razorpay_payment_id,

            razorpayOrderId:
                razorpay_order_id,

            updatedOrders:
                updatedOrders

        });


    }
    catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                error.message ||
                "Payment verification server error"

        });

    }

}
