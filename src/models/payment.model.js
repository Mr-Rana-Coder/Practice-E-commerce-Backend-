import mongoose, { Schema } from "mongoose";

const paymentSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    userOrderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        required: true
    },
    //Paymentmethod,payment Status and Transcation Id fields can be change as required
    paymentMethod: {
        type: String,
        required: true,
        enum: ["Credit Card", "Debit Card", "Net Banking", "UPI", "Cash on Delivery"]
    },
    paymentStatus: {
        type: String,
        required: true,
        enum: ["Created", "Authorized", "Captured", "Refunded", "Failed"]
    },
    transactionId: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Payment = mongoose.model("Payment", paymentSchema);

export { Payment }