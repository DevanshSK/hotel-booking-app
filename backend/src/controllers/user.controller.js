import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { prisma } from "../db/index.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from 'jsonwebtoken';
import validator from "validator";
import { generateAccessToken, generateRefreshToken, createUser, isPasswordCorrect } from "../services/user.service.js";

const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
}

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens.");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (
        [email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists.");
    }

    const user = await createUser(email, password);

    const createdUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, role: true },
    });

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!validator.isEmail(email)) {
        throw new ApiError(400, "Valid email is required");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await isPasswordCorrect(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.id);

    const loggedInUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, email: true, role: true },
    });

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await prisma.user.update({
        where: { id: req.user.id },
        data: { refreshToken: null },
    });
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(403, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

        const user = await prisma.user.findUnique({ where: { id: decodedToken.id } });
        if (!user || user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(403, "Invalid refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user.id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Access token refreshed"));
    } catch (err) {
        return res
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .status(403)
            .json({
                success: false,
                message: "Invalid refresh token",
                statusCode: 403,
            });
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
}