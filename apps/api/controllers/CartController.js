import userModel from "../models/UserModel.js";
import logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { addToCartSchema, updateCartSchema, getUserCartSchema } from "../schemas/cartSchema.js";

// add products to user cart
const addToCart = async (req, res) => {
    try {
        const validation = addToCartSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { userId, itemId, size } = validation.data;
        const userData = await userModel.findById(userId);

        if (!userData) {
            return errorResponse(res, "User not found", 404);
        }

        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        successResponse(res, null, "Added to cart!");
    } catch (error) {
        logger.error('Error in cart controller', { error: error.message, stack: error.stack, endpoint: req.path, userId: req.body.userId, itemId: req.body.itemId });
        errorResponse(res, error.message);
    }
}

// update user cart
const updateCart = async (req, res) => {
    try {
        const validation = updateCartSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const { userId, itemId, size, quantity } = validation.data;
        const userData = await userModel.findById(userId);

        if (!userData) {
            return errorResponse(res, "User not found", 404);
        }

        let cartData = await userData.cartData;

        if (!cartData[itemId]) {
            cartData[itemId] = {};
        }

        cartData[itemId][size] = quantity;

        await userModel.findByIdAndUpdate(userId, { cartData });
        successResponse(res, null, "Cart updated!");

    } catch (error) {
        logger.error('Error in cart controller', { error: error.message, stack: error.stack, endpoint: req.path, userId: req.body.userId, itemId: req.body.itemId });
        errorResponse(res, error.message);
    }
}

// get user cart data
const getUserCart = async (req, res) => {
    try {
        // Allow getting userId from req.body or req.query (for GET requests)
        const userId = req.body.userId || req.query.userId;

        const validation = getUserCartSchema.safeParse({ userId });
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const userData = await userModel.findById(userId);

        if (!userData) {
            return errorResponse(res, "User not found", 404);
        }

        let cartData = await userData.cartData;

        successResponse(res, { cartData });
    } catch (error) {
        logger.error('Error in cart controller', { error: error.message, stack: error.stack, endpoint: req.path, userId: req.body.userId || req.query.userId });
        errorResponse(res, error.message);
    }
}

export { addToCart, updateCart, getUserCart };