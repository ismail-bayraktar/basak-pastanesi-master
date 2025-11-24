import express from 'express';
import { loginUser, registerUser, adminLogin, getCustomers, getCustomerDetails } from "../controllers/UserController.js";
import RateLimiterService from "../services/RateLimiter.js";
import adminAuth from "../middleware/AdminAuth.js";

const userRouter = express.Router();

// Apply rate limiting to authentication endpoints
userRouter.post("/register", RateLimiterService.createAuthLimiter(), registerUser);
userRouter.post("/login", RateLimiterService.createAuthLimiter(), loginUser);
userRouter.post("/admin", RateLimiterService.createAuthLimiter(), adminLogin);

// Customer management endpoints (admin only)
userRouter.get("/customers", adminAuth, getCustomers);
userRouter.get("/customers/:id", adminAuth, getCustomerDetails);

export default userRouter;