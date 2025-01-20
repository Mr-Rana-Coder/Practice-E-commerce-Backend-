import mongoose, { Schema } from "mongoose";

const addressSchema = new mongoose.Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    houseNumber: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    area: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    landmark: {
        type: String,
        trim: true,
        maxlength: 100
    },
    city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    pincode: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value.toString().length == 6;
            },
            message: "Pincode must be of 6 digits"
        }
    },
    state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    }
}, { timestamps: true })

const Address = mongoose.model("Address", addressSchema);

export { Address }