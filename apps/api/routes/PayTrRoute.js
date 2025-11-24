import express from 'express';
import {handlePaytrCallback, requestPaytrToken} from '../controllers/PayTrController.js';
import authUser from "../middleware/Auth.js";

const paytrRouter = express.Router();

paytrRouter.post('/get-token', authUser,  requestPaytrToken);
paytrRouter.post('/callback', handlePaytrCallback);

export default paytrRouter