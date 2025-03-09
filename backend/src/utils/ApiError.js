class ApiError extends Error {
    constructor(
        statusCode,
        message= "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    // If the error is an instance of ApiError, use its status and message
    if (err instanceof ApiError) {

        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            statusCode: err.statusCode,
            errors: err.errors || [], // You can add more details if needed
        });
    }

    // Handle other unexpected errors
    return res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error",
        statusCode: 500,
    });
};

export {ApiError, errorHandler}