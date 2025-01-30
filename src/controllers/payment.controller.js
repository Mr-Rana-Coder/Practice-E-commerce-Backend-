import { crypto } from "crypto";
import { ApiError } from "../utils/apiError";
import { fetchPaymentDetails } from "../config/razorpay.congfig.js";
import { Payment } from "../models/payment.model";
import { Order } from "../models/order.model";
import { ApiResponse } from "../utils/apiResponse";

const verifyPayment = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const { razorpayPaymentId, razorpayOrderId, signature, productOrderId } = req.body;
    if ([razorpayPaymentId, razorpayOrderId, signature, productOrderId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All Fields are required")
    }
    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    if (expectedSignature === signature) {
        const paymentDetailsFromRazorpay = await fetchPaymentDetails(razorpayPaymentId);
        if (!paymentDetailsFromRazorpay) {
            throw new ApiError(400, "Unable to fetch payment details")
        }
        console.log(paymentDetailsFromRazorpay)

        const payment = await Payment.create({
            owner: userId,
            productOrderId: productOrderId,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            paymentMethod: paymentDetailsFromRazorpay.method,
            paymentStatus: paymentDetailsFromRazorpay.status,
            transactionId: paymentDetailsFromRazorpay.id
        })
        //after this i will hit shipping api for the shipping

        //Updation in order
        const order = await Order.findByIdAndUpdate(productOrderId, {
            paymentStatus: paymentDetails.status,
            paymentDetails: payment._id
        }, { new: true })

        return res
            .status(200)
            .json(new ApiResponse(200, {
                productOrder: order,
                paymentDetails: payment
            }, "Payment Sucessfull and order payment status updated"))
    } else {
        console.log("Signature mismatch payment failed")
        return res
            .status(400)
            .json(new ApiResponse(400, {}, "Payment verification Failed"))
    }

})