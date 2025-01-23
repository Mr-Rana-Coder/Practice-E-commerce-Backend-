import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema(
    {
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },
        price: {
            type: Number,
            required: true
        },
        stock: {
            type: Number,
            default: 0
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
        brand: {
            type: String,
            trim: true
        },
        images: {
            type: [String],
            required: true,
            validate: {
                validator: function (array) {
                    return array.length > 0;
                },
                message: "At least one image is required"
            }
        },
        imagesPublicId: {
            type: [String]
        },
        review: [{
            type: Schema.Types.ObjectId,
            ref: "Review"
        }]
    },
    { timestamps: true })

const Product = mongoose.model("Product", productSchema);

export { Product }