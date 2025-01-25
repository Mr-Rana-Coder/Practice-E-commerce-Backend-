import mongoose from "mongoose";
import Product from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const productListing = asyncHandler(async (req, res) => {

    const { categoryId } = req.parmas;
    const { name, description, price, stock, brand } = req.body;

    if ([name, description, price, brand].some((field) => field?.trim === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const productImagesPath = req.files.map(file => file.path);

    if (!productImagesPath || productImagesPath.length === 0) {
        throw new ApiError(400, "At least one image is required")
    }
    const uploadedImagesUrl = []
    const imagesPublicIdFromCloudinary = []

    for (const file of productImagesPath) {
        const uploadProductImagesOnCloudinary = await uploadOnCloudinary(file);
        uploadedImagesUrl.push(uploadProductImagesOnCloudinary.url);
        imagesPublicIdFromCloudinary.push(uploadProductImagesOnCloudinary.public_id);
    }

    const adminId = req.user?._id;

    if (!adminId) {
        throw new ApiError(401, "Admin is not authenticated")
    }

    const listProduct = await Product.create({
        seller: adminId,
        name: name,
        description: description,
        price: price,
        stock: stock,
        brand: brand,
        images: uploadedImagesUrl,
        imagesPublicId: imagesPublicIdFromCloudinary,
        category: categoryId
    })

    if (!listProduct) {
        throw new ApiError(400, "Unable to list the product")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, listProduct, "Product listed successfully"))
})

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.parmas;
    if (!productId) {
        throw new ApiError(400, "Product id is required")
    }
    const getProduct = await Product.findById(productId);
    if (!getProduct) {
        throw new ApiError(404, "Product doesn't exist")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, getProduct, "Product Fetched successfully"))
})

const updateListedProduct = asyncHandler(async (req, res) => {
    const { productId } = req.parmas;
    if (!productId) {
        throw new ApiError(400, "Product id is required")
    }
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "product id is invalid")
    }

    const { name, description, price, stock, brand } = req.body;

    const allowedFields = [name, description, price, stock, brand];
    const updateChanges = {};
    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateChanges[field] = req.body[field];
        }
    });
    if (Object.keys(updateChanges).length === 0) {
        throw new ApiError(400, "At least 1 field is required")
    }

    const updateProduct = await Product.findByIdAndUpdate(productId, updateChanges, { new: true });
    if (!updateProduct) {
        throw new ApiError(400, "Unable to update the product")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateProduct, "Product update successfully"))
})

const changeProductCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.parmas;
    const { productId } = req.parmas;
    if (!categoryId || !productId) {
        throw new ApiError(400, "Category id and product id both are required");
    }
    if (!mongoose.isValidObjectId(categoryId) || !mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Either category id or product id is invalid")
    }
    const updateCategory = await Product.findByIdAndUpdate(productId, { category: categoryId }, { new: true });
    if (!updateCategory) {
        throw new ApiError(400, "Unable to update the category")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updateCategory, "Product category Updated Successfully"))
})

const updateProductImages = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!productId) {
        throw new ApiError(400, "Product Id is required")
    }
    if (!mongoose.isValidObjectId(productId)) {
        throw new ApiError(400, "Product id is invalid")
    }
    const product = await Product.findById(productId);
    const images = req.files.map(file => file.path);

    if (((product.images).length + images.length) > 11) {
        throw new ApiError(400, "Only 10 images are allowed for a single prodcut")
    }
    const uploadedImagesUrl = [];
    const uploadedImagesPublicId = [];
    for (const filePath of images) {
        const uploadFileImagesOnCloudinary = await uploadOnCloudinary(filePath);
        uploadedImagesUrl.push(uploadFileImagesOnCloudinary.url);
        uploadedImagesPublicId.push(uploadFileImagesOnCloudinary.public_id)
    }

    const updatedImages = await Product.findByIdAndUpdate(productId, {
        $push: {
            images: { $each: uploadedImagesUrl },
            imagesPublicId: { $each: uploadedImagesPublicId }
        }
    }, {
        new: true
    })
    if (!updatedImages) {
        throw new ApiError(400, "Unable to update images")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedImages, "Images updated successfully"))
})

const deleteProduct = asyncHandler(async (req, res) => {
    const {productId} = req.parmas;
    if(!productId){
        throw new ApiError(400,"product id is required")
    }
    if(!mongoose.isValidObjectId(productId)){
        throw new ApiError(400,"product id is invalid")
    }
    const deletedProduct = await findByIdAndDelete(productId);

    if(!deletedProduct){
        throw new ApiError(400,"product is not deleted successfully or product not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,{},"Product deleted Successfully"))
})

const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, name, category, brand, minPrice, maxPrice, sortBy } = req.query;

    if (page < 1 && limit < 1) {
        throw new ApiError(400, "Page and limit cannot be negative")
    }

    const skip = (page - 1) * limit;

    const filter = {};

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (category) filter.category = mongoose.Types.ObjectId(category);
    if (brand) filter.brand = brand;
    if (minPrice) filter.price = { $gte: minPrice };
    if (maxPrice) {
        if (!filter.price) filter.price = {};
        filter.price = { ...filter.price, $lte: maxPrice };
    }
    const sort = {};
    if (sortBy) {
        const [field, order] = sortBy.split(':');
        if (['name', 'price'].includes(field) && ['asc', 'desc'].includes(order)) {
            sort[field] = order === 'desc' ? -1 : 1;
        } else if (field === "rating") {
            sort = { 'averageRating': order === desc ? -1 : 1 };
        }
        else {
            throw new ApiError(400, "Invalid Sorting filter")
        }
    }
    else {
        sort.name = 1;
    }
    const products = await Product.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'productId',
                as: 'reviews'
            }
        },
        {
            $addFields: {
                averageRating: {
                    $ifNull: [{ $avg: '$reviews.rating' }, 0] 
                }
            }
        },
        {
            $sort: sort
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        }
    ])

    if (products.length === 0) {
        throw new ApiError(404, "No products were found with the given filter")
    }

    const totalProducts = await Product.countDocuments(filter);

    return res
        .status(200)
        .json(new ApiResponse(200, {
            products,
            paginetion: {
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
                limit
            }
        }))
})

export { productListing,getProductById,getProducts,deleteProduct,changeProductCategory,updateListedProduct,updateProductImages }