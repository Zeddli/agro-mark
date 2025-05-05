/**
 * Interface for category data
 */
export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Interface for tag data
 */
export interface Tag {
  id: string;
  name: string;
}

/**
 * Service for managing categories and tags
 * Provides methods for fetching, creating, and managing product categories and tags
 */
export class CategoryService {
  /**
   * Fetch all available categories
   * @returns Promise with array of categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      return data.data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Fetch a specific category by ID
   * @param id Category ID
   * @returns Promise with category data
   */
  async getCategory(id: string): Promise<Category> {
    try {
      const response = await fetch(`/api/categories/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }
      
      const data = await response.json();
      return data.data.category;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Create a new category (admin only)
   * @param category Category data
   * @returns Promise with created category
   */
  async createCategory(category: Omit<Category, 'id'>): Promise<Category> {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(category)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      
      const data = await response.json();
      return data.data.category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update an existing category (admin only)
   * @param id Category ID
   * @param updates Category data updates
   * @returns Promise with updated category
   */
  async updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Promise<Category> {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      
      const data = await response.json();
      return data.data.category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category (admin only)
   * @param id Category ID
   * @returns Promise with success status
   */
  async deleteCategory(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  /**
   * Fetch all available tags
   * @returns Promise with array of tags
   */
  async getAllTags(): Promise<Tag[]> {
    try {
      const response = await fetch('/api/tags');
      
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }
      
      const data = await response.json();
      return data.data.tags;
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  /**
   * Create a new tag
   * @param name Tag name
   * @returns Promise with created tag
   */
  async createTag(name: string): Promise<Tag> {
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ name })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create tag');
      }
      
      const data = await response.json();
      return data.data.tag;
    } catch (error) {
      console.error('Error creating tag:', error);
      throw error;
    }
  }

  /**
   * Get products by category
   * @param categoryId Category ID
   * @returns Promise with array of products in the category
   */
  async getProductsByCategory(categoryId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/products?category=${categoryId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products by category');
      }
      
      const data = await response.json();
      return data.data.products;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  /**
   * Get products by tag
   * @param tagId Tag ID
   * @returns Promise with array of products with the tag
   */
  async getProductsByTag(tagId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/products?tag=${tagId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products by tag');
      }
      
      const data = await response.json();
      return data.data.products;
    } catch (error) {
      console.error('Error fetching products by tag:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const categoryService = new CategoryService(); 