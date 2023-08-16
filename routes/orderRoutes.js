import express from 'express';
import { authorizedRole, isAuthenticated } from '../middleware/auth.js'
import { allOrders, deleteOdrer, getSingleOrderDetail, myOrders, newOrder, updateOrderStatus } from '../controller/orderController.js';

const router = express.Router();

router.post('/order/new', isAuthenticated, newOrder);

router.get('/orders/my', isAuthenticated, myOrders);

// get all orders -- ADMIN
router.get('/admin/orders/all', isAuthenticated, authorizedRole("admin"), allOrders);

// delete order
router.delete('/admin/order/delete/:id', isAuthenticated, authorizedRole("admin"), deleteOdrer);

// update order status
router.put('/admin/order/updatestatus/:id', isAuthenticated, authorizedRole("admin"), updateOrderStatus);

//get single order detail
router.get('/order/:id', isAuthenticated, getSingleOrderDetail);


export default router;