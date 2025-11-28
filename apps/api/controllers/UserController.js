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

/**
 * Get user profile
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    const user = await userModel.findById(userId).select('-password');
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    // Get order statistics
    const orders = await orderModel.find({ userId: userId.toString() });
    const totalOrders = orders.length;
    const totalSpent = orders
      .filter(order => order.payment)
      .reduce((sum, order) => sum + order.amount, 0);

    successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        loyaltyPoints: user.loyaltyPoints || 0,
        createdAt: user.createdAt,
      },
      stats: {
        totalOrders,
        totalSpent,
        favoritesCount: user.favorites?.length || 0,
        addressesCount: user.addresses?.length || 0,
      }
    });
  } catch (error) {
    logger.error('Error fetching user profile', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Update user profile
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { name, phone } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    logger.info('User profile updated', { userId, updates: updateData });
    successResponse(res, { user });
  } catch (error) {
    logger.error('Error updating user profile', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Get user addresses
 */
const getUserAddresses = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    const user = await userModel.findById(userId).select('addresses');
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    successResponse(res, { addresses: user.addresses || [] });
  } catch (error) {
    logger.error('Error fetching user addresses', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Add user address
 */
const addUserAddress = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { name, phone, address, city, district, zipcode, isDefault } = req.body;

    if (!name || !phone || !address || !city) {
      return errorResponse(res, 'Adres bilgileri eksik', 400);
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      name,
      phone,
      address,
      city,
      district: district || '',
      zipcode: zipcode || '',
      isDefault: isDefault || (user.addresses.length === 0) // First address is default
    };

    user.addresses.push(newAddress);
    await user.save();

    logger.info('Address added', { userId, addressId: user.addresses[user.addresses.length - 1]._id });
    successResponse(res, { address: user.addresses[user.addresses.length - 1] });
  } catch (error) {
    logger.error('Error adding address', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Update user address
 */
const updateUserAddress = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { addressId } = req.params;
    const { name, phone, address, city, district, zipcode, isDefault } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return errorResponse(res, 'Adres bulunamadı', 404);
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach((addr, index) => {
        if (index !== addressIndex) {
          addr.isDefault = false;
        }
      });
    }

    // Update address fields
    if (name) user.addresses[addressIndex].name = name;
    if (phone) user.addresses[addressIndex].phone = phone;
    if (address) user.addresses[addressIndex].address = address;
    if (city) user.addresses[addressIndex].city = city;
    if (district !== undefined) user.addresses[addressIndex].district = district;
    if (zipcode !== undefined) user.addresses[addressIndex].zipcode = zipcode;
    if (isDefault !== undefined) user.addresses[addressIndex].isDefault = isDefault;

    await user.save();

    logger.info('Address updated', { userId, addressId });
    successResponse(res, { address: user.addresses[addressIndex] });
  } catch (error) {
    logger.error('Error updating address', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Delete user address
 */
const deleteUserAddress = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { addressId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    const addressIndex = user.addresses.findIndex(
      addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return errorResponse(res, 'Adres bulunamadı', 404);
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    logger.info('Address deleted', { userId, addressId });
    successResponse(res, { message: 'Adres silindi' });
  } catch (error) {
    logger.error('Error deleting address', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Set default address
 */
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { addressId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    const address = user.addresses.find(
      addr => addr._id.toString() === addressId
    );

    if (!address) {
      return errorResponse(res, 'Adres bulunamadı', 404);
    }

    // Unset all defaults
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });

    // Set this as default
    address.isDefault = true;
    await user.save();

    logger.info('Default address set', { userId, addressId });
    successResponse(res, { address });
  } catch (error) {
    logger.error('Error setting default address', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Get user favorites
 */
const getUserFavorites = async (req, res) => {
  try {
    const userId = req.body.userId;
    
    const user = await userModel.findById(userId)
      .populate('favorites.productId', 'name basePrice image category')
      .select('favorites');
    
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    // Filter out deleted products
    const favorites = (user.favorites || []).filter(fav => fav.productId !== null);

    successResponse(res, { favorites });
  } catch (error) {
    logger.error('Error fetching user favorites', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Add product to favorites
 */
const addToFavorites = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { productId } = req.body;

    if (!productId) {
      return errorResponse(res, 'Ürün ID gereklidir', 400);
    }

    // Verify product exists
    const productModel = (await import('../models/ProductModel.js')).default;
    const product = await productModel.findById(productId);
    if (!product) {
      return errorResponse(res, 'Ürün bulunamadı', 404);
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    // Check if already in favorites
    const exists = user.favorites.some(
      fav => fav.productId.toString() === productId
    );

    if (exists) {
      return errorResponse(res, 'Ürün zaten favorilerde', 409);
    }

    user.favorites.push({
      productId: productId,
      addedAt: new Date()
    });

    await user.save();

    logger.info('Product added to favorites', { userId, productId });
    successResponse(res, { message: 'Ürün favorilere eklendi' });
  } catch (error) {
    logger.error('Error adding to favorites', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Remove product from favorites
 */
const removeFromFavorites = async (req, res) => {
  try {
    const userId = req.body.userId;
    const { productId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) {
      return errorResponse(res, 'Kullanıcı bulunamadı', 404);
    }

    const favoriteIndex = user.favorites.findIndex(
      fav => fav.productId.toString() === productId
    );

    if (favoriteIndex === -1) {
      return errorResponse(res, 'Ürün favorilerde bulunamadı', 404);
    }

    user.favorites.splice(favoriteIndex, 1);
    await user.save();

    logger.info('Product removed from favorites', { userId, productId });
    successResponse(res, { message: 'Ürün favorilerden çıkarıldı' });
  } catch (error) {
    logger.error('Error removing from favorites', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

export { 
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
};