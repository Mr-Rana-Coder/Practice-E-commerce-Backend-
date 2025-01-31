import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    createWishlist, addProductToWishlist,
    getWishlistById, removeProductFromWishlist, deleteWishlist
} from "../controllers/wishlist.controller.js"

const router = express.Router();
router.use(jwtVerify);

router.route("/create-wishlist/:productId").post(createWishlist);
router.route("/:wishlistId/:productId").patch(removeProductFromWishlist).get(getWishlistById).delete(deleteWishlist)
router.route("/add-product-wishlist/:productId").post(addProductToWishlist)

export { router }