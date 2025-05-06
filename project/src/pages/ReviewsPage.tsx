import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import ReviewCard from '../components/ui/ReviewCard';
import { Journey, Product, User } from '../types'; // Fixed import path

const ReviewsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const journeyId = searchParams.get('id');
  
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [expandedJourneyId, setExpandedJourneyId] = useState<number | null>(null);
  const [productDetails, setProductDetails] = useState<{[key: string]: Product}>({});
  const [userDetails, setUserDetails] = useState<{[key: number]: User}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const API_BASE_URL = 'http://localhost:5031';

  useEffect(() => {
    const fetchJourneys = async () => {
      try {
        setLoading(true);
        console.log('Fetching journeys from:', `${API_BASE_URL}/api/Journey`);
        const response = await axios.get(`${API_BASE_URL}/api/Journey`);
        
        console.log('Journeys response:', response.data);
        
        // Handle different response data structures
        let journeysData = [];
        if (Array.isArray(response.data)) {
          journeysData = response.data;
        } else if (response.data && Array.isArray(response.data.journeys)) {
          journeysData = response.data.journeys;
        } else if (response.data && typeof response.data === 'object') {
          console.log('Unexpected response format:', response.data);
          journeysData = Object.values(response.data);
        }
        
        if (journeysData.length > 0) {
          setJourneys(journeysData);
          
          // Prefetch all product details for the journeys
          const productIds = [...new Set(journeysData.map((j: Journey) => j.productId))];
          productIds.forEach(id => fetchProductDetails(id));
          
          // Fetch user details for all journeys
          const userIds = [...new Set(journeysData.map((j: Journey) => j.userId))];
          await Promise.all(userIds.map(id => fetchUserDetails(id)));
          
          if (journeyId) {
            const journeyIdNum = parseInt(journeyId);
            setExpandedJourneyId(journeyIdNum);
          }
        } else {
          console.log('No journey data available');
        }
      } catch (err: any) {
        console.error('Error fetching journeys:', err);
        setError(`Failed to load customer journeys: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchJourneys();
  }, [journeyId, API_BASE_URL]);

  const fetchProductDetails = async (productId: string | number) => {
    try {
      // Check if we already have the product details cached
      if (productDetails[productId]) return;
      
      console.log('Fetching product details for:', productId);
      const response = await axios.get(`${API_BASE_URL}/api/Product/${productId}`);
      console.log('Product response:', response.data);
      
      setProductDetails(prev => ({
        ...prev,
        [productId]: response.data
      }));
    } catch (err: any) {
      console.error('Error fetching product details:', err);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      // Check if we already have the user details cached
      if (userDetails[userId]) return;
      
      console.log('Fetching user details for:', userId);
      const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
      console.log('User response:', response.data);
      
      setUserDetails(prev => ({
        ...prev,
        [userId]: response.data
      }));
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      // If user fetching fails, create a placeholder to avoid repeated fetch attempts
     
    }
  };

  const toggleExpandJourney = (journeyId: number) => {
    if (expandedJourneyId === journeyId) {
      setExpandedJourneyId(null);
    } else {
      setExpandedJourneyId(journeyId);
    }
  };

  // Helper function to get user details for a journey
  const getUserForJourney = (journey: Journey): User => {
    // If we have user details for this journey's userId, use that
    if (userDetails[journey.userId]) {
      return userDetails[journey.userId];
    }
    
    // Otherwise use journey's data or defaults
    return {
      id: journey.userId,
      name: journey.customerName || 'Anonymous',
      email: journey.email || 'user@example.com',
      image: journey.userImage
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Customer Journeys</h1>
      <p className="text-gray-600 mb-8">Discover what our customers are saying about their experiences</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {journeys.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600 text-lg">No customer journeys available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journeys.map(journey => (
            <ReviewCard
              key={journey.id}
              journey={journey}
              product={productDetails[journey.productId]}
              user={getUserForJourney(journey)}
              isExpanded={expandedJourneyId === journey.id}
              toggleExpand={toggleExpandJourney}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsPage;