import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Cart } from "../models/cart.model.js";
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";

const createCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const { productId } = req.params;
    if (productId) {
        if (!mongoose.isValidObjectId(productId)) {
            throw new ApiError(400, "Product id is invalid")
        }

        const product = await Product.findById(productId);
        if (!product) {
            throw new ApiError(404, "Product not found with the give Product id")
        }
        const cart = await Cart.findOne({
            owner: userId
        })

        if (cart) {
            cart.products.push(productId);
            cart.totalPrice += product.price
        }
        else {
            cart = await Cart.create({
                owner: userId,
                products: [productId],
                totalPrice: product.price
            });
        }

        await cart.save();
        return res
            .status(201)
            .json(new ApiResponse(201, cart, "Product added to the cart"))
    }
    //If product is not added and the endpoint hit for the create cart
    const emptyCart = await Cart.create({
        owner: userId
    })

    return res
        .status(201)
        .json(new ApiResponse(201, emptyCart, "Cart created successfully"));
})

const addProductToCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { productId } = req.params;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    if (!productId) {
        throw new ApiError(400, "Prodcut id is required")
    }
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Product id is invalid")
    }

    const cart = await Cart.findOne({
        owner: userId
    })

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product is not found")
    }

    if (cart) {
        cart.products.push(productId);
        cart.totalPrice += product.price;
    }
    else {
        throw new ApiError(404, "Cart not found, create it first")
    }

    await cart.save();
    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Product added to the cart"))

})

const removeProductFromCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { productId } = req.params;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    if (!productId) {
        throw new ApiError(400, "Prodcut id is required")
    }
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Product id is invalid")
    }

    const cart = await Cart.findOne({
        owner: userId
    })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product is not found")
    }

    const productIndex = cart.products.findIndex(p => p.toString() === productId);
    if (productIndex === -1) {
        throw new ApiError(404, "Product not found in the cart")
    }

    cart.products.splice(productIndex, 1);
    cart.totalPrice -= product.price;

    await cart.save();
    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Product removed from the cart"))
})

const removeAllSameProductFromCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const { productId } = req.params;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    if (!productId) {
        throw new ApiError(400, "Prodcut id is required")
    }
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Product id is invalid")
    }
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    const cart = await Cart.findOneAndUpdate({
        owner: userId
    }, {
        $pull: {
            products: productId
        }
    }, {
        new: true
    })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, cart, "Product removed successfully"))
})

const deleteCart = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }

    const cart = await Cart.findOneAndDelete({
        owner: userId
    })

    if (!cart) {
        throw new ApiError(404, "Cart not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Cart deleted successfully"))
});

export {
    createCart,
    removeAllSameProductFromCart,
    addProductToCart,
    removeProductFromCart,
    deleteCart
}
