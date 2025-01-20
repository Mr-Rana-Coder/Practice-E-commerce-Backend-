import mongoose, { Schema } from "mongoose";

const wishlistSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: "Product"
    }]
}, { timestamps: true })

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export { Wishlist }