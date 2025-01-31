import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { checkRole } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    productListing, getProductById, getProducts,
    deleteProduct, changeProductCategory,
    updateListedProduct, updateProductImages
} from "../controllers/product.controller.js";

const router = express.Router();

router.use(jwtVerify);

router.route("/product-listing/:categoryId").post(checkRole, upload.array('productImages', 10), productListing);
router.route("/get-product/:productId").get(getProductById);
router.route("/update-product/:productId").patch(checkRole, updateListedProduct);
router.route("/update-product-images/:productId").patch(checkRole, updateProductImages);
router.route("get-all-products").get(getProducts)
router.route("/change-product-category/:productId/:categoryId").patch(checkRole, changeProductCategory);
router.route("/delete-product/:productId").delete(checkRole, deleteProduct);

export {
    router
}