import userModel from "../models/UserModel.js";
import orderModel from "../models/OrderModel.js";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { loginSchema, registerSchema, adminLoginSchema } from "../schemas/userSchema.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
}

// Route for user login
const loginUser = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
    }

    const { email, password } = validation.data;

    const user = await userModel.findOne({ email });
    if (!user) {
      return errorResponse(res, "Böyle bir kullanıcı bulunamadı", 404);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user._id);
      successResponse(res, { token });
    } else {
      errorResponse(res, "Geçersiz şifre", 401);
    }
  } catch (error) {
    logger.error('Error in user login', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
}

// Route for register
const registerUser = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
    }

    const { name, email, password } = validation.data;

    // Checking user already exists or not!
    const exists = await userModel.findOne({ email });
    if (exists) {
      return errorResponse(res, "Kullanıcı zaten mevcut", 409);
    }

    // Hashing user password!
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    })

    const user = await newUser.save();
    const token = createToken(user._id);
    logger.info('User registered successfully', { userId: user._id, email });
    successResponse(res, { token });
  } catch (error) {
    logger.error('Error in user registration', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
}

// Route for admin login (Updated to use database)
const adminLogin = async (req, res) => {
  try {
    const validation = adminLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
    }

    const { email, password } = validation.data;

    // Import adminModel dynamically to avoid circular dependency
    const adminModel = (await import('../models/AdminModel.js')).default;

    const admin = await adminModel.findOne({ email, isActive: true });

    if (!admin) {
      return errorResponse(res, "Geçersiz kimlik bilgileri", 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return errorResponse(res, "Geçersiz kimlik bilgileri", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('Admin login successful', { email });
    successResponse(res, { token });
  } catch (error) {
    logger.error('Error in admin login', { error: error.message, stack: error.stack, email: req.body.email });
    errorResponse(res, error.message);
  }
}

/**
 * Get all customers with order statistics
 */
const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build search query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get paginated users
    const skip = (page - 1) * limit;
    const users = await userModel
      .find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await userModel.countDocuments(query);

    // Get order statistics for each user
    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await orderModel.find({ userId: user._id.toString() });
        const totalOrders = orders.length;
        const totalSpent = orders
          .filter(order => order.payment)
          .reduce((sum, order) => sum + order.amount, 0);
        const lastOrder = orders.length > 0
          ? orders.sort((a, b) => b.date - a.date)[0].date
          : null;

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          createdAt: user.createdAt,
          totalOrders,
          totalSpent,
          lastOrder,
        };
      })
    );

    successResponse(res, {
      customers: customersWithStats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching customers', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Get customer details with full order history
 */
const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id).select('-password');
    if (!user) {
      return errorResponse(res, 'Müşteri bulunamadı', 404);
    }

    const orders = await orderModel.find({ userId: id }).sort({ date: -1 });

    const stats = {
      totalOrders: orders.length,
      totalSpent: orders.filter(o => o.payment).reduce((sum, o) => sum + o.amount, 0),
      averageOrderValue: orders.length > 0
        ? orders.filter(o => o.payment).reduce((sum, o) => sum + o.amount, 0) / orders.filter(o => o.payment).length
        : 0,
      lastOrder: orders.length > 0 ? orders[0].date : null,
    };

    successResponse(res, {
      customer: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      stats,
      orders,
    });
  } catch (error) {
    logger.error('Error fetching customer details', { error: error.message, stack: error.stack, customerId: req.params.id });
    errorResponse(res, error.message);
  }
};

export { loginUser, registerUser, adminLogin, getCustomers, getCustomerDetails };