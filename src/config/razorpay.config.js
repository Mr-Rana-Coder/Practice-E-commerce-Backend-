import Razorpay from "razorpay";
import { ApiError } from "../utils/apiError.js";

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createRazorpayOrder = async (amount) => {
    try {
        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            payment_capture: 1
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        if (!razorpayOrder) {
            throw new ApiError(400, "Unable to create razorpay order")
        }
        return razorpayOrder;
    } catch (error) {
        console.error("Error fetching payment details:", error);
        throw new ApiError(400, "Unable to create payment order");
    }
}

const fetchPaymentDetails = async (paymentId) => {
    try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        if (!payment) {
            throw new ApiError(400, "Payment details not found");
        }
        return payment;
    } catch (error) {
        console.error("Error fetching payment details:", error);
        throw new ApiError(400, "Unable to fetch payment details");
    }
};

export {
    createRazorpayOrder, fetchPaymentDetails
}