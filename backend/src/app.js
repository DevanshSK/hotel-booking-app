import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';
import { errorHandler } from "./utils/ApiError.js";
import { logger, requestLogger } from "./utils/logger.js";

dotenv.config({
    path: "./.env"
})

const app = express();

// Use Morgan for HTTP request logging
app.use(requestLogger);

const frontendUrls = process.env.CORS_ORIGIN === "*"
    ? "*"
    : process.env.CORS_ORIGIN?.split(",");

console.log("FRONTEND URLS: ", frontendUrls)

// Middleware setup for CORS
app.use(cors({
    origin: frontendUrls,
    credentials: true,
}));

app.use(express.json());
// app.use((req, res, next) => {
//     console.log(req.path, req.method);
//     next();
// });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(cookieParser());

// Routes import 
import userRouter from "./routes/user.routes.js";

// Routes declaration
app.get("/", (req, res) => {
    logger.info("HealthCheck accessed");
    res.json({
        status: "ok",
        message: "Hello everyone"
    })
});

app.use("/api/users", userRouter);

// Custom error handling
app.use(errorHandler);

export { app };