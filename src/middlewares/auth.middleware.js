import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const jwtVerify = asyncHandler(async(req,res,next)=>{
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
        if(!token){
            console.log("Unauthorized Request")
            throw new ApiError(400,"You are not authorized for this request.")
        }
        const decode = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY);

        if(!decode){
            console.log("unable to decode the user information from the secret key!")
            throw new ApiError(400,"User verification isn't complete!")
        }
        const user = await User.findById(decode?._id).select("-password -phoneNumber -avatarPublicId")

        if(!user){
            throw new ApiError(404,"User doesn't exist")   
        }
        req.User = user;
        next();

    }catch(err){
        console.log("Unable to verify the user ",err)
        throw new ApiError(401,err?.message||"Invalid message")
    }
})

export {jwtVerify};
