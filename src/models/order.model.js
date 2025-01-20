import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema({
    buyer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }],
    totalPrice: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value > 0;
            },
            message: "Total price must be a positive Number"
        }
    },
    paymentStatus: {
        type: Schema.Types.ObjectId,
        ref: "Payment",
        required: true,
    },
    deliveryStatus: {
        type: Schema.Types.ObjectId,
        ref: "Shipping",
        required: true
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true
    }
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema);

export { Order }