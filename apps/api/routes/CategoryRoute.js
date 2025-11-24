import express from 'express';
import {
    listCategories,
    listActiveCategories,
    singleCategory,
    addCategory,
    updateCategory,
    removeCategory,
    toggleActive,
    reorderCategories
} from '../controllers/CategoryController.js';
import adminAuth from "../middleware/AdminAuth.js";
import { cache, invalidateCache } from "../middleware/cache.js";

const categoryRouter = express.Router();

/**
 * @swagger
 * /api/category/list:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: Get only active categories
 *       - in: query
 *         name: includeProductCount
 *         schema:
 *           type: boolean
 *         description: Include product count for each category
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: array
 */
categoryRouter.get('/list', adminAuth, cache(300), listCategories);

/**
 * @swagger
 * /api/category/active:
 *   get:
 *     summary: Get only active categories (public)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of active categories
 */
categoryRouter.get('/active', cache(300), listActiveCategories);

/**
 * @swagger
 * /api/category/single:
 *   post:
 *     summary: Get single category details
 *     tags: [Categories]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category details
 */
categoryRouter.post('/single', adminAuth, singleCategory);

/**
 * @swagger
 * /api/category/add:
 *   post:
 *     summary: Add new category
 *     tags: [Categories]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               active:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Category added successfully
 */
categoryRouter.post('/add', adminAuth, invalidateCache('categories:*'), addCategory);

/**
 * @swagger
 * /api/category/update:
 *   post:
 *     summary: Update existing category
 *     tags: [Categories]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               active:
 *                 type: boolean
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
categoryRouter.post('/update', adminAuth, invalidateCache('categories:*'), updateCategory);

/**
 * @swagger
 * /api/category/remove:
 *   post:
 *     summary: Delete category
 *     tags: [Categories]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category removed successfully
 */
categoryRouter.post('/remove', adminAuth, invalidateCache('categories:*'), removeCategory);

/**
 * @swagger
 * /api/category/toggle-active:
 *   post:
 *     summary: Toggle category active status
 *     tags: [Categories]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category status toggled successfully
 */
categoryRouter.post('/toggle-active', adminAuth, invalidateCache('categories:*'), toggleActive);

/**
 * @swagger
 * /api/category/reorder:
 *   post:
 *     summary: Reorder categories
 *     tags: [Categories]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Categories reordered successfully
 */
categoryRouter.post('/reorder', adminAuth, invalidateCache('categories:*'), reorderCategories);

export default categoryRouter;
