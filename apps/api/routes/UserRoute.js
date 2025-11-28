import express from 'express';
import { 
  loginUser, 
  registerUser, 
  adminLogin, 
  getCustomers, 
  getCustomerDetails, 
  getUserProfile, 
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  getUserFavorites,
  addToFavorites,
  removeFromFavorites
} from "../controllers/UserController.js";
import RateLimiterService from "../services/RateLimiter.js";
import adminAuth from "../middleware/AdminAuth.js";
import authUser from "../middleware/Auth.js";

const userRouter = express.Router();

// Apply rate limiting to authentication endpoints
userRouter.post("/register", RateLimiterService.createAuthLimiter(), registerUser);
userRouter.post("/login", RateLimiterService.createAuthLimiter(), loginUser);
userRouter.post("/admin", RateLimiterService.createAuthLimiter(), adminLogin);

// User profile endpoints (authenticated users)
userRouter.get("/profile", authUser, getUserProfile);
userRouter.put("/profile", authUser, updateUserProfile);

// Address management endpoints (authenticated users)
userRouter.get("/addresses", authUser, getUserAddresses);
userRouter.post("/addresses", authUser, addUserAddress);
userRouter.put("/addresses/:addressId", authUser, updateUserAddress);
userRouter.delete("/addresses/:addressId", authUser, deleteUserAddress);
userRouter.post("/addresses/:addressId/set-default", authUser, setDefaultAddress);

// Favorites management endpoints (authenticated users)
userRouter.get("/favorites", authUser, getUserFavorites);
userRouter.post("/favorites/add", authUser, addToFavorites);
userRouter.delete("/favorites/:productId", authUser, removeFromFavorites);

// Customer management endpoints (admin only)
userRouter.get("/customers", adminAuth, getCustomers);
userRouter.get("/customers/:id", adminAuth, getCustomerDetails);

export default userRouter;