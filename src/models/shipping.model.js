import mongoose, { Schema } from "mongoose";

const shippingSchema = new mongoose.Schema({
    orderId: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true
    },
    trackingNumber: {
        type: String,
        required: true
    },
    carrier: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const Shipping = mongoose.model("Shipping", shippingSchema);

export { Shipping }