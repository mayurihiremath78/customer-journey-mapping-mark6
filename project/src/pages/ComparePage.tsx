import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import JourneyMapChart from '../components/chart/JourneyMapChart';
import Button from '../components/ui/Button';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  averageRating: number;
  type: string;
  soundQuality?: string;
  comfortRating?: number;
  design?: string;
  waterResistance: boolean;
  microphone: boolean;
  weightGrams?: number;
}

const API_BASE_URL = 'http://localhost:5031';

const ComparePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);


  // Only fetch products once when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/Product`);
        setProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductSelect = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      if (selectedProducts.length < 2) {
        setSelectedProducts([...selectedProducts, productId]);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedProductsData = products.filter(product =>
    selectedProducts.includes(product.id)
  );

  // Sample journey data - you might want to fetch this from an API
  const journeyStagesData = [
    { name: 'Awareness', apple: 85, sony: 70, bose: 60, sennheiser: 40 },
    { name: 'Consideration', apple: 75, sony: 80, bose: 65, sennheiser: 50 },
    { name: 'Purchase', apple: 65, sony: 60, bose: 50, sennheiser: 30 },
    { name: 'Post-Purchase', apple: 60, sony: 55, bose: 45, sennheiser: 25 },
    { name: 'Support', apple: 30, sony: 25, bose: 20, sennheiser: 15 },
  ];

  const getJourneyDataForSelectedProducts = () => {
    if (selectedProductsData.length === 0) {
      return journeyStagesData;
    }

    return journeyStagesData.map(stage => {
      const filteredStage: any = { name: stage.name };

      selectedProductsData.forEach(product => {
        const brandKey = product.brand.toLowerCase();

        if (stage[brandKey] !== undefined) {
          filteredStage[product.name] = stage[brandKey];
        } else {
          const seed = product.id.charCodeAt(0);
          const randomValue = 30 + (seed % 50);
          filteredStage[product.name] = randomValue;
        }
      });

      return filteredStage;
    });
  };

  const filteredJourneyData = getJourneyDataForSelectedProducts();

  return (
    <div className="min-h-screen bg-gray-50 pt-8 md:pt-12 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Compare Products</h1>
          <p className="text-lg text-gray-600 mb-8">Select up to 2 products for detailed comparison.</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Product Selection */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-800">Select Products</h2>
                </CardHeader>
                <CardContent>
                  {/* Search Bar */}
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 mb-4 border rounded-md"
                  />

                  {loading ? (
                    <div className="text-center py-4">Loading products...</div>
                  ) : (
                    <div className="space-y-2">
                      {filteredProducts.map(product => {
                        const isSelected = selectedProducts.includes(product.id);
                        const isDisabled = !isSelected && selectedProducts.length >= 2;

                        return (
                          <div
                            key={product.id}
                            className={`flex items-center p-3 rounded-md cursor-pointer transition-colors
                              ${isSelected
                                ? 'bg-indigo-50 border border-indigo-200'
                                : isDisabled
                                  ? 'bg-gray-100 border border-gray-200 cursor-not-allowed'
                                  : 'bg-white border border-gray-200 hover:bg-gray-50'
                              }
                            `}
                            onClick={() => !isDisabled && handleProductSelect(product.id)}
                          >
                            <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                            <div>
                              <h3 className="font-medium text-gray-900">{product.name}</h3>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Comparison Section */}
            <div className="lg:col-span-9 space-y-6">
              {selectedProducts.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Select products to compare</h3>
                  <p className="text-gray-600">Choose up to 2 products to see specifications and journey data.</p>
                </div>
              ) : (
                <>
                  {/* Selected Products */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold text-gray-800">Selected Products</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProductsData.map(product => (
                          <div key={product.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                            <div>
                              <h3 className="font-semibold text-gray-900">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.brand}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Specification Comparison */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold text-gray-800">Specifications Comparison</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 text-gray-600 font-medium">Specification</th>
                              {selectedProductsData.map(product => (
                                <th key={product.id} className="p-2 text-gray-800">{product.name}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Brand</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.brand}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Type</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.type}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Sound Quality</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.soundQuality || 'N/A'}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Comfort Rating</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.comfortRating || 'N/A'}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Design</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.design || 'N/A'}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Water Resistance</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.waterResistance ? 'Yes' : 'No'}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Microphone</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.microphone ? 'Yes' : 'No'}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Weight</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">{product.weightGrams ? `${product.weightGrams}g` : 'N/A'}</td>
                              ))}
                            </tr>
                            <tr>
                              <td className="p-2 font-medium text-gray-600">Price</td>
                              {selectedProductsData.map(product => (
                                <td key={product.id} className="p-2">₹{product.price}</td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Reviews */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold text-gray-800">Customer Reviews</h2>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedProductsData.map(product => (
                          <div key={product.id} className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-gray-900">{product.name}</h3>
                            <p className="text-sm text-yellow-500 mt-2">
                              ⭐ {product.averageRating ? product.averageRating.toFixed(1) : 'N/A'} / 5.0
                            </p>
                            {/* You may want to fetch actual reviews from an API */}
                            <p className="text-sm text-gray-600 mt-2">No reviews available</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Journey Map and Insights */}
                  <Card>
                    <CardHeader>
                      <h2 className="text-lg font-semibold text-gray-800">Customer Journey Map</h2>
                    </CardHeader>
                    <CardContent>
                      <JourneyMapChart 
                        data={filteredJourneyData} 
                        title="Customer Journey Flow" 
                        height={300} 
                      />
                    </CardContent>
                  </Card>

                  
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparePage;