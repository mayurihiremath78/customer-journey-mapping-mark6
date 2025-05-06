import React, { useState } from 'react';
import axios from 'axios';

// API base URL - update this to match your backend URL
const API_BASE_URL = 'http://localhost:5031';

interface BrandFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BrandForm: React.FC<BrandFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    logoUrl: '',
    yearFounded: '',
    countryOfOrigin: '',
    website: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.id) {
      setError('Brand ID is required');
      return false;
    }
    
    if (!formData.name) {
      setError('Brand name is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format the data exactly as the backend expects it
      // Convert empty strings to null for optional fields
      const brandData = {
        id: formData.id.trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        logoUrl: formData.logoUrl.trim() || null,
        yearFounded: formData.yearFounded ? parseInt(formData.yearFounded) : null,
        countryOfOrigin: formData.countryOfOrigin.trim() || null,
        website: formData.website.trim() || null
        // Note: Don't include createdAt or updatedAt - server will handle these
      };
      
      console.log('Sending brand data:', brandData);
      
      // Make sure your API endpoint is correct - note the capitalization
      const response = await axios.post(`${API_BASE_URL}/api/Brand`, brandData);
      
      console.log('Brand created successfully:', response.data);
      
      // Reset form
      setFormData({
        id: '',
        name: '',
        description: '',
        logoUrl: '',
        yearFounded: '',
        countryOfOrigin: '',
        website: ''
      });
      
      // Call success callback
      onSuccess();
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      console.error('Error creating brand:', error);
      
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Display a more meaningful error message based on the response
        if (error.response.status === 400) {
          const errorData = error.response.data;
          
          // Check for validation errors
          if (errorData.errors) {
            // Join all validation errors into a single message
            const errorMessages = Object.values(errorData.errors)
              .flat()
              .join(', ');
            setError(`Validation error: ${errorMessages}`);
          } 
          else if (errorData.title) {
            setError(`Error: ${errorData.title}`);
          }
          else if (errorData.detail) {
            setError(`Error: ${errorData.detail}`);
          }
          else if (typeof errorData === 'string') {
            setError(`Error: ${errorData}`);
          }
          else {
            setError('Invalid data. Please check your inputs.');
          }
        } else if (error.response.status === 409) {
          setError('A brand with this ID already exists');
        } else {
          setError(`Server error (${error.response.status}): ${error.response.statusText}`);
        }
      } else if (error.request) {
        setError('No response from server. Please check your connection.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Add New Brand</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Brand ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="e.g. sony"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500">Unique identifier for the brand</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Sony"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the brand"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <input
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="e.g. https://example.com/logo.png"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Year Founded
              </label>
              <input
                type="number"
                name="yearFounded"
                value={formData.yearFounded}
                onChange={handleChange}
                placeholder="e.g. 1946"
                min="1800"
                max={new Date().getFullYear()}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Country of Origin
              </label>
              <input
                type="text"
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleChange}
                placeholder="e.g. Japan"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g. https://www.sony.com"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⌛</span>
                  Saving...
                </>
              ) : (
                'Add Brand'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandForm;