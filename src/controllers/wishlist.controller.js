import { Wishlist } from "../models/wishlist.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createWishlist = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User id is required")
    }
    const {productId} = req.params;
    if (productId) {
        if (!mongoose.isValidObjectId(productId)) {
            throw new ApiError(400, "Product id is invalid")
        }
        const wishlistWithProduct = await Wishlist.create({
            owner: userId,
            products: [productId]
        })
        if (!wishlistWithProduct) {
            throw new ApiError(400, "Unable to create a wishlist with the product")
        }
        return res
            .status(201)
            .json(new ApiResponse(201, wishlistWithProduct, "Wishlist created successfully with the prodcut"))
    }

    const wishlistWithoutProduct = await Wishlist.create({
        owner: userId
    })
    if (!wishlistWithoutProduct) {
        throw new ApiError(400, "Unable to create a wishlist without a product")
    }
    return res
        .status(201)
        .json(new ApiResponse(201, wishlistWithoutProduct, "Wishlist created successfully without a prodcut"))

})

const addProductToWishlist = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const {prodcutId} = req.params;
    if (!prodcutId) {
        throw new ApiError(400, "Prodcut id is required")
    }
    if (!mongoose.isValidObjectId(prodcutId)) {
        throw new ApiError(400, "Product id is invalid")
    }

    const addProduct = await Wishlist.findOneAndUpdate({
        owner: userId
    }, {
        $push: {
            products: prodcutId
        }
    }, {
        new: true
    })

    if(!addProduct){
        throw new ApiError(404,"Wishlist with the user id is not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,addProduct,"Product added successfully"))
})

const getWishlistById = asyncHandler(async(req,res)=>{
    const {wishlistId} = req.params;
    if(!wishlistId){
        throw new ApiError(400,"Wishlist id is required")
    }
    if(!mongoose.isValidObjectId(wishlistId)){
        throw new ApiError(400,"Wishlist id is invalid")
    }

    const wishlist = await Wishlist.findById(wishlistId);
    if(!wishlist){
        throw new ApiError(404,"Wishlist doesn't exist with the given Wishlist Id")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,wishlist,"Wishlist fetched successfully"))
})

const removeProductFromWishlist = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"User is not authenticated")
    }

    const {productId} = req.params;
    if(!productId){
        throw new ApiError(400,"Product id is required")
    }
    if(!mongoose.isValidObjectId(productId)){
        throw new ApiError(400,"Product is is invalid")
    }

    const updatedWishlist = await Wishlist.findOneAndUpdate({
        owner:userId
    },{
        $pull:{
            products:productId
        }
    },{
        new:true
    })

    if(!updatedWishlist){
        throw new ApiError(404,"Wishlist doesn't exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedWishlist,"Product removed successfully"))

})

const deleteWishlist = asyncHandler(async(req,res)=>{
    const {wishlistId} = req.params;
    if(wishlistId){
       if(!mongoose.isValidObjectId(wishlistId)){
        throw new ApiError(400,"Wishlist id is invalid")
       }
    
       const deleteWishlistByWishlistId = await Wishlist.findByIdAndDelete(wishlistId);

       if(!deleteWishlistByWishlistId){
        throw new ApiError(404,"Unable to delete the wishlist or the wishlist doesn't exist")
       }

       return res
       .status(200)
       .json(new ApiResponse(200,{},"Wishlist deleted successfully"));
    }

    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"User is not authenticated")
    }

    const deleteWishlistByUserId = await Wishlist.findOneAndDelete({
        owner:userId
    })

    if(!deleteWishlistByUserId){
        throw new ApiError(404,"Unable to delete the wishlist or wishlist may not exist ")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Wishlist deleted successfully"))
})

export {
createWishlist,addProductToWishlist,getWishlistById,removeProductFromWishlist,deleteWishlist
}