import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import NoJourneysUI from '../components/journey/NoJourneysUI';
import JourneysFoundUI from '../components/journey/JourneysFoundUI';

interface Journey {
  id: string;
  userId: number;
  productId: string;
  overallSatisfaction: number;
  review: string;
  currentStage: string;
  createdAt: string;
  updatedAt: string;
  awarenessSource: string;
  initialImpression: string;
  awarenessRating: number;
  alternativesConsidered: string;
  researchMethod_YouTube: boolean;
  researchMethod_TechBlogs: boolean;
  researchMethod_SocialMedia: boolean;
  researchMethod_FriendsFamily: boolean;
  researchMethod_InStore: boolean;
  keyFeature_SoundQuality: boolean;
  keyFeature_NoiseCancellation: boolean;
  keyFeature_BatteryLife: boolean;
  keyFeature_Comfort: boolean;
  keyFeature_Price: boolean;
  keyFeature_Brand: boolean;
  keyFeature_Design: boolean;
  purchaseLocation: string;
  decisionFactor: string;
  purchasePrice: number;
  usageFrequency: string;
  satisfaction: number;
  wouldRecommend: boolean;
  contactedSupport: boolean;
  contactReason: string;
  responseTime: string;
  issueResolved: boolean;
  supportSatisfaction: number;
  awarenessCompleted: boolean;
  considerationCompleted: boolean;
  purchaseCompleted: boolean;
  postPurchaseCompleted: boolean;
  supportCompleted: boolean;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  averageRating: number;
  type?: string;
}

interface User {
  email: string;
  id: number;
}

const API_BASE_URL = 'http://localhost:5031';

const UserPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userJourneys, setUserJourneys] = useState<Journey[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const loggedInUser = localStorage.getItem('user');
    
    if (!loggedInUser) {
      // Redirect to login if no user is logged in
      navigate('/login');
      return;
    }
    
    try {
      const userInfo = JSON.parse(loggedInUser);
      setUser(userInfo);
      
      // Fetch journeys by user's email instead of ID
      if (userInfo.email) {
        fetchUserJourneysByEmail(userInfo.email);
      } else {
        setError('User email not found in profile.');
        setLoading(false);
      }
      
      // Fetch products for journey details
      fetchProducts();
    } catch (err) {
      console.error('Error parsing user data', err);
      setError('Invalid user session. Please login again.');
      setLoading(false);
    }
  }, [navigate]);

  // Updated fetchUserJourneysByEmail function to filter by the current user's email
  const fetchUserJourneysByEmail = async (email: string) => {
    try {
      console.log(`Fetching journeys for user email: ${email}`);
      
      // First, try to get journeys directly filtered by email if your API supports it
      try {
        const response = await axios.get(`${API_BASE_URL}/api/Journey/byEmail/${encodeURIComponent(email)}`);
        console.log('Journeys received by email endpoint:', response.data);
        setUserJourneys(response.data);
        setLoading(false);
        return;
      } catch (emailErr) {
        console.log('Email endpoint not found, falling back to filtering all journeys');
      }
      
      
      // If direct email endpoint fails, get all journeys and filter them
      const response = await axios.get(`${API_BASE_URL}/api/Journey`);
      console.log('All journeys received:', response.data);
      
      if (Array.isArray(response.data)) {
        // Filter journeys for the current user based on different criteria
        const filteredJourneys = response.data.filter(journey => {
          // 1. Try to match by email if your journeys have a userEmail field
          if (journey.userEmail && journey.userEmail.toLowerCase() === email.toLowerCase()) {
            return true;
          }
          
          // 2. Try to match by user ID from the logged-in user info
          const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
          if (userInfo.id && journey.userId === userInfo.id) {
            return true;
          }
          
          // 3. For testing or if the database uses a fixed userId for all users' journeys
          // Remove this in production as it will show all journeys with userId = 1
          // if (journey.userId === 1) {
          //   return true;
          // }
          
          return false;
        });
        
        console.log('Filtered journeys for current user:', filteredJourneys);
        setUserJourneys(filteredJourneys);
        setLoading(false);
      } else {
        setError('Invalid response format from API.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching user journeys:', err);
      setError('Failed to load your journeys. Please try again later.');
      setLoading(false);
    }
  };

  // Update the fetchProducts function to handle errors gracefully
  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await axios.get(`${API_BASE_URL}/api/Products`);
      console.log('Products response:', response.data);
      
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        console.warn('Products response is not an array:', response.data);
        setProducts([]);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Set empty array instead of failing
      setProducts([]);
    
    }
  };

  const handleDeleteJourney = async (journeyId: string) => {
    if (!window.confirm("Are you sure you want to delete this journey?")) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE_URL}/api/Journey/${journeyId}`);
      if (user) {
        // Use email-based fetch after deletion
        fetchUserJourneysByEmail(user.email);
      }
    } catch (err) {
      console.error('Error deleting journey:', err);
      alert('Failed to delete journey');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Account</h1>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Information</h2>
        <div>
          <p className="text-gray-600">Email:</p>
          <p className="font-medium">{user?.email}</p>
        </div>
      </div>
      
      {/* My Journeys Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">My Product Journeys</h2>
        {userJourneys.length === 0 ? (
          <NoJourneysUI />
        ) : (
          <JourneysFoundUI 
            userJourneys={userJourneys}
            products={products}
            handleDeleteJourney={handleDeleteJourney}
          />
        )}
      </div>
    </div>
  );
};

export default UserPage;