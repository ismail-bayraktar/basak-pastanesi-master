import express from 'express';
import {
  dailySales,
  weeklySales,
  monthlySales,
  productAnalytics,
  userBehavior,
  deliveryStatus,
  dashboardStats
} from '../controllers/ReportController.js';
import adminAuth from '../middleware/AdminAuth.js';

const reportRouter = express.Router();

// All routes require admin authentication
reportRouter.get('/daily-sales', adminAuth, dailySales);
reportRouter.get('/weekly-sales', adminAuth, weeklySales);
reportRouter.get('/monthly-sales', adminAuth, monthlySales);
reportRouter.get('/product-analytics', adminAuth, productAnalytics);
reportRouter.get('/user-behavior', adminAuth, userBehavior);
reportRouter.get('/delivery-status', adminAuth, deliveryStatus);
reportRouter.get('/dashboard', adminAuth, dashboardStats);

export default reportRouter;

