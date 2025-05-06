import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ui/ProductCard';
import JourneySteps from '../components/journey/JourneySteps';
import JourneyForm from '../components/journey/JourneyForm';
import Button from '../components/ui/Button';
import { mockProducts } from '../data/mockData';

const API_BASE_URL = 'http://localhost:5031';

const JourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  
  // Add state for user ID
  const [userId, setUserId] = useState<number>(0);
  
  // Get the user ID from localStorage on component mount
  useEffect(() => {
    const getUserId = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser && parsedUser.id) {
            // Make sure to convert string ID to number if needed
            const id = typeof parsedUser.id === 'string' 
              ? parseInt(parsedUser.id, 10) 
              : parsedUser.id;
            
            console.log('Retrieved user ID from localStorage:', id);
            setUserId(id);
            return id;
          }
        }
        // Fallback if no user data found
        console.warn('No user ID found in localStorage, using default');
        return 0;
      } catch (error) {
        console.error('Error getting user ID:', error);
        return 0;
      }
    };
    
    getUserId();
  }, []);

  // State management
  const [step, setStep] = useState<'select-product' | 'journey'>(
    productId ? 'journey' : 'select-product'
  );
  const [selectedProduct, setSelectedProduct] = useState<string | null>(productId || null);
  const [currentStage, setCurrentStage] = useState<string>('awareness');
  const [journeyData, setJourneyData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>(mockProducts);
  
  // For tracking completed stages (only in UI, not saving to DB yet)
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  
  // Fetch products from API for the selection page
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/Product`);
        if (response.data && response.data.length > 0) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fall back to mock data
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Handle product selection
  const handleProductSelect = (id: string) => {
    console.log('Selected product:', id);
    setSelectedProduct(id);
  };
  
  // Move from product selection to journey mapping
  const handleStartJourney = () => {
    if (!selectedProduct) return;
    
    console.log('Starting journey with product:', selectedProduct);
    setStep('journey');
    
    // Update URL for deep linking
    navigate(`/journey/${selectedProduct}`, { replace: true });
  };
  
  // Handle step change in the journey stepper
  const handleStepChange = (stepName: string) => {
    console.log('Changing step to:', stepName);
    setCurrentStage(stepName);
  };
  
  // Handle form submission for each stage
  const handleStageSubmit = async (data: Record<string, any>) => {
    console.log('Form submitted for stage:', currentStage, 'with data:', data);
    
    try {
      setLoading(true);
      setError(null);
      
      // For the final stage, submit all data immediately with the current form data
      if (currentStage === 'support') {
        console.log('Final stage - proceeding to submit complete journey with current form data:', data);
        
        // Call submitCompleteJourney directly with the form data instead of relying on state
        await submitCompleteJourney(data);
        
        // After successful submission, navigate to compare page
        navigate('/');
        return;
      }
      
      // For non-final stages, update the journey data state
      setJourneyData(prev => {
        const updatedData = {
          ...prev,
          [`${currentStage}Data`]: data // Store each stage's data separately
        };
        
        console.log('Updated journey data:', updatedData);
        return updatedData;
      });
      
      // Mark this stage as completed
      if (!completedStages.includes(currentStage)) {
        setCompletedStages(prev => [...prev, currentStage]);
      }
      
      // Move to the next stage
      const steps = ['awareness', 'consideration', 'purchase', 'postPurchase', 'support'];
      const currentIndex = steps.indexOf(currentStage);
      
      if (currentIndex < steps.length - 1) {
        // Not the final step - just go to next step
        const nextStage = steps[currentIndex + 1];
        console.log('Moving to next stage:', nextStage);
        setCurrentStage(nextStage);
      }
    } catch (error: any) {
      console.error('Error handling stage submit:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        setError(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response from server. Check your connection.');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Function to submit the complete journey data to the API - modified to accept currentFormData
  const submitCompleteJourney = async (currentSupportData?: Record<string, any>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract stage-specific data from state
      const awarenessData = journeyData.awarenessData || {};
      const considerationData = journeyData.considerationData || {};
      const purchaseData = journeyData.purchaseData || {};
      const postPurchaseData = journeyData.postPurchaseData || {};
      
      // Use currentSupportData if provided (from the form), otherwise use state
      const supportData = currentSupportData || journeyData.supportData || {};
      
      console.log('Support data being used for submission:', supportData);
      console.log('Using user ID for submission:', userId);
      
      // Check if review exists
      if (!supportData.review) {
        setError('Please provide a review before submitting');
        return;
      }
      
      // Create data object matching exactly the format required by the API
      const completeData = {
        // Base required fields
        id: "", // Let API generate this
        productId: selectedProduct,
        userId: userId, // Use the user ID from state
        currentStage: "support",
        
        // IMPORTANT - Set review field explicitly
        review: supportData.review?.trim() || "",
        userReview: supportData.review?.trim() || "", // For API compatibility
        
        // Make sure overallSatisfaction is a number
        overallSatisfaction: supportData.overallSatisfaction ? 
          Number(supportData.overallSatisfaction) : 0,
        
        // Stage flags
        awarenessCompleted: true,
        considerationCompleted: true,
        purchaseCompleted: true,
        postPurchaseCompleted: true,
        supportCompleted: true,
        
        // Other fields with proper formatting
        awarenessSource: awarenessData.awarenessSource || "",
        initialImpression: awarenessData.initialImpression || "",
        awarenessRating: awarenessData.awarenessRating ? 
          parseInt(awarenessData.awarenessRating, 10) : 0,
        alternativesConsidered: considerationData.alternativesConsidered || "",
        
        // Boolean fields
        researchMethod_YouTube: Boolean(considerationData.researchMethod_YouTube),
        researchMethod_TechBlogs: Boolean(considerationData.researchMethod_TechBlogs),
        researchMethod_SocialMedia: Boolean(considerationData.researchMethod_SocialMedia),
        researchMethod_FriendsFamily: Boolean(considerationData.researchMethod_FriendsFamily),
        researchMethod_InStore: Boolean(considerationData.researchMethod_InStore),
        keyFeature_SoundQuality: Boolean(considerationData.keyFeature_SoundQuality),
        keyFeature_NoiseCancellation: Boolean(considerationData.keyFeature_NoiseCancellation),
        keyFeature_BatteryLife: Boolean(considerationData.keyFeature_BatteryLife),
        keyFeature_Comfort: Boolean(considerationData.keyFeature_Comfort),
        keyFeature_Price: Boolean(considerationData.keyFeature_Price),
        keyFeature_Brand: Boolean(considerationData.keyFeature_Brand),
        keyFeature_Design: Boolean(considerationData.keyFeature_Design),
        
        // Other stages data
        purchaseLocation: purchaseData.purchaseLocation || "",
        decisionFactor: purchaseData.decisionFactor || "",
        purchasePrice: purchaseData.purchasePrice ? 
          parseFloat(purchaseData.purchasePrice) : 0,
        usageFrequency: postPurchaseData.usageFrequency || "",
        satisfaction: postPurchaseData.satisfaction ? 
          parseInt(postPurchaseData.satisfaction, 10) : 0,
        wouldRecommend: Boolean(postPurchaseData.wouldRecommend),
        
        // Support stage data
        contactedSupport: Boolean(supportData.contactedSupport),
        contactReason: supportData.contactReason || "",
        responseTime: supportData.responseTime || "",
        issueResolved: supportData.issueResolved !== undefined ? 
          Boolean(supportData.issueResolved) : false,
        supportSatisfaction: supportData.supportSatisfaction ? 
          parseInt(supportData.supportSatisfaction, 10) : 0
      };
      
      console.log('Review being sent to API:', completeData.review);
      console.log('Full data being sent to API:', completeData);
      
      // Create new journey with all data
      const url = `${API_BASE_URL}/api/Journey`;
      console.log('Making POST request to:', url);
      
      const response = await axios.post(url, completeData);
      
      console.log('Journey saved successfully, response status:', response.status);
      console.log('Journey saved successfully, response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Error submitting complete journey:', error);
      
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        setError(`Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response from server. Check your connection.');
      } else {
        console.error('Error message:', error.message);
        setError(`Error: ${error.message}`);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Handle back navigation
  const handleBack = () => {
    if (step === 'journey') {
      const steps = ['awareness', 'consideration', 'purchase', 'postPurchase', 'support'];
      const currentIndex = steps.indexOf(currentStage);
      
      if (currentIndex > 0) {
        // Go to previous journey stage
        setCurrentStage(steps[currentIndex - 1]);
      } else {
        // Go back to product selection
        setStep('select-product');
        navigate('/journey', { replace: true });
      }
    }
  };
  
  // Get the selected product data
  const product = selectedProduct
    ? products.find(p => p.id === selectedProduct) || mockProducts.find(p => p.id === selectedProduct)
    : null;
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-8 md:pt-12 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Map Your Earphone Journey</h1>
          <p className="text-lg text-gray-600 mb-8">
            Share your experience with earphones to help others make better decisions
          </p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-md mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {step === 'select-product' ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Step 1: Select your earphones
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={selectedProduct === product.id}
                    onSelect={() => handleProductSelect(product.id)}
                  />
                ))}
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  disabled={!selectedProduct}
                  onClick={handleStartJourney}
                >
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Step 2: Map your journey with {product?.name}
                </h2>
                
                <JourneySteps
                  currentStep={currentStage}
                  onStepChange={handleStepChange}
                  completedSteps={completedStages}
                />
              </div>
              
              {product && (
                <JourneyForm
                  stage={currentStage}
                  product={product}
                  productId={product.id}
                  userId={userId} // Pass the actual user ID here
                  initialData={journeyData[`${currentStage}Data`] || {}}
                  onSubmit={handleStageSubmit}
                  onBack={handleBack}
                  isFinalStage={currentStage === 'support'}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JourneyPage;