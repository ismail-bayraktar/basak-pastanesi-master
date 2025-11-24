import categoryModel from "../models/CategoryModel.js";
import productModel from "../models/ProductModel.js";
import logger from "../utils/logger.js";

// Get all categories with optional filtering
const listCategories = async (req, res) => {
    try {
        const { activeOnly = false, includeProductCount = true } = req.query;

        const filter = {};
        if (activeOnly === 'true') {
            filter.active = true;
        }

        let categories = await categoryModel
            .find(filter)
            .sort({ order: 1, name: 1 })
            .lean();

        // Update product counts if requested
        if (includeProductCount === 'true') {
            await Promise.all(
                categories.map(async (category) => {
                    const count = await productModel.countDocuments({ category: category.name });
                    category.productCount = count;
                })
            );
        }

        logger.info('Categories listed', { count: categories.length, filter });
        res.json({ success: true, categories });
    } catch (error) {
        logger.error('Error listing categories', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get only active categories (for public/product forms)
const listActiveCategories = async (req, res) => {
    try {
        const categories = await categoryModel
            .find({ active: true })
            .sort({ order: 1, name: 1 })
            .select('name slug description icon')
            .lean();

        logger.info('Active categories listed', { count: categories.length });
        res.json({ success: true, categories });
    } catch (error) {
        logger.error('Error listing active categories', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single category
const singleCategory = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Category ID is required" });
        }

        const category = await categoryModel.findById(id).lean();

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Get product count
        const productCount = await productModel.countDocuments({ category: category.name });
        category.productCount = productCount;

        logger.info('Category retrieved', { categoryId: id, name: category.name });
        res.json({ success: true, category });
    } catch (error) {
        logger.error('Error retrieving category', { error: error.message, id: req.body.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add new category
const addCategory = async (req, res) => {
    try {
        const { name, description, icon, active = true, order = 0 } = req.body;

        // Validation
        if (!name || name.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: "Kategori adı en az 2 karakter olmalıdır"
            });
        }

        // Check for duplicate
        const existingCategory = await categoryModel.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Bu kategori adı zaten mevcut"
            });
        }

        const categoryData = {
            name: name.trim(),
            description: description?.trim() || '',
            icon: icon?.trim() || '',
            active: active === true || active === 'true',
            order: Number(order) || 0
        };

        const category = new categoryModel(categoryData);
        await category.save();

        logger.info('Category added successfully', { categoryId: category._id, name: category.name });
        res.json({
            success: true,
            message: "Kategori başarıyla eklendi",
            category: {
                _id: category._id,
                name: category.name,
                slug: category.slug
            }
        });
    } catch (error) {
        logger.error('Error adding category', { error: error.message, stack: error.stack });

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Bu kategori adı zaten mevcut"
            });
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        const { id, name, description, icon, active, order } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Category ID is required" });
        }

        const category = await categoryModel.findById(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const updatePayload = {};

        if (name !== undefined) {
            if (name.trim().length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Kategori adı en az 2 karakter olmalıdır"
                });
            }

            // Check for duplicate (excluding current category)
            const existingCategory = await categoryModel.findOne({
                _id: { $ne: id },
                name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
            });

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Bu kategori adı zaten mevcut"
                });
            }

            // Update products with old category name to new name
            const oldName = category.name;
            updatePayload.name = name.trim();

            if (oldName !== updatePayload.name) {
                await productModel.updateMany(
                    { category: oldName },
                    { $set: { category: updatePayload.name } }
                );
                logger.info('Products updated with new category name', {
                    oldName,
                    newName: updatePayload.name
                });
            }
        }

        if (description !== undefined) updatePayload.description = description.trim();
        if (icon !== undefined) updatePayload.icon = icon.trim();
        if (active !== undefined) updatePayload.active = active === true || active === 'true';
        if (order !== undefined) updatePayload.order = Number(order);

        await categoryModel.findByIdAndUpdate(id, updatePayload);

        // Fetch the updated category to return to frontend
        const updatedCategory = await categoryModel.findById(id).lean();

        // Get product count
        const productCount = await productModel.countDocuments({ category: updatedCategory.name });
        updatedCategory.productCount = productCount;

        logger.info('Category updated successfully', { categoryId: id });
        res.json({
            success: true,
            message: "Kategori başarıyla güncellendi",
            category: updatedCategory
        });
    } catch (error) {
        logger.error('Error updating category', { error: error.message, stack: error.stack, categoryId: req.body.id });

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Bu kategori adı zaten mevcut"
            });
        }

        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete category
const removeCategory = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Category ID is required" });
        }

        const category = await categoryModel.findById(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Check if category has products
        const productCount = await productModel.countDocuments({ category: category.name });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Bu kategoriyi silemezsiniz. ${productCount} ürün bu kategoriye bağlı. Önce ürünleri başka kategoriye taşıyın.`
            });
        }

        await categoryModel.findByIdAndDelete(id);

        logger.info('Category removed successfully', { categoryId: id, name: category.name });
        res.json({ success: true, message: "Kategori başarıyla silindi" });
    } catch (error) {
        logger.error('Error removing category', { error: error.message, stack: error.stack, categoryId: req.body.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle category active status
const toggleActive = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Category ID is required" });
        }

        const category = await categoryModel.findById(id);

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        category.active = !category.active;
        await category.save();

        logger.info('Category active status toggled', {
            categoryId: id,
            name: category.name,
            active: category.active
        });

        res.json({
            success: true,
            message: `Kategori ${category.active ? 'aktif' : 'pasif'} yapıldı`,
            active: category.active
        });
    } catch (error) {
        logger.error('Error toggling category status', { error: error.message, categoryId: req.body.id });
        res.status(500).json({ success: false, message: error.message });
    }
};

// Reorder categories
const reorderCategories = async (req, res) => {
    try {
        const { categories } = req.body;

        if (!categories || !Array.isArray(categories)) {
            return res.status(400).json({
                success: false,
                message: "Categories array is required"
            });
        }

        // Bulk update orders
        const bulkOps = categories.map((cat, index) => ({
            updateOne: {
                filter: { _id: cat.id },
                update: { $set: { order: index } }
            }
        }));

        await categoryModel.bulkWrite(bulkOps);

        logger.info('Categories reordered', { count: categories.length });
        res.json({ success: true, message: "Kategori sıralaması güncellendi" });
    } catch (error) {
        logger.error('Error reordering categories', { error: error.message });
        res.status(500).json({ success: false, message: error.message });
    }
};

export {
    listCategories,
    listActiveCategories,
    singleCategory,
    addCategory,
    updateCategory,
    removeCategory,
    toggleActive,
    reorderCategories
};
