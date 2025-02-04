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
    quantity: {
        type: Number,
        default: 1
    },
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
        type: String,
        required: true
    },
    paymentDeatils: {
        type: Schema.Types.ObjectId,
        ref: "Payment",
    },
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
        required: true
    }
}, { timestamps: true })

const Order = mongoose.model("Order", orderSchema);

export { Order }