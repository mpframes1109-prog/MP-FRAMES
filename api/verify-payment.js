import crypto from "crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// Firebase Admin initialization
if (!getApps().length) {
    const serviceAccount =
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    initializeApp({
        credential: cert(serviceAccount)
    });
}

const db = getFirestore();
const messaging = getMessaging();


export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        // Check payment details
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                error: "Missing payment details"
            });
        }


        // Razorpay secret
        const secret =
            process.env.RAZORPAY_KEY_SECRET;


        // Create signature
        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;


        const expectedSignature =
            crypto
                .createHmac("sha256", secret)
                .update(body)
                .digest("hex");


        // Verify signature
        const isValid =
            expectedSignature ===
            razorpay_signature;


        if (!isValid) {

            return res.status(400).json({
                success: false,
                error: "Payment verification failed"
            });

        }


        // =====================================
        // PAYMENT VERIFIED ✅
        // SEND ADMIN NOTIFICATION
        // =====================================

        const snapshot =
            await db
                .collection("adminNotificationTokens")
                .get();


        const tokens =
            snapshot.docs
                .map(doc => doc.data().token)
                .filter(Boolean);


        if (tokens.length > 0) {

            const message = {

                notification: {
                    title: "🛒 New Order - MP Frames",
                    body: "Payment successful! A new customer order has been received."
                },

                data: {
                    type: "NEW_ORDER",
                    paymentId: razorpay_payment_id,
                    orderId: razorpay_order_id
                },

                tokens: tokens
            };


            try {

                const result =
                    await messaging.sendEachForMulticast(
                        message
                    );

                console.log(
                    "FCM notification sent:",
                    result.successCount
                );

            } catch (notificationError) {

                console.error(
                    "FCM notification error:",
                    notificationError
                );

            }

        } else {

            console.log(
                "No admin notification tokens found"
            );

        }


        // =====================================
        // PAYMENT SUCCESS RESPONSE
        // =====================================

        return res.status(200).json({

            success: true,

            paymentId:
                razorpay_payment_id,

            orderId:
                razorpay_order_id

        });


    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        return res.status(500).json({

            success: false,

            error:
                "Verification server error"

        });

    }

}
