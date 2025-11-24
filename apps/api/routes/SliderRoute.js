import express from 'express';
import {
    listSliders,
    listSlidersAdmin,
    trackSliderView,
    trackSliderClick,
    addSlider,
    updateSlider,
    deleteSlider
} from '../controllers/SliderController.js';
import adminAuth from '../middleware/AdminAuth.js';

const router = express.Router();

// Get all sliders (for frontend)
router.get('/list', listSliders);

// Get all sliders (for admin - includes inactive)
router.get('/admin/list', adminAuth, listSlidersAdmin);

// Track analytics (public)
router.post('/track/view/:id', trackSliderView);
router.post('/track/click/:id', trackSliderClick);

// Add slider (admin)
// Note: Image upload now handled via Cloudinary direct upload from frontend
// Slider add/update expects image URLs in request body instead of file uploads
router.post('/add', adminAuth, addSlider);

// Update slider (admin)
router.put('/update/:id', adminAuth, updateSlider);

// Delete slider (admin)
router.delete('/delete/:id', adminAuth, deleteSlider);

export default router;
