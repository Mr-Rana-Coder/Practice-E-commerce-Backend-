import Product from "../models/product.model.js";
import { ApiError } from "../utils/apiError.js";
import {ApiResponse} from "../utils/apiResponse.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const productListing = asyncHandler(async(req,res)=>{

    const {categoryId} = req.parmas;
    const {name,description,price,stock,brand} = req.body;

    if([name,description,price,brand].some((field)=>field?.trim==="")){
        throw new ApiError(400,"All fields are required")
    }

    const productImagesPath = req.files?.path;

    if(!productImagesPath||productImagesPath.length === 0){
        throw new ApiError(400,"At least one image is required")
    }
    const uploadedImagesUrl = []
    const imagesPublicIdFromCloudinary = []

    for(const file of productImagesPath){
        const uploadProductImagesOnCloudinary = await uploadOnCloudinary(file);
        uploadedImagesUrl.push(uploadProductImagesOnCloudinary.url);
        imagesPublicIdFromCloudinary.push(uploadProductImagesOnCloudinary.public_id);
    }

    const adminId = req.user?._id;

    if(!adminId){
        throw new ApiError(401,"Admin is not authenticated")
    }

    const listProduct = await Product.create({
        seller:adminId,
        name:name,
        description:description,
        price:price,
        stock:stock,
        brand:brand,
        images:uploadedImagesUrl,
        imagesPublicId:imagesPublicIdFromCloudinary,
        category:categoryId
    })

    if(!listProduct){
        throw new ApiError(400,"Unable to list the product")
    }

    return res
    .status(201)
    .json(new ApiResponse(201,listProduct,"Product listed successfully"))
})

export {productListing}