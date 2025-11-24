import express from 'express';
import {
  adminLogin,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getProfile
} from '../controllers/AdminController.js';
import { checkRole, checkPermission } from '../middleware/PermissionMiddleware.js';

const adminRouter = express.Router();

// Public routes
adminRouter.post('/login', adminLogin);

// Protected routes
adminRouter.get('/profile', checkPermission('settings:read'), getProfile);
adminRouter.get('/all', checkRole('super_admin', 'admin'), getAllAdmins);
adminRouter.post('/create', checkRole('super_admin'), createAdmin);
adminRouter.put('/:adminId', checkPermission('settings:update'), updateAdmin);
adminRouter.delete('/:adminId', checkRole('super_admin'), deleteAdmin);

export default adminRouter;

