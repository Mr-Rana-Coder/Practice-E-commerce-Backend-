import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { createReview, updateReview, getReviewByReviewId, getReviewByUserId, deleteReview } from "../controllers/review.controller.js";

const router = express.Router();
router.use(jwtVerify);

router.route("/create-review/:productId").post(createReview);
router.route("/:productId/:reviewId").get(getReviewByReviewId).patch(updateReview).delete(deleteReview)
router.route("/user-review").get(getReviewByUserId);

export {
    router
} 