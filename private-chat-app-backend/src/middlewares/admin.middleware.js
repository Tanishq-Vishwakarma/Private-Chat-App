import { ApiError } from "../utils/ApiError.js";

export const verifyAdmin = (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            throw new ApiError(403, "Access denied. Admin only.");
        }
        next();
    } catch (error) {
        throw new ApiError(403, error?.message || "Access denied");
    }
};

