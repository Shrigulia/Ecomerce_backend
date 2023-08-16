import { productModel } from "../model/productModel.js"

export const updateStock = async (id, qty) => {

    const product = await productModel.findById(id);

    product.stock -= qty;

    await product.save({ validateBeforeSave: false });
};