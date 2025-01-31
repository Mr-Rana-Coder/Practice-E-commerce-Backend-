import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    createOrderForSingleProduct,
    createOrderForCart
} from "../controllers/order.controller.js";

const router = express.Router();
router.use(jwtVerify);

router.route("/create-single-order/:productId/:addressId").post(createOrderForSingleProduct);
router.route("/create-single-order/:cartId/:addressId").post(createOrderForCart);

export {
    router
}