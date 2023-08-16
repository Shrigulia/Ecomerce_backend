import { userModel } from "../model/usserModel.js";
import { catchError } from "../utils/catchError.js";
import bcrypt from 'bcryptjs';
import sendEmail from "../utils/sendEmail.js";
import sendCookie from "../utils/sendCookie.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import cloudinary from 'cloudinary';

// signup
export const signUp = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        const { avatar } = req.files;

        const myCloud = await cloudinary.v2.uploader(avatar, {
            folder: "avatar",
            width: 150,
            crop: "scale",
        })

        let user = await userModel.findOne({ email });

        // if user exist
        if (user) return catchError(res, 406, false, "User already exist");

        // cretaing user

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10);

        // sending otp
        const otp = Math.floor(Math.random() * 100000)

        user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            },
            otp,
            otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRY * 60 * 1000)
        });

        const message = `Your OTP is :- \n\n ${otp} \n\n If you have not requested this email, Please ignore`;

        await sendEmail({
            email: user.email,
            subject: 'Ecomerce VERIFICATION OTP',
            message,
        });

        sendCookie(user, res, "OTP sent to your email, Please Verify", 201,)


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error
        });
    }
}

// verify by otp
export const verify = async (req, res) => {

    try {

        const otp = Number(req.body.otp);

        const user = await userModel.findById(req.user._id);

        if (user.otp !== otp || user.otp_expiry < Date.now()) return catchError(res, 400, false, "Invalid otp or it has been expired");

        user.verified = true;
        user.otp = null;
        user.otp_expiry = null;

        await user.save();

        sendCookie(user, res, "User Verified", 200);

    } catch (error) {


        user.otp = undefined;
        user.otp_expiry = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500).json({
            success: false,
            message: error
        });
    }

}

// resend otp after time excced
export const resendOTP = async (req, res) => {
    try {

        const user = await userModel.findById(req.user._id);

        if (user.otp_expiry > Date.now()) return catchError(res, 400, false, "Time not excceded yet, Please wait !!");

        // sending otp
        const otp = Math.floor(Math.random() * 100000);

        user.otp = otp;

        user.otp_expiry = new Date(Date.now() + process.env.OTP_EXPIRY * 60 * 1000);

        await user.save();

        const message = `Your OTP is :- \n\n ${otp} \n\n If you have not requested this email, Please ignore`;

        await sendEmail({
            email: user.email,
            subject: 'Ecomerce VERIFICATION OTP',
            message,
        });

        res.status(200).json({
            success: true,
            message: "OTP resend success"
        })

    } catch (error) {

        user.otp = undefined;
        user.otp_expiry = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(500).json({
            success: false,
            message: error
        });
    }
}

// login
export const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        let user = await userModel.findOne({ email });

        if (!email || !password) return catchError(res, 404, false, "Please Enter all fields");

        if (!user) return catchError(res, 406, false, "User doesn't exist");

        user = await userModel.findOne({ email }).select("+password");

        if (!user) return catchError(res, 404, false, "Invalid email or password")

        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) return catchError(res, 404, false, "Invalid email or password");

        sendCookie(user, res, `Welcome back ${user.name} `, 200)

    } catch (error) {

        res.status(201).json({
            success: false,
            message: error
        });
    }



}

// logout
export const logout = async (req, res) => {

    try {

        const { token } = req.cookies;

        if (!token) return catchError(res, 404, false, "Login first");

        res.status(200).cookie("token", null, {
            expires: new Date(Date.now()),
            secure: process.env.MODE === "Development" ? false : true,
            sameSite: process.env.MODE === "Development" ? "lax" : "none ", 
        }).json({
            success: true,
            message: "Logout success"
        })

    } catch (error) {
        res.status(201).json({
            success: false,
            message: error
        });
    }
}

//  delete user
export const deleteUser = async (req, res) => {

    try {

        const { token } = req.cookies;

        if (!token) return catchError(res, 404, false, "Login first")

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded._id);

        if (!user) return catchError(res, 404, false, "User Not found")

        await user.deleteOne();

        res.status(200).cookie("token", null, {
            expires: new Date(Date.now()),
            sameSite: "lax",
            secure: false,
        }).json({
            success: true,
            message: "User Deleted"
        })

    } catch (error) {

        res.status(201).json({
            success: false,
            message: error
        });
    }
}

// get my profile
export const getMyProfile = async (req, res) => {

    const user = await userModel.findById(req.user._id);

    res.status(200).json({
        success: true,
        user
    })
}

// FORGOT PASSOWRD LINK SEND BY MAIL
export const forgotPassword = async (req, res) => {

    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) return catchError(res, 404, false, "User not found");

    // generating token
    const resetToken = await crypto.randomBytes(20).toString("hex");

    // Hashing and adding resetpaswordtoken to userSchema
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordExpire = new Date(Date.now() + process.env.PASSWORD_TOKEN_EXPIRY * 60 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    const resetPasswordURl = `${req.protocol}://${req.get("host")}/api/v1/password/forgot/reset/${resetToken}`;

    const message = `Your password reset url is :- \n\n ${resetPasswordURl} \n\n If you have not requested this email, Please ignore`;

    try {

        await sendEmail({
            email: user.email,
            subject: 'Ecomerce forgot password link',
            message,
        });

        res.status(200).json({
            success: true,
            message: `Password reset link sent to ${user.email} successfuly`,
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        res.status(201).json({
            success: false,
            message: error
        });
    }
}

// RESETING PASSWORD AFTER GETTING RESET LINK
export const resetPassword = async (req, res) => {

    // creating take hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await userModel.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return catchError(res, 400, false, "Reset password token is invalid or has been expired");

    if (req.body.password != req.body.confirmPassword) return catchError(res, 400, false, "Password doesn't match")

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    user.password = hashedPassword;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;

    await user.save();

    sendCookie(user, res, `Password changed and welcome back ${user.name} `, 200)
}

// updating password
export const upadatePassword = async (req, res) => {

    const user = await userModel.findById(req.user._id).select("+password");

    const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password);

    if (!isPasswordMatched) return catchError(res, 400, false, "Old password is incorrect");

    if (req.body.newPassword != req.body.confirmPassword) return catchError(res, 400, false, "Password doesn't match");

    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Password Updated Successfuly"
    });

}

// update user profile
export const updateUserProfile = async (req, res) => {

    const { name, email } = req.body;

    const { avatar } = req.files;

    const myCloud = await cloudinary.v2.uploader(avatar, {
        folder: "avatar",
        width: 150,
        crop: "scale"
    })

    const newUserData = {
        name,
        email,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        },
    }

    const user = await userModel.findByIdAndUpdate(
        req.user._id,
        newUserData, {
        new: true,
        runValidators: true,
        userFindAndModify: false,
    });

    res.status(200).json({
        success: true,
        message: "Profile Udpated",
        user,
    })


}

// get all users -- ADMIN
export const getAllUsers = async (req, res) => {

    const users = await userModel.find();

    const totalUsers = await userModel.countDocuments();

    res.status(200).json({
        success: true,
        totalUsers,
        users,
    })
}

// get single user detail -- ADMIN
export const getSignleUserDetail = async (req, res) => {

    const { id } = req.params;

    const user = await userModel.findById(id);

    if (!user) return catchError(res, 404, false, "User not found");

    res.status(200).json({
        success: true,
        user
    });
}

// UPDATE ROLE OF THE USER (ONY ADMIN CAN CHANGE)
export const updateRoleByAdmin = async (req, res) => {

    const { role } = req.body;

    const { id } = req.params;

    const newUserData = { role };

    const user = await userModel.findByIdAndUpdate(id,
        newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });

    if (!user) return catchError(res, 404, false, "User not found");

    res.status(200).json({
        success: true,
        message: "Role Updated",
        user,
    })

}

// DELETE USER BY - ADMIN
export const deleteUserByAdmin = async (req, res) => {

    const { id } = req.params;

    const user = await userModel.findByIdAndUpdate(id);

    if (!user) return catchError(res, 404, false, "User not found");

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: "User deleted",
    });

}
