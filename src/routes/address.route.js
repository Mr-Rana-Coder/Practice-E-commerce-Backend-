import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    addAddress, updateAddress, getAddressById, getAllAddressOfUser, deleteAddress
} from "../controllers/address.controller.js";

const router = express.Router();
router.use(jwtVerify);

router.route("/add-address").post(addAddress);
router.route("/all-user-address").get(getAllAddressOfUser)
router.route("/:addressId").get(getAddressById).patch(updateAddress).delete(deleteAddress);

export {
    router
}