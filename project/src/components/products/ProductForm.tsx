import React, { useState } from 'react';
import axios from 'axios';

// API base URL - update this to match your backend URL
const API_BASE_URL = 'http://localhost:5031'; // Change this to match your actual API URL

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    brand: '',
    imageUrl: '',
    price: '',
    averageRating: '0',
    type: '',
    soundQuality: '',
    comfortRating: '0',
    design: '',
    waterResistance: false,
    microphone: false,
    weightGrams: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkboxes separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } 
    // Handle all other inputs
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    // Required fields
    const required = ['id', 'name', 'brand', 'imageUrl', 'price', 'type'];
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    
    // Validate ID format (alphanumeric with possibly some special chars)
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.id)) {
      setError('ID must contain only letters, numbers, hyphens, or underscores');
      return false;
    }
    
    // Validate price is a positive number
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      setError('Price must be a positive number');
      return false;
    }
    
    // Validate ratings are in proper range
    const avgRating = parseFloat(formData.averageRating);
    if (isNaN(avgRating) || avgRating < 0 || avgRating > 5) {
      setError('Average rating must be between 0 and 5');
      return false;
    }
    
    if (formData.comfortRating) {
      const comfortRating = parseInt(formData.comfortRating);
      if (isNaN(comfortRating) || comfortRating < 0 || comfortRating > 5) {
        setError('Comfort rating must be between 0 and 5');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setError(null);
    
    // Validate the form
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert form data to match API expectations
      const productData = {
        id: formData.id,
        name: formData.name,
        brand: formData.brand,
        imageUrl: formData.imageUrl,
        price: parseFloat(formData.price),
        averageRating: parseFloat(formData.averageRating),
        type: formData.type,
        soundQuality: formData.soundQuality || null,
        comfortRating: formData.comfortRating ? parseInt(formData.comfortRating) : 0,
        design: formData.design || null,
        waterResistance: formData.waterResistance,
        microphone: formData.microphone,
        weightGrams: formData.weightGrams ? parseFloat(formData.weightGrams) : 0
      };
      
      console.log('Submitting product data:', productData);
      
      // Here's the POST API call to submit to your backend ProductController
      const response = await axios.post(`${API_BASE_URL}/api/Product`, productData);
      
      console.log('Product created successfully:', response.data);
      
      // Reset form 
      setFormData({
        id: '',
        name: '',
        brand: '',
        imageUrl: '',
        price: '',
        averageRating: '0',
        type: '',
        soundQuality: '',
        comfortRating: '0',
        design: '',
        waterResistance: false,
        microphone: false,
        weightGrams: ''
      });
      
      // Call success callback to refresh products list
      onSuccess();
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      console.error('Error creating product:', error);
      
      // Show more detailed error info
      if (error.response) {
        console.error('Server responded with error:', error.response);
        
        if (error.response.status === 409) {
          setError('A product with this ID already exists');
        } else if (error.response.data?.title || error.response.data?.message) {
          setError(`Error: ${error.response.data.title || error.response.data.message}`);
        } else {
          setError(`Error ${error.response.status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        console.error('No response received from server:', error.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Add New Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 col-span-full">
              {error}
            </div>
          )}
          
          {/* Required fields */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Product ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="id"
              value={formData.id}
              onChange={handleChange}
              placeholder="e.g. XM4-001"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500">Must be unique, alphanumeric with hyphens or underscores</p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. WH-1000XM4 Wireless Headphones"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Brand <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Sony"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select type</option>
              <option value="Over-Ear">Over-Ear</option>
              <option value="On-Ear">On-Ear</option>
              <option value="In-Ear">In-Ear</option>
              <option value="Earbud">Earbud</option>
              <option value="True Wireless">True Wireless</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="e.g. 349.99"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="e.g. https://example.com/image.jpg"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          {/* Optional fields */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Average Rating (0-5)
            </label>
            <input
              type="number"
              name="averageRating"
              value={formData.averageRating}
              onChange={handleChange}
              placeholder="e.g. 4.7"
              step="0.1"
              min="0"
              max="5"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Sound Quality
            </label>
            <select
              name="soundQuality"
              value={formData.soundQuality}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select quality</option>
              <option value="Basic">Basic</option>
              <option value="Good">Good</option>
              <option value="High">High</option>
              <option value="Premium">Premium</option>
              <option value="Audiophile">Audiophile</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Comfort Rating (0-5)
            </label>
            <input
              type="number"
              name="comfortRating"
              value={formData.comfortRating}
              onChange={handleChange}
              placeholder="e.g. 4"
              min="0"
              max="5"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Design
            </label>
            <select
              name="design"
              value={formData.design}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select design</option>
              <option value="Traditional">Traditional</option>
              <option value="Modern">Modern</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Sporty">Sporty</option>
              <option value="Professional">Professional</option>
              <option value="Gaming">Gaming</option>
              <option value="Luxury">Luxury</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Weight (grams)
            </label>
            <input
              type="number"
              name="weightGrams"
              value={formData.weightGrams}
              onChange={handleChange}
              placeholder="e.g. 254.00"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="waterResistance"
              name="waterResistance"
              checked={formData.waterResistance}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="waterResistance" className="text-sm font-medium text-gray-700">
              Water Resistance
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="microphone"
              name="microphone"
              checked={formData.microphone}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="microphone" className="text-sm font-medium text-gray-700">
              Includes Microphone
            </label>
          </div>
          
          {/* Button row */}
          <div className="col-span-full flex justify-end space-x-3 mt-4">
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
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;