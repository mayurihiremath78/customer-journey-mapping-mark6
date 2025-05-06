import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BrandForm from '../products/BrandForm';


interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  yearFounded?: number;
}

function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBrandFormOpen, setIsBrandFormOpen] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = 'http://localhost:5031';

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching brands from:', `${API_BASE_URL}/api/Brand`);
      
      const response = await axios.get(`${API_BASE_URL}/api/Brand`);
      console.log('Brands API response:', response);
      
      // Check if the response data is an array
      if (Array.isArray(response.data)) {
        setBrands(response.data);
        console.log(`Loaded ${response.data.length} brands`);
      } else if (response.data && typeof response.data === 'object') {
        // If the response is an object with brands nested inside
        // This handles cases where API returns { brands: [...] } instead of directly [...]
        const brandsArray = response.data.brands || response.data.items || response.data.data || [];
        setBrands(brandsArray);
        console.log(`Loaded ${brandsArray.length} brands from nested object`);
      } else {
        // If response is not in expected format
        console.error('Unexpected API response format:', response.data);
        setError('Received unexpected data format from the server');
        setBrands([]);
      }
    } catch (err: any) {
      console.error('Error fetching brands:', err);
      setError(`Failed to load brands: ${err.message || 'Unknown error'}`);
      setBrands([]);
      
      // For debugging - show detailed error info in console
      if (err.response) {
        console.error('Error response:', err.response.status, err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleAddBrandSuccess = () => {
    fetchBrands();
    setFormSuccess('Brand added successfully!');
    setTimeout(() => setFormSuccess(null), 3000);
    setIsBrandFormOpen(false);
  };

  const handleBrandClick = (brandId: string, brandName: string) => {
    navigate(`/brands/${brandId}`, { state: { brandName } });
  };

   const handleBack = () => {
      navigate('/admin');
  };


  // Function to get a color based on the first letter of the brand name
  const getBrandColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-pink-500', 
      'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-emerald-500'
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Function to get initials from brand name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-8 lg:p-12">
      {/* Header with animated gradient */}
      <div className="relative mb-12 pb-10 overflow-hidden">
        
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 opacity-50 animate-gradient"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Brand Collection
              </h1>
              <p className="mt-2 text-gray-600 max-w-xl">
                Explore our curated collection of brands offering premium audio products and electronics.
              </p>
            </div>
           
            <button 
              onClick={() => setIsBrandFormOpen(true)}
              className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Brand
            </button>
             
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 transform transition-all animate-fade-in">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg shadow-md flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {formSuccess && (
        <div className="max-w-7xl mx-auto mb-6 transform transition-all animate-fade-in">
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-5 rounded-lg shadow-md flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{formSuccess}</span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-7xl mx-auto">

      <button 
          onClick={handleBack} 
          className="mr-3 p-2 hover:bg-gray-100 rounded-md flex items-center text-gray-700"
        >Back</button>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading brands...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {brands.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-600">No brands found</h3>
                <p className="mt-1 text-gray-500 text-center max-w-xs">
                  Get started by adding your first brand to the collection
                </p>
                <button 
                  onClick={() => setIsBrandFormOpen(true)}
                  className="mt-6 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Brand
                </button>
              </div>
            ) : (
              brands.map(brand => (
                <div
                  key={brand.id}
                  onClick={() => handleBrandClick(brand.id, brand.name)}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Brand Logo or Default Avatar */}
                  <div className="h-40 flex items-center justify-center overflow-hidden bg-gray-50 border-b">
                    {brand.logoUrl ? (
                      <img 
                        src={brand.logoUrl} 
                        alt={`${brand.name} logo`}
                        className="h-32 w-auto object-contain p-4" 
                      />
                    ) : (
                      <div className={`flex items-center justify-center w-20 h-20 rounded-full ${getBrandColor(brand.name)} text-white text-xl font-bold`}>
                        {getInitials(brand.name)}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {brand.name}
                    </h3>
                    
                    {brand.yearFounded && (
                      <p className="text-sm text-gray-500 mt-1">
                        Est. {brand.yearFounded}
                      </p>
                    )}
                    
                    {brand.description && (
                      <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                    
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                      <span>View products</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <BrandForm
        isOpen={isBrandFormOpen}
        onClose={() => setIsBrandFormOpen(false)}
        onSuccess={handleAddBrandSuccess}
      />
    </div>
  );
}

export default BrandsPage;