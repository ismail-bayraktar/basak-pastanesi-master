import express from 'express';
import {
  getSettings,
  getSetting,
  updateSetting,
  updateSettings,
  deleteSetting,
  testEmail,
  getWhatsAppSettings,
  updateWhatsAppSettings,
  getBranchAssignmentSettings,
  updateBranchAssignmentSettings
} from '../controllers/SettingsController.js';
import adminAuth from '../middleware/AdminAuth.js';
import { checkMaintenanceStatus } from '../middleware/MaintenanceMode.js';

const settingsRouter = express.Router();

// All routes require admin authentication
settingsRouter.get('/', adminAuth, getSettings);
settingsRouter.get('/category/:category', adminAuth, getSettings); // Get settings by category
settingsRouter.post('/single', adminAuth, getSetting);
settingsRouter.post('/update', adminAuth, updateSetting);
settingsRouter.post('/update-multiple', adminAuth, updateSettings);
settingsRouter.post('/bulk-update', adminAuth, updateSettings); // Alias for update-multiple
settingsRouter.post('/test-email', adminAuth, testEmail);
settingsRouter.delete('/', adminAuth, deleteSetting);

// WhatsApp support settings
// GET is public (for frontend), POST requires admin auth
settingsRouter.get('/whatsapp', getWhatsAppSettings);
settingsRouter.post('/whatsapp', adminAuth, updateWhatsAppSettings);

// Branch assignment settings
settingsRouter.get('/branch-assignment', adminAuth, getBranchAssignmentSettings);
settingsRouter.post('/branch-assignment', adminAuth, updateBranchAssignmentSettings);

// Maintenance mode status (public endpoint)
settingsRouter.get('/maintenance-status', checkMaintenanceStatus);

export default settingsRouter;
