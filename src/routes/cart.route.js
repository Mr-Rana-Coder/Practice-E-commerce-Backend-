import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    createCart,
    removeAllSameProductFromCart,
    addProductToCart,
    removeProductFromCart,
    deleteCart, getCart
} from "../controllers/cart.controller.js"

const router = express.Router();
router.use(jwtVerify);

router.route("/create-cart/:productId").post(createCart);
router.route("/get-cart").get(getCart);
router.route("/remove-same-products/:productId").patch(removeAllSameProductFromCart);
router.route("/add-product/:productId").patch(addProductToCart);
router.route("/:productId").patch(removeProductFromCart).delete(deleteCart);

export {
    router
}