import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductForm from '../products/ProductForm';
import ProductJourneyDashboard from './ProductJourneyDashboard';

interface Product {
  id: string;
  name: string;
  brand: string | { id: string; name: string };
  price: number;
  description?: string;
  imageUrl?: string;
}

function BrandProductsPage() {
  const { brandId } = useParams<{ brandId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const brandName = location.state?.brandName || 'Brand';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState<boolean>(false);

  const API_BASE_URL = 'http://localhost:5031';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_BASE_URL}/api/Product`);

      if (Array.isArray(response.data)) {
        const filteredProducts = response.data.filter((product: Product) => {
            const productBrandName =
              typeof product.brand === 'string'
                ? product.brand
                : (product.brand as { name: string })?.name;
          
            return (
              productBrandName?.toLowerCase().trim() === brandName.toLowerCase().trim()
            );
          });

          console.log(filteredProducts);
          setProducts(filteredProducts);
       
      } else {
        setError('Unexpected API data format.');
        setProducts([]);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(`Failed to load products: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [brandName]);

  const handleAddProductSuccess = () => {
    fetchProducts();
    setFormSuccess('Product added successfully!');
    setTimeout(() => setFormSuccess(null), 3000);
    setIsProductFormOpen(false);
  };

  const handleBack = () => {
    // If dashboard is showing, go back to product list view
    if (showDashboard) {
      setShowDashboard(false);
      setSelectedProductId(null);
      setSelectedProductName('');
    } else {
      // Otherwise navigate back to brands page
      navigate('/brands');
    }
  };

  // Handle clicking on a product
  const handleProductClick = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedProductName(product.name);
    setShowDashboard(true);
    
    // Scroll to top for better UX
    window.scrollTo(0, 0);
  };

  // Get the proper page title based on current view
  const getPageTitle = () => {
    if (showDashboard && selectedProductName) {
      return `${selectedProductName} - Customer Journey Insights`;
    }
    return `${brandName} Products`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center mb-4">
        <button 
          onClick={handleBack} 
          className="mr-3 p-2 hover:bg-gray-100 rounded-md flex items-center text-gray-700"
        >
          <span className="mr-1">←</span> 
          {showDashboard ? 'Back to Products' : 'Back to Brands'}
        </button>
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
          {!showDashboard && (
            <button
              onClick={() => setIsProductFormOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Product
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      {formSuccess && (
        <div className="bg-green-50 text-green-600 p-4 rounded-md mb-6 border border-green-200">
          {formSuccess}
        </div>
      )}

      {/* Show Journey Dashboard if a product is selected */}
      {showDashboard && selectedProductId ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <ProductJourneyDashboard productId={selectedProductId} />
        </div>
      ) : (
        // Otherwise show products list
        loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                No products found for {brandName}. Click "Add Product" to create one.
              </div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                  onClick={() => handleProductClick(product)}
                >
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 w-full h-48 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                    <p className="text-blue-600 font-medium mt-1">₹{product.price.toFixed(2)}</p>
                    {product.description && (
                      <p className="text-gray-600 text-sm mt-2 line-clamp-3">{product.description}</p>
                    )}
                    <div className="flex items-center mt-3 text-blue-500 text-sm">
                      <span className="mr-1">View insights</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      )}

      <ProductForm
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        onSuccess={handleAddProductSuccess}
        preselectedBrand={brandId}
        preselectedBrandName={brandName}
      />
    </div>
  );
}

export default BrandProductsPage;
