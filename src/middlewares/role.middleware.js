import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const checkRole = asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "User is not authenticated")
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not exist")
    }
    const userRole = user.role?.toLowerCase();
    if (userRole === "admin" || userRole === "superadmin") {
        console.log("User is admin")
        next();
    }
    else {
        throw new ApiError(400, "User is not Unauthorized for this action");
    }
})

export {
    checkRole
}