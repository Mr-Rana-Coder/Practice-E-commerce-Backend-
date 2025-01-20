import mongoose, { Schema } from "mongoose";

const reviewSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true })

reviewSchema.index({ owner: 1, product: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export { Review }