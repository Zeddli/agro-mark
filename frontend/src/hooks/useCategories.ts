import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category, Tag } from '../services/category.service';

/**
 * Custom hook for managing categories and tags
 * Provides methods and state for fetching and managing product categorization
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all categories from the API
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedCategories = await categoryService.getAllCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all tags from the API
   */
  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedTags = await categoryService.getAllTags();
      setTags(fetchedTags);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch both categories and tags from the API
   */
  const fetchCategoriesAndTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [fetchedCategories, fetchedTags] = await Promise.all([
        categoryService.getAllCategories(),
        categoryService.getAllTags()
      ]);
      
      setCategories(fetchedCategories);
      setTags(fetchedTags);
    } catch (err) {
      console.error('Error fetching categories and tags:', err);
      setError('Failed to load categories and tags');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new category (admin only)
   * @param categoryData Category data without ID
   * @returns The created category
   */
  const createCategory = useCallback(async (categoryData: Omit<Category, 'id'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      setError('Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new tag
   * @param name Tag name
   * @returns The created tag
   */
  const createTag = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const newTag = await categoryService.createTag(name);
      setTags(prev => [...prev, newTag]);
      return newTag;
    } catch (err) {
      console.error('Error creating tag:', err);
      setError('Failed to create tag');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get products by selected category
   * @param categoryId Category ID
   * @returns Array of products in the category
   */
  const getProductsByCategory = useCallback(async (categoryId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const products = await categoryService.getProductsByCategory(categoryId);
      return products;
    } catch (err) {
      console.error('Error fetching products by category:', err);
      setError('Failed to fetch products by category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Handle category selection in UI
   * @param categoryId Category ID to select
   */
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  /**
   * Handle tag selection/deselection in UI
   * @param tagId Tag ID to toggle
   */
  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tagId)) {
        return prev.filter(id => id !== tagId);
      } else {
        return [...prev, tagId];
      }
    });
  }, []);

  /**
   * Get category by ID
   * @param categoryId Category ID
   * @returns Category object or undefined if not found
   */
  const getCategoryById = useCallback((categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  /**
   * Get tag by ID
   * @param tagId Tag ID
   * @returns Tag object or undefined if not found
   */
  const getTagById = useCallback((tagId: string) => {
    return tags.find(tag => tag.id === tagId);
  }, [tags]);

  // Load categories and tags on mount
  useEffect(() => {
    fetchCategoriesAndTags();
  }, [fetchCategoriesAndTags]);

  return {
    categories,
    tags,
    selectedCategory,
    selectedTags,
    loading,
    error,
    fetchCategories,
    fetchTags,
    fetchCategoriesAndTags,
    createCategory,
    createTag,
    getProductsByCategory,
    handleCategorySelect,
    handleTagToggle,
    getCategoryById,
    getTagById
  };
} 