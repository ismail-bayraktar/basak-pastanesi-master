import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import adminModel from '../models/AdminModel.js';
import logger from '../utils/logger.js';
import { updateLastLogin } from '../middleware/PermissionMiddleware.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { adminLoginSchema, createAdminSchema, updateAdminSchema, adminIdSchema } from '../schemas/adminSchema.js';

/**
 * Admin Login
 */
const adminLogin = async (req, res) => {
  try {
    const validation = adminLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
    }

    const { email, password } = validation.data;

    const admin = await adminModel.findOne({ email, isActive: true });

    if (!admin) {
      return errorResponse(res, 'Geçersiz kimlik bilgileri', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      logger.warn('Invalid password attempt', { email, attempt: 'login' });
      return errorResponse(res, 'Geçersiz kimlik bilgileri', 401);
    }

    // Update last login
    await updateLastLogin(email);

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin._id,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('Admin logged in', { email, role: admin.role });

    successResponse(res, {
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    logger.error('Error in admin login', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Get all admins (Super Admin only)
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.find({});

    successResponse(res, {
      admins: admins.map(admin => ({
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt
      }))
    });
  } catch (error) {
    logger.error('Error getting all admins', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Create new admin (Super Admin only)
 */
const createAdmin = async (req, res) => {
  try {
    const validation = createAdminSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
    }

    const { name, email, password, role, permissions } = validation.data;

    // Check if admin exists
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return errorResponse(res, 'Bu email adresi ile kayıtlı admin zaten var', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'admin',
      permissions: permissions || [],
      isActive: true
    };

    const admin = new adminModel(adminData);
    await admin.save();

    logger.info('New admin created', { email, role, createdBy: req.admin.email });

    successResponse(res, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    }, 'Admin başarıyla oluşturuldu');
  } catch (error) {
    logger.error('Error creating admin', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Update admin (Super Admin or same user)
 */
const updateAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Validate body
    const validation = updateAdminSchema.safeParse(req.body);
    if (!validation.success) {
      return errorResponse(res, "Validation Error", 400, validation.error.errors.map(e => e.message));
    }

    const { name, email, role, permissions, isActive } = validation.data;

    // Check if user is updating themselves or has super_admin role
    if (req.admin.role !== 'super_admin' && req.admin._id.toString() !== adminId) {
      return errorResponse(res, 'Yetkiniz yok', 403);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role && req.admin.role === 'super_admin') updateData.role = role;
    if (permissions) updateData.permissions = permissions;
    if (isActive !== undefined && req.admin.role === 'super_admin') updateData.isActive = isActive;
    updateData.updatedAt = new Date();

    const admin = await adminModel.findByIdAndUpdate(adminId, updateData, { new: true });

    if (!admin) {
      return errorResponse(res, 'Admin bulunamadı', 404);
    }

    logger.info('Admin updated', { adminId, updatedBy: req.admin.email });

    successResponse(res, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive
      }
    }, 'Admin başarıyla güncellendi');
  } catch (error) {
    logger.error('Error updating admin', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Delete admin (Super Admin only)
 */
const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Prevent self-deletion
    if (req.admin._id.toString() === adminId) {
      return errorResponse(res, 'Kendinizi silemezsiniz', 400);
    }

    const admin = await adminModel.findByIdAndDelete(adminId);

    if (!admin) {
      return errorResponse(res, 'Admin bulunamadı', 404);
    }

    logger.info('Admin deleted', { adminId, deletedBy: req.admin.email });

    successResponse(res, null, 'Admin başarıyla silindi');
  } catch (error) {
    logger.error('Error deleting admin', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

/**
 * Get current admin profile
 */
const getProfile = async (req, res) => {
  try {
    const admin = await adminModel.findById(req.admin._id);

    successResponse(res, {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    });
  } catch (error) {
    logger.error('Error getting profile', { error: error.message, stack: error.stack });
    errorResponse(res, error.message);
  }
};

export {
  adminLogin,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getProfile
};

