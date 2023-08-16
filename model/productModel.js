import mongoose, { Types } from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter product name"],
        trim: true, // remove white spaces from start and end before saving it to database
    },
    description: {
        type: String,
        required: [true, "Please Enter description"],
    },
    price: {
        type: Number,
        required: [true, "Please Enter product price"],
        maxLength: [8, "price can't exceed  8 character"],
    },
    rating: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    category: {
        type: String,
        required: [true, "Please Enter category"]
    },
    stock: {
        type: Number,
        required: [true, "Please Enter product stock"],
        maxLength: [4, "lower than 4 character"],
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    numOFReview: { //total number of reviews
        type: Number,
        default: 0
    },
    reviews: [
        {
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            },
            user: {
                type: Types.ObjectId,
                required: true
            }
        }
    ]
});

export const productModel = mongoose.model("products", productSchema);