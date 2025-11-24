import settingsModel from '../models/SettingsModel.js';
import logger from '../utils/logger.js';

/**
 * Middleware to check if maintenance mode is enabled
 * Returns 503 Service Unavailable if maintenance mode is active
 */
const maintenanceMode = async (req, res, next) => {
  try {
    // Check if maintenance mode is enabled
    const maintenanceSetting = await settingsModel.findOne({
      key: 'general.maintenanceMode'
    });

    // If maintenance mode is enabled and user is not admin
    if (maintenanceSetting && maintenanceSetting.value === true) {
      // Allow admin routes to bypass maintenance mode
      const isAdminRoute = req.path.startsWith('/api/admin') ||
                          req.path.startsWith('/api/settings') ||
                          req.path.startsWith('/api/user/admin');

      if (!isAdminRoute) {
        logger.info('Maintenance mode active - blocking request', {
          path: req.path,
          method: req.method
        });

        return res.status(503).json({
          success: false,
          maintenance: true,
          message: 'Site bakım modunda. Lütfen daha sonra tekrar deneyin.',
        });
      }
    }

    next();
  } catch (error) {
    logger.error('Error checking maintenance mode', {
      error: error.message,
      stack: error.stack
    });
    // On error, allow request to proceed (fail open)
    next();
  }
};

/**
 * Public endpoint to check maintenance status
 * Can be called by frontend without authentication
 */
const checkMaintenanceStatus = async (req, res) => {
  try {
    const maintenanceSetting = await settingsModel.findOne({
      key: 'general.maintenanceMode'
    });

    const isMaintenanceMode = maintenanceSetting && maintenanceSetting.value === true;

    res.json({
      success: true,
      maintenanceMode: isMaintenanceMode,
      message: isMaintenanceMode
        ? 'Site bakım modunda'
        : 'Site normal çalışıyor'
    });
  } catch (error) {
    logger.error('Error checking maintenance status', {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Bakım modu durumu kontrol edilemedi'
    });
  }
};

export { maintenanceMode, checkMaintenanceStatus };
