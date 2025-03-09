import { createLogger, transports, format } from "winston";
import morgan from "morgan";

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp }) => {
            return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
        })
    ),
    transports: [
        new transports.Console(), // Logs to console
        new transports.File({ filename: "logs/error.log", level: "error" }), // Logs errors to file
        new transports.File({ filename: "logs/combined.log" }) // Logs all levels to file
    ]
});

// Morgan middleware to log HTTP requests
const requestLogger = morgan("combined", {
    stream: {
        write: (message) => logger.info(message.trim())
    }
});

export { logger, requestLogger };