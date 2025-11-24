import express from 'express';
import adminAuth from "../middleware/AdminAuth.js";
import { createCorporateOrder, listCorporateOrders, updateCorporateOrderStatus } from "../controllers/CorporateController.js";

const corporateRouter = express.Router();

corporateRouter.post('/create', createCorporateOrder);
corporateRouter.get('/list', adminAuth, listCorporateOrders);
corporateRouter.put('/status', adminAuth, updateCorporateOrderStatus);

export default corporateRouter;

