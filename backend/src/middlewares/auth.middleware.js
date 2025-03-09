import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { prisma } from "../db/index.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decodedToken?.id },  // Prisma uses `id`
            select: {
                id: true,
                email: true,
                role: true,
            },
        });

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new ApiError(401, "Access token has expired");
        }
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export const verifyPermission = (roles = []) =>
    asyncHandler(async (req, res, next) => {
        if (!req.user?.id) {
            throw new ApiError(401, "Unauthorized request");
        }
        if (roles.includes(req.user?.role)) {
            next();
        } else {
            throw new ApiError(403, "You are not allowed to perform this action");
        }
    });