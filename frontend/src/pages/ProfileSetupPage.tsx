import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import Layout from '../components/layout/Layout';

/**
 * Profile setup page for users to complete their profile
 * after authenticating with their wallet
 */
const ProfileSetupPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    bio: '',
    phoneNumber: '',
    isSeller: false,
    profileImage: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Redirect if not connected
  useEffect(() => {
    if (!connected || !publicKey) {
      navigate('/');
    }
  }, [connected, publicKey, navigate]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }
      
      setFormData({
        ...formData,
        profileImage: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Create form data for multipart/form-data submission
      const profileData = new FormData();
      profileData.append('name', formData.name);
      profileData.append('location', formData.location || '');
      profileData.append('bio', formData.bio || '');
      profileData.append('phoneNumber', formData.phoneNumber || '');
      profileData.append('isSeller', formData.isSeller.toString());
      
      if (formData.profileImage) {
        profileData.append('profileImage', formData.profileImage);
      }
      
      // Send data to API
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: profileData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Profile setup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to set up profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold mb-6">Complete Your Profile</h1>
            
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Profile Image */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Profile Image
                </label>
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden mr-4">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Profile preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg 
                          className="w-10 h-10" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded text-gray-700">
                    <span>Choose Image</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  Recommended: Square image, 500x500 pixels or larger
                </p>
              </div>
              
              {/* Name */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input 
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Your name or business name"
                  required
                />
              </div>
              
              {/* Location */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                  Location
                </label>
                <input 
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="City, Country"
                />
              </div>
              
              {/* Bio */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
                  Bio
                </label>
                <textarea 
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Tell us a bit about yourself or your business"
                  rows={4}
                />
              </div>
              
              {/* Phone Number */}
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phoneNumber">
                  Phone Number
                </label>
                <input 
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="+1 (123) 456-7890"
                />
              </div>
              
              {/* Seller Account */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input 
                    type="checkbox"
                    name="isSeller"
                    checked={formData.isSeller}
                    onChange={handleChange}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-gray-700">
                    I want to sell products on AgroMark
                  </span>
                </label>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2 rounded text-white font-medium ${
                    loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfileSetupPage; 