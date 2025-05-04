import React, { useState, useEffect } from 'react';
import { useCategories } from '../../hooks/useCategories';
import { Category } from '../../services/category.service';

interface CategoryManagerProps {
  onCategorySelect?: (categoryId: string) => void;
}

/**
 * CategoryManager component for administrators
 * Provides interface for creating, editing, and managing product categories
 */
const CategoryManager: React.FC<CategoryManagerProps> = ({ onCategorySelect }) => {
  const {
    categories,
    loading,
    error,
    createCategory,
    fetchCategories
  } = useCategories();

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    description: '',
    imageUrl: ''
  });

  // Fetch categories on initial load
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle input change for new category form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({ ...prev, [name]: value }));
  };

  // Handle input change for edit category form
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission for new category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.name.trim()) return;
    
    setIsCreating(true);
    
    try {
      await createCategory(newCategory);
      setNewCategory({ name: '', description: '', imageUrl: '' });
    } catch (err) {
      console.error('Error creating category:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // Set up edit mode for a category
  const startEdit = (category: Category) => {
    setEditMode(category.id);
    setEditFormData({
      name: category.name,
      description: category.description || '',
      imageUrl: category.imageUrl || ''
    });
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditMode(null);
  };

  // Save edited category
  const saveEdit = async (id: string) => {
    // Implementation would call the updateCategory method from useCategories hook
    // For demonstration purposes, this is left as a placeholder
    console.log('Saving edit for category:', id, editFormData);
    
    // Reset edit mode
    setEditMode(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Category Management</h2>
      
      {/* Error display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {/* Create new category form */}
      <form onSubmit={handleSubmit} className="mb-6 border-b pb-6">
        <h3 className="text-lg font-medium mb-3">Create New Category</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={newCategory.name}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={newCategory.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
            rows={3}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            name="imageUrl"
            value={newCategory.imageUrl}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <button
          type="submit"
          disabled={isCreating || !newCategory.name.trim()}
          className={`px-4 py-2 rounded text-white font-medium ${
            isCreating || !newCategory.name.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isCreating ? 'Creating...' : 'Create Category'}
        </button>
      </form>
      
      {/* Existing categories list */}
      <div>
        <h3 className="text-lg font-medium mb-3">Existing Categories</h3>
        
        {loading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-gray-500">No categories found.</p>
        ) : (
          <ul className="space-y-3">
            {categories.map(category => (
              <li 
                key={category.id}
                className="p-3 border rounded hover:bg-gray-50"
              >
                {editMode === category.id ? (
                  // Edit form
                  <div className="space-y-2">
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      required
                    />
                    
                    <textarea
                      name="description"
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      rows={2}
                      placeholder="Description (optional)"
                    />
                    
                    <input
                      type="text"
                      name="imageUrl"
                      value={editFormData.imageUrl}
                      onChange={handleEditInputChange}
                      className="w-full p-2 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                      placeholder="Image URL (optional)"
                    />
                    
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => saveEdit(category.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-green-700">{category.name}</div>
                      {category.description && (
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      )}
                      
                      {category.imageUrl && (
                        <div className="mt-2">
                          <img 
                            src={category.imageUrl} 
                            alt={category.name}
                            className="h-12 w-auto object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {onCategorySelect && (
                        <button
                          type="button"
                          onClick={() => onCategorySelect(category.id)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Select
                        </button>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryManager; 