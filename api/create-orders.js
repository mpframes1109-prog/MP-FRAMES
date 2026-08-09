import Razorpay from "razorpay";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: "Invalid amount"
            });
        }

        const order = await razorpay.orders.create({

            amount: Math.round(amount * 100),

            currency: "INR",

            receipt:
                "mpframes_" +
                Date.now(),

            notes: {
                website: "MP Frames"
            }

        });

        return res.status(200).json(order);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Unable to create Razorpay order"
        });

    }

}