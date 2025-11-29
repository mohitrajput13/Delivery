import jwt from "jsonwebtoken";
import config from "../config/config.js";
import logger from "../utils/logger.js";

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(200).json({
                status: "error",
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        jwt.verify(token, config.jwtSecret, (err, decoded) => {

            // Token expired
            if (err && err.name === "TokenExpiredError") {
                return res.status(200).json({
                    status: "error",
                    message: "Token expired"
                });
            }

            // Token invalid
            if (err) {
                return res.status(200).json({
                    status: "error",
                    message: "Invalid token"
                });
            }

            // Token correct → proceed
            req.userId = decoded.userId;
            next();
        });

    } catch (error) {
        logger.error("Token verification error:", error);
        return res.status(500).json({
            status: "error",
            message: "Something went wrong"
        });
    }
};
