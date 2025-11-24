import express from 'express';
import adminAuth from "../middleware/AdminAuth.js";
import { validateCoupon, createCoupon, listCoupons, updateCoupon, removeCoupon } from "../controllers/CouponController.js";

const couponRouter = express.Router();

couponRouter.post('/validate', validateCoupon);
couponRouter.get('/list', adminAuth, listCoupons);
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.put('/update', adminAuth, updateCoupon);
couponRouter.delete('/remove', adminAuth, removeCoupon);

export default couponRouter;

