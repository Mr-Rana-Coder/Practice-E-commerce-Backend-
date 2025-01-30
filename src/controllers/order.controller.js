import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { createRazorPayOrder } from "../config/razorpay.congfig.js";
import { Cart } from "../models/cart.model.js";

const createOrderForSingleProduct = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { productId, addressId } = req.params;
    const { quantity } = req.body;

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!productId || !addressId) {
        throw new ApiError(400, "Product id and address id both are required")
    }
    if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Product id or address id is invalid")
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product with the given id not found")
    }

    if (!quantity <= 0) {
        throw new ApiError(400, "Quantity cannot be negative")
    }

    const totalPrice = product.price * quantity;

    if (!totalPrice <= 0) {
        throw new ApiError(400, "Total price cannot be negative")
    }

    const order = await Order.create({
        buyer: userId,
        products: [productId],
        quantity: quantity,
        totalPrice: totalPrice,
        address: addressId,
        paymentStatus: "Pending",
        deliveryStatus: "Pending"
    })

    if (!order) {
        throw new ApiError(400, "Unable to create your order")
    }

    const createOrderForPayment = await createRazorPayOrder(totalPrice);
    if (!createOrderForPayment) {
        throw new ApiError(400, "Unable to get payment details")
    }
    console.log(createOrderForPayment);

    return res
        .status(201)
        .json(new ApiResponse(201, { order, payment: createOrderForPayment }, "Order created successfully."))

})

const createOrderForCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { cartId, addressId } = req.params;
    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }
    if (!cartId || !addressId) {
        throw new ApiError(400, "Cart id and address id both are required")
    }

    if (!mongoose.isValidObjectId(cartId) || !mongoose.isValidObjectId(addressId)) {
        throw new ApiError(400, "Cart id or Address id is invalid")
    }

    const cart = await Cart.findById(cartId);
    if (!cart) {
        throw new ApiError(404, "Cart doesn't exists")
    }

    const totalPrice = cart.totalPrice;
    const totalProducts = cart.products;
    const quantity = cart.products.length;

    if (totalPrice <= 0) {
        throw new ApiError(400, "Total Price cannot be negative")
    }

    const order = await Order.create({
        buyer: userId,
        products: totalProducts,
        quantity: quantity,
        totalPrice: totalPrice,
        address: addressId,
        paymentStatus: "Pending",
        deliveryStatus: "Pending"
    })
    if (!order) {
        throw new ApiError(400, "Unable to create your order")
    }

    const createOrderForPayment = await createRazorPayOrder(totalPrice);
    if (!createOrderForPayment) {
        throw new ApiError(400, "Unable to get payment details")
    }
    console.log(createOrderForPayment);

    return res
        .status(201)
        .json(new ApiResponse(201, { order, payment: createOrderForPayment }, "Order created successfully."))

})

export {
    createOrderForSingleProduct,
    createOrderForCart
}