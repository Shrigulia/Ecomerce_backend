import { orderModel } from "../model/orderModel.js";
import { catchError } from "../utils/catchError.js";
import { updateStock } from "../utils/updateStock.js";

// placing new order
export const newOrder = async (req, res) => {

    try {

        const {
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        const order = await orderModel.create({
            shippingInfo,
            orderItems,
            paymentInfo,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paidAt: Date.now(),
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: "Order Placed",
            order
        })


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error
        });

    }
}

// my orders
export const myOrders = async (req, res) => {

    try {

        const orders = await orderModel.find({ user: req.user._id });

        res.status(200).json({
            success: true,
            totalOrders: orders.length,
            orders,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error
        });
    }
}

// get single order detail
export const getSingleOrderDetail = async (req, res) => {

    try {

        const { id } = req.params;

        const order = await orderModel.findById(id).populate("user", "name email")

        if (!order) return catchError(res, 404, false, "Odrer not found");

        res.status(200).json({
            success: true,
            order,
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error
        });
    }

}

// get all order -- admin
export const allOrders = async (req, res) => {

    try {

        const orders = await orderModel.find();

        const totalOrders = await orderModel.countDocuments();

        let totalAmount = 0;

        orders.forEach((order) => (
            totalAmount += order.totalPrice
        ))

        res.status(200).json({
            success: true,
            totalOrders,
            totalAmount,
            orders,
        });

    } catch (error) {

    }
}

// delete odrer - ADMIN
export const deleteOdrer = async (req, res) => {

    try {

        const order = await orderModel.findById(req.params.id);

        if (!order) return catchError(res, 404, false, "Order not found");

        order.deleteOne();

        res.status(200).json({
            success: true,
            message: "Delted",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error
        });
    }
}

// update order status -- ADMIN
export const updateOrderStatus = async (req, res) => {

    try {

        const order = await orderModel.findById(req.params.id);

        // if product already delievred so we can't change the status of order
        if (order.orderStatus === "Delievered") return catchError(res, 400, false, "You have already delievered this order");

        order.orderItems.forEach(async (o) => {
            await updateStock(o.product, o.quantity);
        })

        order.orderStatus = req.body.status;

        if (req.body.status === "Delievered") {
            order.deliveredAt = Date.now();
        }

        await order.save({ validateBeforeSave: false });

        res.status(200).json({
            success: true,
            message: `Status updated to - ${req.body.status}`,
            order,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error
        });
    }
}
