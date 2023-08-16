import express from 'express';
import { authorizedRole, isAuthenticated } from '../middleware/auth.js';
import { createProduct, createProductReview, deleteProduct, deleteReviewOfProduuct, getAllProducts, getAllReviewsOfProduct, getProductDetail, updateProduct } from '../controller/productController.js';

const router = express.Router();

// create Product -- ADMIN
router.post('/admin/new', isAuthenticated, authorizedRole("admin"), createProduct);

// update product -- ADMIN
router.put('/admin/product/:id', isAuthenticated, authorizedRole("admin"), updateProduct);

// get product detail
router.get('/product/:id', getProductDetail);

// Create / update review
router.put('/product/review', isAuthenticated, createProductReview);

// get all products
router.get('/products', getAllProducts);

// delete product ADMIN
router.delete('/admin/product/:id', isAuthenticated, authorizedRole("admin"), deleteProduct);

// get all reviews of product 
router.get('/reviews/:id', getAllReviewsOfProduct);

// delete review
router.delete('/review/delete', isAuthenticated, deleteReviewOfProduuct);



export default router;