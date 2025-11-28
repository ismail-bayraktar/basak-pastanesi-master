import express from 'express';
import { createReview, getProductReviews, getUserReviews } from '../controllers/ReviewController.js';
import authUser from "../middleware/Auth.js";

const reviewRouter = express.Router();

// Public endpoints
reviewRouter.get("/product/:productId", getProductReviews);

// Authenticated endpoints
reviewRouter.post("/", authUser, createReview);
reviewRouter.get("/user", authUser, getUserReviews);

export default reviewRouter;

