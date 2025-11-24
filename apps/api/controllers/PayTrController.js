import { getPaytrToken, validatePaytrCallback } from "../services/PayTrService.js";
import orderModel from "../models/OrderModel.js";
import userModel from "../models/UserModel.js";
import logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { z } from "zod";

const paytrTokenSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    email: z.string().email(),
    payment_amount: z.number().positive(),
    user_name: z.string().min(1),
    user_address: z.string().min(1),
    user_phone: z.string().min(1),
    user_ip: z.string().optional(),
    user_basket: z.string().min(1), // JSON string expected by PayTR
    items: z.array(z.any()).optional() // Actual items for DB
});

// PayTR Token isteği
export const requestPaytrToken = async (req, res) => {
    try {
        const validation = paytrTokenSchema.safeParse(req.body);
        if (!validation.success) {
            return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
        }

        const paymentData = validation.data;
        // User ID is available in paymentData.userId
        const data = await getPaytrToken(paymentData);

        if (data.status === 'success') {
            successResponse(res, { token: data.token });
        } else {
            errorResponse(res, data.reason || "PayTR token request failed", 400);
        }

    } catch (error) {
        logger.error("PayTR token request error", { error: error.message, stack: error.stack, paymentData: req.body });
        errorResponse(res, error.message);
    }
};

export const updatePayTrOrderItemsAndAddress = async (req, res) => {
    try {
        const { userId, address, items } = req.body;

        if (!userId) return errorResponse(res, "User ID is required", 400);

        // 1. Kullanıcının en son siparişini bul (tüm siparişler arasından)
        const lastOrder = await orderModel.findOne(
            { userId },
            {},
            { sort: { date: -1 } } // date'e göre ters sırala (en yeni en üstte)
        );

        if (!lastOrder) {
            return errorResponse(res, "Sipariş bulunamadı", 404);
        }

        // 2. Siparişi güncelle
        const updatedOrder = await orderModel.findByIdAndUpdate(
            lastOrder._id, // Bulunan siparişin ID'si
            {
                $set: {
                    address: address, // Yeni adres
                    items: items      // Yeni ürünler
                }
            },
            { new: true } // Güncellenmiş versiyonu döndür
        );

        successResponse(res, { order: updatedOrder });

    } catch (error) {
        logger.error("PayTR order update error", { error: error.message, stack: error.stack, body: req.body });
        errorResponse(res, error.message);
    }
};

// PayTR Callback kontrolü
export const handlePaytrCallback = async (req, res) => {
    try {
        const callbackData = req.body;
        // Callback hash doğrulaması
        validatePaytrCallback(callbackData);

        // Callback'in başarılı olduğu durum
        if (callbackData.status === 'success') {
            const orderIds = callbackData.merchant_oid;
            const order = await orderModel.findOneAndUpdate({ orderId: orderIds }, { payment: true });

            if (order) {
                const user = await userModel.findById(order.userId);
                if (user) {
                    user.cartData = {};
                    await user.save();
                }
            }

            // Ödeme başarılıysa işlem yapılabilir (örneğin, sipariş onaylama vb.
            res.send('OK');
        } else {
            // Ödeme başarısızsa yapılacak işlemler
            res.send('FAILED');
        }
    } catch (error) {
        logger.error("PayTR callback error", { error: error.message, stack: error.stack });
        res.status(400).json({ success: false, message: "Invalid callback", error: error.message });
    }
};
