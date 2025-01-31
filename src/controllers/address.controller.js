import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Address } from "../models/address.model.js";

const addAddress = asyncHandler(async (req, res) => {
    const { houseNumber, area, landmark, city, pincode, state, mobileNumber } = req.body;

    if ([houseNumber, area, landmark, city, pincode, state, mobileNumber].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field are required")
    };

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const address = await Address.create({
        owner: userId,
        houseNumber: houseNumber,
        mobileNumber: mobileNumber,
        area: area,
        landmark: landmark,
        city: city,
        pincode: pincode,
        state: state
    })

    if (!address) {
        throw new ApiError(400, "Unable to add address")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, address, "Address added successfully"));
})

const updateAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    if (!addressId) {
        throw new ApiError(400, "Address id is required")
    }
    if (!mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Address id is invalid")
    }

    const { houseNumber, area, landmark, city, pincode, state } = req.body;
    const allowedFields = { houseNumber, area, landmark, city, pincode, state, mobileNumber };
    const changes = {};
    Object.keys(allowedFields).forEach(key => {
        if (allowedFields[key] !== undefined) {
            changes[key] = allowedFields[key];
        }
    })
    if (Object.keys(changes).length === 0) {
        throw new ApiError(400, "At least 1 field is required to be updated")
    }

    const address = await Address.findByIdAndUpdate(addressId, changes, { new: true });
    if (!address) {
        throw new ApiError(404, "Address not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, address, "Address updated successfully"))
})

const getAddressById = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    if (!addressId) {
        throw new ApiError(400, "Address id is required")
    }
    if (!mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Address id is invalid")
    }

    const address = await Address.findById(addressId);
    if (!address) {
        throw new ApiError(404, "Address not found by the given id")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, address, "Address fetched successfully"))
})

const getAllAddressOfUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    const getAllAddresses = await Address.find({ owner: userId });

    if (!getAllAddresses) {
        throw new ApiError(404, "No address found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, getAllAddresses, "Addressess fetched successfully"))
})

const deleteAddress = asyncHandler(async (req, res) => {
    const { addressId } = req.params;
    if (!addressId) {
        throw new ApiError(400, "Address id is required")
    }
    if (!mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Address id is invalid")
    }
    const address = await Address.findByIdAndDelete(addressId);
    if (!address) {
        throw new ApiError(404, "Address may not exist")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Address deleted successfully"))

})

export {
    addAddress, updateAddress, getAddressById, getAllAddressOfUser, deleteAddress
}