import mongoose, { Schema } from "mongoose";

const cartSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: "Product"
        }
    ],
    totalPrice: {
        type: Number,
        validate: {
            validator: function (value) {
                return value >= 0;
            },
            message: "Total price cannot be negative"
        }
    }
}, { timestamps: true })

const Cart = mongoose.model("Cart", cartSchema);

export { Cart }