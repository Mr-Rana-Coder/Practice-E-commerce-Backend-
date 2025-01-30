import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {
            accessToken,
            refreshToken
        }

    } catch (error) {
        throw new ApiError(500, "Unable to generate refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, phoneNumber, role } = req.body;
    if ([fullName, email, , password, phoneNumber].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All field is required")
    }

    const checkUser = await User.findOne({ email: email });
    if (checkUser) {
        throw new ApiError(400, "User already exists!");
    }

    const avatarFilePath = req.file?.path;
    if (!avatarFilePath) {
        throw new ApiError("File path is required for avatar")
    }

    const avatar = await uploadOnCloudinary(avatarFilePath);
    if (!avatar) {
        throw new ApiError(400, "Unable to upload file on cloudinary.")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        phoneNumber,
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
        role
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken -avatarPublicId")

    if (!createdUser) {
        throw new ApiError(400, "Unable to create user")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdUser, "User registered Successfully!"))
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password required")
    }

    const user = User.findOne({ email: email });
    if (!user) {
        throw new ApiError(404, "User doesn't exist,Please register")
    }

    const isPassValid = user.isPasswordCorrect(password);
    if (!isPassValid) {
        throw new ApiError(401, "Password is wrong,Please enter correct password")
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -avatarPublicId");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user: accessToken, refreshToken, loggedInUser
        }
            , "user logged in successfully"))

})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "user is not authenticated")
    }
    await User.findByIdAndUpdate(userId, {
        $unset: {
            refreshToken: 1
        }
    }, { new: true });

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie(accessToken, options)
        .clearCookie(refreshToken, options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "User details fetched successfully"))
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is not recieved!")
    }
    const decode = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
    if (!decode) {
        throw new ApiError(400, "Invalid Refresh token")
    }
    const user = await User.findById(decode?._id);
    if (!user) {
        throw new ApiError(404, "User doesn't exist or invalid refresh token")
    }
    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or Invalid")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, {
            user, accessToken, refreshToken
        }, "Access token is refreshed "))
})

const updatePasword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!password || !oldPassword) {
        throw new ApiError(400, "Old and new password is required")
    }

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "User is not authenticated")
    }

    const user = await User.findById(userId);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Password is invalid")
    }

    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password updated successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, phoneNumber } = req.body;
    const changes = {};
    if (fullName) {
        changes.fullName = fullName;
    }
    if (phoneNumber) {
        changes.fullName = fullName;
    }
    if (!fullName && !phoneNumber) {
        throw new ApiError(400, "At least 1 field is required for the update")
    }
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError("User is not authenticated")
    }
    const updatedUser = await User.findByIdAndUpdate(userId, changes, { new: true });
    if (!updatedUser) {
        throw new ApiError(400, "unable to update the details");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Details updated successfully"))

})

const updateAccountAvatar = asyncHandler(async(req,res)=>{
    const avatarPath = req.file?.path
    if(!avatarPath){
        throw new ApiError(400,"Avatar path is required")
    }
    const avatar = await uploadOnCloudinary(avatarPath);

    if(!avatar){
        throw new ApiError(400,"Unable to upload the file on the sever")
    }
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"User is not authenticated")
    }

    const updatedUser = await User.findByIdAndUpdate(userId,{avatar:avatar.url,avatarPublicId:avatar.public_id},{new:true});
    if(!updatedUser){
        throw new ApiError(400,"Unable to update the avatar")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedUser,"Avatar updated successfully"))
})

//Need to complete later
const updateUserRole = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"user not authenticated")
    }
})

const userProfile = asyncHandler(async(req,res)=>{
    const userId = req.user?._id;
    if(!userId){
        throw new ApiError(401,"User is not authenticated")
    }
})

export { registerUser, loginUser, getCurrentUser, logoutUser, updatePasword, refreshAccessToken,updateAccountDetails,updateAccountAvatar }