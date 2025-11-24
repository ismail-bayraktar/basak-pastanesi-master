import { useState, useEffect, useCallback } from 'react';
import { categoryAPI } from '../lib/api';

/**
 * Custom hook for category data management
 * Provides loading states, CRUD operations, and error handling
 */
const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all categories (admin view - includes inactive)
   */
  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.getAll(params);
      if (response.data.success) {
        setCategories(response.data.categories);
        return response.data.categories;
      } else {
        throw new Error(response.data.message || 'Kategoriler yüklenemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Kategoriler yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Error fetching categories:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch only active categories (for product forms)
   */
  const fetchActiveCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.getActive();
      if (response.data.success) {
        setCategories(response.data.categories);
        return response.data.categories;
      } else {
        throw new Error(response.data.message || 'Aktif kategoriler yüklenemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Aktif kategoriler yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Error fetching active categories:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get single category by ID
   */
  const getCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.getById(id);
      if (response.data.success) {
        return response.data.category;
      } else {
        throw new Error(response.data.message || 'Kategori bulunamadı');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Kategori yüklenirken hata oluştu';
      setError(errorMessage);
      console.error('Error fetching category:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Add new category
   */
  const addCategory = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.add(data);
      if (response.data.success) {
        // Refresh categories list
        await fetchCategories();
        return { success: true, category: response.data.category };
      } else {
        throw new Error(response.data.message || 'Kategori eklenemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Kategori eklenirken hata oluştu';
      setError(errorMessage);
      console.error('Error adding category:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Update existing category
   */
  const updateCategory = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.update(data);
      if (response.data.success) {
        // Refresh categories list
        await fetchCategories();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Kategori güncellenemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Kategori güncellenirken hata oluştu';
      setError(errorMessage);
      console.error('Error updating category:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Remove category
   */
  const removeCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.remove(id);
      if (response.data.success) {
        // Refresh categories list
        await fetchCategories();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Kategori silinemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Kategori silinirken hata oluştu';
      setError(errorMessage);
      console.error('Error removing category:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Toggle category active status
   */
  const toggleActive = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.toggleActive(id);
      if (response.data.success) {
        // Refresh categories list
        await fetchCategories();
        return { success: true, active: response.data.active, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Durum değiştirilemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Durum değiştirilirken hata oluştu';
      setError(errorMessage);
      console.error('Error toggling category status:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Reorder categories
   */
  const reorderCategories = useCallback(async (orderedCategories) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoryAPI.reorder(orderedCategories);
      if (response.data.success) {
        // Refresh categories list
        await fetchCategories();
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Sıralama güncellenemedi');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Sıralama güncellenirken hata oluştu';
      setError(errorMessage);
      console.error('Error reordering categories:', err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Refresh categories (force reload)
   */
  const refresh = useCallback(() => {
    return fetchCategories();
  }, [fetchCategories]);

  // Auto-fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    // State
    categories,
    loading,
    error,

    // Actions
    fetchCategories,
    fetchActiveCategories,
    getCategory,
    addCategory,
    updateCategory,
    removeCategory,
    toggleActive,
    reorderCategories,
    clearError,
    refresh,
  };
};

export default useCategories;
