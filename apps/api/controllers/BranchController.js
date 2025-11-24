import branchModel from '../models/BranchModel.js';
import logger from '../utils/logger.js';

/**
 * Create a new branch
 */
const createBranch = async (req, res) => {
    try {
        const {
            name,
            code,
            address,
            contact,
            workingHours,
            assignedZones,
            capacity,
            settings,
            notes
        } = req.body;

        // Validation
        if (!name || !code || !address?.street) {
            return res.json({ 
                success: false, 
                message: 'Branch name, code, and address are required' 
            });
        }

        // Check if code already exists
        const existingBranch = await branchModel.findOne({ code });
        if (existingBranch) {
            return res.json({ 
                success: false, 
                message: 'Branch code already exists' 
            });
        }

        const newBranch = new branchModel({
            name,
            code: code.toUpperCase(),
            address: {
                street: address.street,
                district: address.district || '',
                city: address.city || 'İzmir',
                zipCode: address.zipCode || '',
                coordinates: address.coordinates || { latitude: null, longitude: null }
            },
            contact: {
                phone: contact?.phone || '',
                email: contact?.email || '',
                whatsapp: contact?.whatsapp || ''
            },
            workingHours: workingHours || {
                weekdays: { start: '09:00', end: '18:00' },
                weekend: { start: '10:00', end: '16:00' }
            },
            assignedZones: assignedZones || [],
            capacity: capacity || { dailyOrders: 100, activeCouriers: 5 },
            settings: settings || {
                autoAssignment: true,
                hybridMode: false,
                googleMapsEnabled: false
            },
            notes: notes || '',
            status: 'active'
        });

        await newBranch.save();

        res.json({ 
            success: true, 
            message: 'Branch created successfully',
            branch: newBranch
        });
    } catch (error) {
        logger.error('Error creating branch', { error: error.message, stack: error.stack, body: req.body });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all branches
 */
const getAllBranches = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = {};
        if (status) {
            query.status = status;
        }

        const branches = await branchModel.find(query).sort({ createdAt: -1 });

        res.json({ 
            success: true, 
            branches,
            count: branches.length
        });
    } catch (error) {
        logger.error('Error fetching branches', { error: error.message, stack: error.stack, query: req.query });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get branch by ID
 */
const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;

        const branch = await branchModel.findById(id);
        
        if (!branch) {
            return res.json({ success: false, message: 'Branch not found' });
        }

        res.json({ success: true, branch });
    } catch (error) {
        logger.error('Error fetching branch', { error: error.message, stack: error.stack, branchId: req.params.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update branch
 */
const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Uppercase code if provided
        if (updateData.code) {
            updateData.code = updateData.code.toUpperCase();
        }

        const branch = await branchModel.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: Date.now() },
            { new: true, runValidators: true }
        );

        if (!branch) {
            return res.json({ success: false, message: 'Branch not found' });
        }

        res.json({ 
            success: true, 
            message: 'Branch updated successfully',
            branch
        });
    } catch (error) {
        logger.error('Error updating branch', { error: error.message, stack: error.stack, branchId: req.params.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete branch
 */
const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;

        const branch = await branchModel.findByIdAndDelete(id);

        if (!branch) {
            return res.json({ success: false, message: 'Branch not found' });
        }

        res.json({ 
            success: true, 
            message: 'Branch deleted successfully' 
        });
    } catch (error) {
        logger.error('Error deleting branch', { error: error.message, stack: error.stack, branchId: req.params.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
};

