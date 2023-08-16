import jwt from 'jsonwebtoken';
import { catchError } from '../utils/catchError.js';
import { userModel } from '../model/usserModel.js';

export const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) return catchError(res, 401, false, "Please Login First")

    try {

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await userModel.findById(decodedData._id);

        next();

    } catch (error) {

        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const authorizedRole = (...roles) => {
    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `${req.user.role} is not allowed to access this resource`
            });
        };
        next();
    }
}