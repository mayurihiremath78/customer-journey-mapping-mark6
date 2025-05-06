import { useState, useEffect } from 'react';
import axios from 'axios';

interface StatsData {
  userCount: number;
  reviewCount: number;
  productCount: number;
  brandCount: number;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = 'http://localhost:5031';
const DUMMY_DATA = { userCount: 150, reviewCount: 2400, productCount: 450, brandCount: 120 };

export const useStats = (): StatsData => {
  const [stats, setStats] = useState<StatsData>({
    userCount: 0, reviewCount: 0, productCount: 0, brandCount: 0, loading: true, error: null
  });

  useEffect(() => {
    const fetchStats = async () => {
      let fetchedStats = { ...DUMMY_DATA };
      let hasError = false;
      let errorMessage = '';

      // Try Products endpoint
      try {
        console.log("Attempting to fetch products...");
        const productsResponse = await axios.get(`${API_BASE_URL}/api/Product`);
        console.log("Products response:", productsResponse);
        if (productsResponse.data && Array.isArray(productsResponse.data)) {
          fetchedStats.productCount = productsResponse.data.length;
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        hasError = true;
        errorMessage += "Products data unavailable. ";
      }

      // Try Users endpoint
      try {
        console.log("Attempting to fetch users...");
        const usersResponse = await axios.get(`${API_BASE_URL}/api/User`);
        console.log("Users response:", usersResponse);
        if (usersResponse.data && Array.isArray(usersResponse.data)) {
          fetchedStats.userCount = usersResponse.data.length;
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      
        
      }

      // Try Journeys/Reviews endpoint
      try {
        console.log("Attempting to fetch journeys...");
        const journeysResponse = await axios.get(`${API_BASE_URL}/api/Journey`);
        console.log("Journeys response:", journeysResponse);
        if (journeysResponse.data && Array.isArray(journeysResponse.data)) {
          fetchedStats.reviewCount = journeysResponse.data.length;
        }
      } catch (err) {
        console.error("Error fetching journeys:", err);
        hasError = true;
        errorMessage += "Journeys data unavailable. ";
        
        // Try alternative endpoint
        try {
          console.log("Trying alternative reviews endpoint...");
          const reviewsResponse = await axios.get(`${API_BASE_URL}/api/Review`);
          if (reviewsResponse.data && Array.isArray(reviewsResponse.data)) {
            fetchedStats.reviewCount = reviewsResponse.data.length;
            errorMessage = errorMessage.replace("Journeys data unavailable. ", "");
            hasError = errorMessage.length > 0;
          }
        } catch (altErr) {
          console.error("Alternative reviews endpoint also failed:", altErr);
        }
      }

      // Try Brands endpoint
      try {
        console.log("Attempting to fetch brands...");
        const brandsResponse = await axios.get(`${API_BASE_URL}/api/Brand`);
        console.log("Brands response:", brandsResponse);
        if (brandsResponse.data && Array.isArray(brandsResponse.data)) {
          fetchedStats.brandCount = brandsResponse.data.length;
        }
      } catch (err) {
        console.error("Error fetching brands:", err);
        hasError = true;
        errorMessage += "Brands data unavailable. ";
      }

      // Set final stats
      setStats({
        ...fetchedStats,
        loading: false,
        error: hasError ? errorMessage || 'Some data could not be loaded.' : null
      });
    };

    fetchStats();
  }, []);

  return stats;
};