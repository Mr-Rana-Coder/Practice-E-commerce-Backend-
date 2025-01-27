import { Review } from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";

const createReview = asyncHandler(async(req,res)=>{
    const {rating,comment} = req.body;
    if(!rating&&!comment){
        throw new ApiError(400,"Comment and rating both are required")
    }
    const {productId} = req.params;
    if(!productId){
        throw new ApiError(400,"Product id is required")
    }
    if(!mongoose.isValidObjectId(productId)){
        throw new ApiError(400,"Product id is invalid")
    }
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"User is not authenticated")
    }

    const review = await Review.create({
        onwer:userId,
        product:productId,
        rating:rating,
        comment:comment
    })

    if(!review){
        throw new ApiError(400,"review not created succesfully")
    }

    return res
    .status(201)
    .json(new ApiResponse)(201,review,"Review created successfully")
})

const updateReview =  asyncHandler(async(req,res)=>{
    const {rating,comment} = req.body;
    const changes = {};
    if(rating){
        changes.rating = rating;
    }
    if(comment){
        changes.comment = comment;
    }
    if(!rating&&!comment){
        throw new ApiError(400,"Comment or rating any one of the field is required to be updated.")
    }
    const {reviewId} = req.params;
    if(!reviewId){
        throw new ApiError(400,"Review id is required")
    }
    if(!mongoose.isValidObjectId(reviewId)){
        throw new ApiError(400,"Review id is invalid")
    }
    const review = await Review.findByIdAndUpdate(reviewId,changes,{new:true});

    if(!review){
        throw new ApiError(404,"Review for the given id doesn't exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,review,"Review updated successfully"))
})

const getReviewByReviewId = asyncHandler(async(req,res)=>{
    const {reviewId} = req.params;
    if(!reviewId){
        throw new ApiError(400,"Review id is required")
    }
    if(!mongoose.isValidObjectId(reviewId)){
        throw new ApiError(400,"Review id is invalid")
    }

    const review = await Review.findById(reviewId);

    if(!review){
        throw new ApiError(404,"Review for the given id doesn't exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,review,"Review fetched successfully"))
})

const getReviewByUserId = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"User is not authenticated")
    }
    const review = await Review.find({
        owner:userId
    })

    if(!review){
        throw new ApiError(404,"Review for the given id doesn't exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,review,"Review fetched successfully"))
})

const deleteReview = asyncHandler(async(req,res)=>{
    const {reviewId} = req.params;
    if(!reviewId){
        throw new ApiError(400,"Review id is required")
    }
    if(!mongoose.isValidObjectId(reviewId)){
        throw new ApiError(400,"Review id is invalid")
    }

    const review = await Review.findByIdAndDelete(reviewId);

    if(!review){
        throw new ApiError(404,"Review for the given id doesn't exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Review deleted successfully"))
})

export{
    createReview,updateReview,getReviewByReviewId,getReviewByUserId,deleteReview
}