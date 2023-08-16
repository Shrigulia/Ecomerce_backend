import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        maxLength: [25, "Limit is 25 charcters"],
        minLength: [4, "Atleast 4 charcter"]
    },
    email: {
        type: String,
        required: [true, "Please Enter your email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter your Password"],
        minLength: [8, "Atleast 8 charcter"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    verified: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    otp: Number,

    otp_expiry: Date,

    resetPasswordToken: String,

    resetPasswordExpire: Date,
});

export const userModel = mongoose.model("Users", userSchema)