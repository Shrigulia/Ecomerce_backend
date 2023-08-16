import { productModel } from '../model/productModel.js'
import { userModel } from '../model/usserModel.js';
import ApiFeatures from '../utils/apiFeatures.js';
import { catchError } from '../utils/catchError.js';
import cloudinary from 'cloudinary';

//  ONLY ADMIN
export const createProduct = async (req, res) => {
    try {

        const { name, description, price, category } = req.body;

        const { images } = req.files;

        const myCloud = await cloudinary.v2.uploader(images, {

            folder: "Product_images",
            width: 150,
            crop: "scale",
        })

        const product = await productModel.create({
            name,
            description,
            price,
            category,
            images: [
                {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url
                },
            ],
        });

        res.status(201).json({
            success: true,
            product
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        });
    }
};

// ONLY ADMIN
export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        let product = await productModel.findById(id);

        if (!product) return catchError(res, 404, false, "Product not found");

        // updating product
        product = await productModel.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            message: "Updated Product Succesfuly",
            product
        })

    } catch (error) {

        res.status(201).json({
            success: false,
            message: error
        });

    }
}

export const getProductDetail = async (req, res) => {
    try {

        const { id } = req.params;

        let product = await productModel.findById(id);

        if (!product) return catchError(res, 404, false, "Product not found");

        res.status(200).json({
            success: true,
            product,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });

    }
}

//  CREATE REVIEW BY USER AND UPDATE IF ALREADY CREATED
export const createProductReview = async (req, res) => {
    try {

        const { rating, comment, productId } = req.body;

        const user = await userModel.findById(req.user._id);

        const review = {
            user: user._id,
            name: user.name,
            rating: Number(rating),
            comment
        };

        const product = await productModel.findById(productId);

        const isReviewed = product.reviews.find((rev) => rev.user.toString() === req.user._id.toString());

        if (isReviewed) {

            product.reviews.forEach((rev) => {

                if (rev.user.toString() === req.user._id.toString()) {
                    rev.rating = rating;
                    rev.comment = comment;
                }

            })
        }

        else {
            product.reviews.push(review);
            product.numOFReview = product.reviews.length;
        };

        let avg = 0;

        product.reviews.forEach((rev) => {
            avg += rev.rating;
        });

        product.rating = avg / product.reviews.length;

        await product.save();

        res.status(200).json({
            success: true,
            message: `${isReviewed ? "Review Updated" : "Review Created"}`
        })

    } catch (error) {

        res.status(201).json({
            success: false,
            message: error
        });

    }
}

// delete product - ONLY ADMIN
export const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        let product = await productModel.findById(id);

        if (!product) return catchError(res, 404, false, "Product not found");

        await product.deleteOne();

        res.status(200).json({
            success: true,
            messge: "Product Deleted",
        })

    } catch (error) {

        res.status(201).json({
            success: false,
            message: error
        });
    }
}

// GET ALL REVIEW OF PRODUCTS
export const getAllReviewsOfProduct = async (req, res) => {
    try {

        const { id } = req.params;

        let product = await productModel.findById(id);

        if (!product) return catchError(res, 404, false, "Product not found");

        res.status(200).json({
            success: true,
            review: product.reviews
        })

    } catch (error) {

        res.status(201).json({
            success: false,
            message: error
        });
    }
}

// DELETE REVIEW
export const deleteReviewOfProduuct = async (req, res) => {

    try {

        const product = await productModel.findById(req.query.productId);

        if (!product) return catchError(res, 404, false, "Product not found");

        const review = req.query.id;

        if (!review) return catchError(res, 404, false, "Review not found");

        const reviews = product.reviews.filter((rev) => rev._id.toString() !== review.toString());

        let avg = 0;

        reviews.forEach((rev) => {
            avg += rev.rating;
        });

        const ratings = avg / reviews.length;

        const numOFReview = reviews.length;

        await productModel.findByIdAndUpdate(req.query.productId,
            {
                reviews,
                ratings,
                numOFReview
            },
            {
                new: true,
                runValidators: true,
                useFindAndModify: false
            }
        );

        res.status(200).json({
            success: true,
            message: "Review Deleted",
            reviews: product.reviews
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error
        });
    }
}

// get all products
export const getAllProducts = async (req, res) => {
    try {

        const resultPerPage = 5;

        const apiFeature = new ApiFeatures(productModel.find(), req.query).search().filter().pagination(resultPerPage);

        const products = await apiFeature.query;

        const totalProducts = await productModel.countDocuments();

        res.status(200).json({
            success: true,
            page: req.query.page,
            totalProducts,
            resultPerPage,
            products,
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error
        });
    }
}