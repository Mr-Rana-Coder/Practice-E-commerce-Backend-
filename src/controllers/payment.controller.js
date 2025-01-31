import crypto from "crypto";
import { ApiError } from "../utils/apiError.js";
import { fetchPaymentDetails } from "../config/razorpay.config.js";
import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { createShipment, schedulePickup, shipmentTracking } from "./shipment.controller.js";
import { Shipping } from "../models/shipping.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyPayment = asyncHandler(async (req, res) => {
    const { addressId, userOrderId } = req.params || req.body;
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
        const paymentDetailsFromRazorpay = await fetchPaymentDetails(razorpayPaymentId);
        if (!paymentDetailsFromRazorpay) {
            throw new ApiError(400, "Unable to fetch payment details")
        }
        console.log(paymentDetailsFromRazorpay)

        const payment = await Payment.create({
            owner: userId,
            userOrderId: userOrderId,
            razorpayOrderId: razorpayOrderId,
            razorpayPaymentId: razorpayPaymentId,
            paymentMethod: paymentDetailsFromRazorpay.method,
            paymentStatus: paymentDetailsFromRazorpay.status,
            transactionId: paymentDetailsFromRazorpay.id
        })
        if (!addressId) {
            throw new ApiError(400, "Address id is required")
        }
        if (!mongoose.isValidObjectId(addressId)) {
            throw new ApiError(400, "Address id is invalid")
        }
        const shipmentData = await createShipment(addressId);
        if (!shipmentData || !shipmentData.data?.tracking_id) {
            throw new ApiError(400, "Unable to create shipment with FedEx");
        }
        //tracking number = const trackingNumber = data.output.transactionShipments[0].pieceResponses[0].trackingNumber; check with this
        const trackingNumber = shipmentData.data.output.transactionShipments[0].shipmentDocuments[0].trackingNumber;
        const pickupDeatils = await schedulePickup(trackingNumber)
        const trackingInfo = await shipmentTracking(trackingNumber)
        if (!trackingInfo) {
            throw new ApiError(400, "Unable to fetch tracking info");
        }

        const shipment = await Shipping.create({
            orderId: userOrderId,
            trackingNumber: trackingNumber,
            carrier: "Fedex",
            status: trackingInfo.status
        })

        if (!shipment) {
            throw new ApiError(400, "Unable to store shipment data")
        }

        //Updation in order
        const order = await Order.findByIdAndUpdate(userOrderId, {
            paymentStatus: paymentDetails.status,
            paymentDetails: payment._id,
            deliveryStatus: trackingInfo.status,
            deliveryDetails: shipment._id
        }, { new: true })

        return res
            .status(200)
            .json(new ApiResponse(200, {
                productOrder: order,
                paymentDetails: payment,
                shipment: shipment,
                shipmentDataFromFedex: shipmentData,
                pickupData: pickupDeatils,
                tracking: trackingInfo,
            }, "Payment Sucessfull and order Placed !"))
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