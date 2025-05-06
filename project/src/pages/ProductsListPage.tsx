import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, PlusCircle } from 'lucide-react';
import ProductsGrid, { Product } from '../components/products/ProductsGrid';
import Button from '../components/ui/Button';
import ProductForm from '../components/products/ProductForm';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5031';

const ProductsListPage: React.FC = () => {
  const navigate = useNavigate();
  
  // State management
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name-asc');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // Get all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/Product`);
        
        if (response.data && Array.isArray(response.data)) {
          setAllProducts(response.data);
        } else {
          setError('Invalid data format received from API');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Extract unique brands and types for filter dropdowns
  const brandOptions = Array.from(new Set(allProducts.map(p => p.brand))).sort();
  const typeOptions = Array.from(new Set(allProducts.map(p => p.type))).sort();
  
  // Filter products based on search query and filters
  const filteredProducts = allProducts.filter(product => {
    // Search query filter
    const matchesSearch = 
      searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Brand filter
    const matchesBrand = filterBrand === '' || product.brand === filterBrand;
    
    // Type filter
    const matchesType = filterType === '' || product.type === filterType;
    
    return matchesSearch && matchesBrand && matchesType;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating-desc':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });
  
  // Handle product selection
  const handleProductSelect = (product: Product) => {
    navigate(`/product/${product.id}`);
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSortOption('name-asc');
    setFilterBrand('');
    setFilterType('');
  };
  
  // Handle form submission for adding a new product
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/Product`, productData);
      console.log('Product added:', response.data);
      
      // Add the new product to the list
      if (response.data && response.data.id) {
        setAllProducts([...allProducts, response.data]);
      }
      
      // Hide the form
      setShowAddForm(false);
      
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header with title and Add Product button */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Earphones</h1>
              <p className="text-lg text-gray-600">
                Browse our collection of earphones and headphones from top brands
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="primary"
                size="md"
                icon={<PlusCircle size={18} />}
                onClick={() => setShowAddForm(true)}
              >
                Add Product
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {/* Product Form Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <ProductForm 
                    onSubmit={handleAddProduct}
                    onCancel={() => setShowAddForm(false)}
                    existingBrands={brandOptions}
                    existingTypes={typeOptions}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Search and Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Brand Filter */}
              <div>
                <select
                  className="px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value="">All Brands</option>
                  {brandOptions.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              
              {/* Type Filter */}
              <div>
                <select
                  className="px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Sort */}
              <div>
                <select
                  className="px-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                  <option value="price-asc">Price (Low to High)</option>
                  <option value="price-desc">Price (High to Low)</option>
                  <option value="rating-desc">Highest Rated</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          {/* Products Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <>
              {sortedProducts.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <p className="text-lg text-gray-600 mb-4">No products found matching your filters.</p>
                  <Button 
                    variant="outline" 
                    onClick={handleResetFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <ProductCard
                        product={product}
                        onClick={() => handleProductSelect(product)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsListPage;