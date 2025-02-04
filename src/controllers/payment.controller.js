import crypto from "crypto";
import { ApiError } from "../utils/apiError.js";
import { fetchPaymentDetails } from "../config/razorpay.config.js";
import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const verifyPayment = asyncHandler(async (req, res) => {

    const { userOrderId } = req.params || req.body;
    if (!userOrderId) {
        throw new ApiError(400, "User order id is required")
    }
    if (!mongoose.isValidObjectId(userOrderId)) {
        throw new ApiError(400, "User order id is invalid")
    }
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const { razorpayPaymentId, razorpayOrderId, signature } = req.body;
    if ([razorpayPaymentId, razorpayOrderId, signature].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required")
    }
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === signature) {
        //For now unable to simulate real time payment data.
        //     const paymentDetailsFromRazorpay = await fetchPaymentDetails(razorpayPaymentId);
        //     if (!paymentDetailsFromRazorpay) {
        //         throw new ApiError(400, "Unable to fetch payment details")
        //     }
        //     console.log(paymentDetailsFromRazorpay)

        const payment = await Payment.create({
            owner: userId,
            userOrderId: userOrderId,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            paymentMethod: "Debit Card",
            paymentStatus: "Captured",
            transactionId: "payment_Abc123456"
        })
        const order = await Order.findByIdAndUpdate(userOrderId, {
            paymentStatus: payment.paymentStatus,
            paymentDetails: payment._id,
        }, { new: true })

        return res
            .status(200)
            .json(new ApiResponse(200, {
                productOrder: order,
                paymentDetails: payment,
            }, "Payment Sucessfull !"))

    } else {
        console.log("Signature mismatch payment failed")
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "Payment verification Failed"))
    }
})

export {
    verifyPayment
}