import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { verifyPayment } from "../controllers/payment.controller.js";

const router = express.Router();
router.use(jwtVerify);

router.route("/verify-payment/:userOrderId").post(verifyPayment);

export {
    router
}