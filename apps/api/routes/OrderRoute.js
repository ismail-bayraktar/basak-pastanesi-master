import express from 'express';
import {
    placeOrder,
    allOrders,
    userOrders,
    updateStatus,
    bankInfo,
    getOrderStatus,
    getOrderHistory,
    getOrderTimeline,
    approveBranchAssignment,
    assignBranchToOrder,
    getBranchSuggestion,
    prepareOrder,
    sendToCourier,
    deleteOrder
} from '../controllers/OrderController.js';
import adminAuth from "../middleware/AdminAuth.js";
import authUser from "../middleware/Auth.js";
import optionalAuth from "../middleware/OptionalAuth.js";
import {updatePayTrOrderItemsAndAddress} from "../controllers/PayTrController.js";
import RateLimiterService from "../services/RateLimiter.js";
import { checkStockAvailability } from "../middleware/StockCheck.js";

const orderRouter = express.Router();

// admin features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);
orderRouter.post("/approve-branch", adminAuth, approveBranchAssignment);
orderRouter.post("/assign-branch", adminAuth, assignBranchToOrder);
orderRouter.post("/prepare", adminAuth, prepareOrder);
orderRouter.post("/send-to-courier", adminAuth, sendToCourier);
orderRouter.post("/delete", adminAuth, deleteOrder);
orderRouter.get("/:id/branch-suggestion", adminAuth, getBranchSuggestion);

// payment features with stock check and rate limiting
// Using optionalAuth to allow guest checkout
orderRouter.post("/place", optionalAuth, checkStockAvailability, RateLimiterService.createOrderLimiter(), placeOrder);

// user feature
orderRouter.post("/userorders", authUser, userOrders);
orderRouter.put("/update-paytr-order", authUser, updatePayTrOrderItemsAndAddress);
orderRouter.get("/bank-info", bankInfo);

// Order tracking endpoints (public, no auth required for tracking)
orderRouter.get("/:orderId/status", getOrderStatus);
orderRouter.get("/:orderId/history", getOrderHistory);
orderRouter.get("/:orderId/timeline", getOrderTimeline);

export default orderRouter;