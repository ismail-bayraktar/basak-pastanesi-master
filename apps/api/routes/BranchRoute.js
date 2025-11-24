import express from 'express';
import adminAuth from '../middleware/AdminAuth.js';
import {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch
} from '../controllers/BranchController.js';

const branchRouter = express.Router();

// All routes require admin authentication
branchRouter.use(adminAuth);

// CRUD operations
branchRouter.post('/', createBranch);
branchRouter.get('/', getAllBranches);
branchRouter.get('/:id', getBranchById);
branchRouter.put('/:id', updateBranch);
branchRouter.delete('/:id', deleteBranch);

export default branchRouter;

