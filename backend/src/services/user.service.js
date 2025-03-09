import { prisma } from "../db/index.js"; // Import Prisma client
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/**
 * Hash the password before saving a new user.
 */
export const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Create a new user with a hashed password.
 */
export const createUser = async (email, password) => {
    const hashedPassword = await hashPassword(password);

    return await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
        }
    });
};

/**
 * Compare input password with stored hash.
 */
export const isPasswordCorrect = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate an Access Token.
 */
export const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

/**
 * Generate a Refresh Token.
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};