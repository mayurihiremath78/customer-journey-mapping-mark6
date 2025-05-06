import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/products/ProductForm';
import BrandForm from '../components/products/BrandForm';
import StatsCard from '../components/ui/StatsCard';
import axios from 'axios';

interface User {
  id: string;
  name: string;
}

interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
}

interface BrandStats {
  brand: string;
  averageRating: number;
  topProduct: {
    id: string;
    name: string;
    rating: number;
  };
}

// Dummy data for development and testing


function AdminPage() {
  const [userCount, setUserCount] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [brandStats, setBrandStats] = useState<BrandStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isProductFormOpen, setIsProductFormOpen] = useState<boolean>(false);
  const [isBrandFormOpen, setIsBrandFormOpen] = useState<boolean>(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Set the API base URL
      const API_BASE_URL = 'http://localhost:5031'; // Update this to match your backend URL
      
      // Using axios for consistency with your other components
      // Fetch user count directly from your User API
      try {
        const usersResponse = await axios.get(`http://localhost:5031/api/Users`);
        const users= usersResponse.data;
        setUserCount(users.length );
        console.log('Users response:', usersResponse.data);
        console.log(`Loaded ${users.length} Users Count`);
       
      } catch (err) {
        console.error('Error fetching users:', err);
        setUserCount(0);
      }
      
      // Similar approach for review count
      try {
        const reviewsResponse = await axios.get(`${API_BASE_URL}/api/journey`);
        const reviews = reviewsResponse.data;
        setReviewCount(reviews.length);
        console.log(`Loaded ${reviews.length} reviews`);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        
      }
      
      // Get products count
      try {
        const productsResponse = await axios.get(`${API_BASE_URL}/api/Product`);
        const products = productsResponse.data;
        setProductCount(products.length);
        console.log(`Loaded ${products.length} products`);
        
        // Optionally, calculate brand stats from products if you have that data
        if (products.length > 0) {
          calculateBrandStats(products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
       
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please try again later.');
      
      // Fall back to dummy data on error
      
    } finally {
      setLoading(false);
    }
  };

  // Add this helper function to calculate brand stats from products
  const calculateBrandStats = (products: any[]) => {
    // Group products by brand
    const brandGroups = products.reduce((groups: Record<string, any[]>, product) => {
      const brand = product.brand;
      if (!groups[brand]) {
        groups[brand] = [];
      }
      groups[brand].push(product);
      return groups;
    }, {});
    
    // Calculate stats for each brand
    const stats: BrandStats[] = Object.entries(brandGroups).map(([brand, products]) => {
      // Calculate average rating
      const totalRating = products.reduce((sum, product) => sum + (product.averageRating || 0), 0);
      const averageRating = products.length > 0 ? totalRating / products.length : 0;
      
      // Find top rated product
      const topProduct = [...products].sort((a, b) => 
        (b.averageRating || 0) - (a.averageRating || 0)
      )[0];
      
      return {
        brand,
        averageRating: parseFloat(averageRating.toFixed(1)),
        topProduct: {
          id: topProduct.id,
          name: topProduct.name,
          rating: topProduct.averageRating || 0
        }
      };
    });
    
    // Sort by average rating descending
    stats.sort((a, b) => b.averageRating - a.averageRating);
    
    // Take top 5 or all if fewer
    setBrandStats(stats.slice(0, 5));
    console.log(`Generated stats for ${stats.length} brands`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProductSuccess = () => {
    fetchData();
    setFormSuccess('Product added successfully!');
    setTimeout(() => setFormSuccess(null), 3000);
  };

  const handleAddBrandSuccess = () => {
    fetchData();
    setFormSuccess('Brand added successfully!');
    setTimeout(() => setFormSuccess(null), 3000);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      
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
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          value={loading ? "..." : userCount} 
          label="Users" 
          variant="light"
        />
        
        <StatsCard 
          value={loading ? "..." : reviewCount} 
          label="Reviews" 
          onClick={() => handleNavigation("/reviews")}
          variant="light"
        />
        
        <StatsCard 
          value={loading ? "..." : productCount} 
          label="Products" 
          onClick={() => handleNavigation("/admin")}
          variant="light"
        />
        
        <StatsCard 
          value={loading ? "..." : brandStats.length} 
          label="Brands" 
          onClick={() => handleNavigation("/brands")}
          variant="light"
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-medium text-gray-700 mb-3">Brand Analysis</h2>
        <p className="text-gray-500 mb-5">Showing top products by brand based on average customer ratings</p>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {brandStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No brand statistics available</div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Brand</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Avg. Rating</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Top Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Product Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {brandStats.map((stat, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-3 px-4 border-b border-gray-100">{stat.brand}</td>
                      <td className="py-3 px-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">{stat.averageRating}</span>
                          <span className="text-sm">
                            {Array(5).fill(0).map((_, i) => (
                              <span key={i} className={i < Math.round(stat.averageRating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                            ))}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-100">{stat.topProduct.name}</td>
                      <td className="py-3 px-4 border-b border-gray-100">
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">{stat.topProduct.rating}</span>
                          <span className="text-sm">
                            {Array(5).fill(0).map((_, i) => (
                              <span key={i} className={i < Math.round(stat.topProduct.rating) ? "text-yellow-400" : "text-gray-300"}>★</span>
                            ))}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <ProductForm 
        isOpen={isProductFormOpen} 
        onClose={() => setIsProductFormOpen(false)}
        onSuccess={handleAddProductSuccess}
      />

      {/* Brand Form Modal */}
      <BrandForm
        isOpen={isBrandFormOpen}
        onClose={() => setIsBrandFormOpen(false)}
        onSuccess={handleAddBrandSuccess}
      />
    </div>
  );
}

export default AdminPage;