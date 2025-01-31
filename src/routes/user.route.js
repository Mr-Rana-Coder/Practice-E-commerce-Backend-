import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    registerUser, loginUser, getCurrentUser,
    logoutUser, updatePasword, refreshAccessToken
    , updateAccountDetails, updateAccountAvatar
} from "../controllers/user.controller.js"

const router = express.Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").get(jwtVerify, getCurrentUser);

router.route("/logout").post(jwtVerify, logoutUser);

router.route("update-password").patch(jwtVerify, updatePasword);

router.route("/update-account-details").patch(jwtVerify, updateAccountDetails);

router.route("/update-account-avatar").patch(jwtVerify, updateAccountAvatar);

export {
    router
}

