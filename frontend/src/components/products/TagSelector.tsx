import React, { useState } from 'react';
import { Tag } from '../../services/category.service';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onTagCreate?: (tagName: string) => Promise<Tag>;
  allowCreation?: boolean;
}

/**
 * TagSelector component for selecting and creating product tags
 * Allows users to select from existing tags or create new ones
 */
const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagSelect,
  onTagCreate,
  allowCreation = false
}) => {
  const [newTagName, setNewTagName] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle creating a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onTagCreate) {
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      // Call the provided tag creation function
      const newTag = await onTagCreate(newTagName.trim());
      
      // Select the newly created tag
      onTagSelect(newTag.id);
      
      // Reset the input
      setNewTagName('');
    } catch (err) {
      console.error('Error creating tag:', err);
      setError('Failed to create tag');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle submit of new tag form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateTag();
  };

  return (
    <div className="w-full">
      {/* Tag List */}
      <div className="flex flex-wrap gap-2 mb-3">
        {availableTags.map(tag => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onTagSelect(tag.id)}
            className={`px-2 py-1 text-sm rounded-full transition-colors ${
              selectedTags.includes(tag.id)
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {tag.name}
            {selectedTags.includes(tag.id) && (
              <span className="ml-1 font-bold">✓</span>
            )}
          </button>
        ))}
        
        {availableTags.length === 0 && !allowCreation && (
          <p className="text-gray-500 text-sm">No tags available yet.</p>
        )}
      </div>

      {/* Create New Tag Form */}
      {allowCreation && onTagCreate && (
        <div className="mt-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name"
              className="flex-grow px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
            <button
              type="submit"
              disabled={isCreating || !newTagName.trim()}
              className={`px-3 py-1 text-sm rounded text-white ${
                isCreating || !newTagName.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isCreating ? 'Adding...' : 'Add Tag'}
            </button>
          </form>
          
          {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector; 