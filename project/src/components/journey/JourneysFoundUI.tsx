import React from 'react';
import { useNavigate } from 'react-router-dom';

// Add Product interface
interface Product {
  id: string;
  name: string;
  brand?: string;
  type?: string;
  imageUrl?: string;
}

// Need to include Journey interface here or import it
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

// Update props interface to include products
interface JourneysFoundUIProps {
  userJourneys: Journey[];
  products: Product[]; // Add this line
  handleDeleteJourney: (journeyId: string) => void;
}

// Update component to accept products prop
const JourneysFoundUI: React.FC<JourneysFoundUIProps> = ({ userJourneys, products, handleDeleteJourney }) => {
  const navigate = useNavigate();
  
  // Add helper function to get product name
  const getProductName = (productId: string): string => {
    const product = products.find(p => p.id === productId);
    return product?.name || `Product ${productId}`;
  };
  
  // Helper function to get stage label
  const getStageLabel = (stage: string) => {
    const labels: {[key: string]: string} = {
      'awareness': 'Awareness',
      'consideration': 'Consideration',
      'purchase': 'Purchase',
      'postPurchase': 'Post-Purchase',
      'support': 'Support'
    };
    return labels[stage] || stage;
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {userJourneys.map((journey) => {
          // Get the product name for the current journey
          const productName = getProductName(journey.productId);
          
          return (
            <div key={journey.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              {/* Product Header - UPDATED to show product name */}
              <div className="bg-gray-50 p-4">
                <h3 className="font-semibold text-lg">
                 Product Name: {productName}
                </h3>
                <div className="flex mt-1 text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>{star <= journey.overallSatisfaction ? '★' : '☆'}</span>
                  ))}
                  <span className="text-gray-700 ml-2 text-sm">
                    {journey.overallSatisfaction}/5 Overall Satisfaction
                  </span>
                </div>
              </div>

              {/* Journey Content */}
              <div className="p-6">
                {/* Journey Progress */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Journey Progress</h4>
                  <div className="flex flex-wrap gap-2">
                    {['awareness', 'consideration', 'purchase', 'postPurchase', 'support'].map(stage => {
                      const isCompleted = journey[`${stage}Completed` as keyof typeof journey] as boolean;
                      const isCurrent = journey.currentStage === stage;
                      return (
                        <div 
                          key={stage} 
                          className={`px-2 py-1 text-xs rounded-full ${
                            isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : isCurrent 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {getStageLabel(stage)}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Key Journey Details */}
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    {/* Awareness Details */}
                    {journey.awarenessSource && (
                      <div>
                        <h5 className="text-xs text-gray-500 mb-0.5">How did you discover it?</h5>
                        <p className="text-sm text-gray-800">{journey.awarenessSource}</p>
                      </div>
                    )}
                    
                    {/* Purchase Details */}
                    {journey.purchaseLocation && (
                      <div>
                        <h5 className="text-xs text-gray-500 mb-0.5">Where purchased</h5>
                        <p className="text-sm text-gray-800">{journey.purchaseLocation}</p>
                      </div>
                    )}
                    
                    {/* Price if available */}
                    {journey.purchasePrice > 0 && (
                      <div>
                        <h5 className="text-xs text-gray-500 mb-0.5">Price paid</h5>
                        <p className="text-sm text-gray-800">{formatCurrency(journey.purchasePrice)}</p>
                      </div>
                    )}
                    
                    {/* Usage Frequency */}
                    {journey.usageFrequency && (
                      <div>
                        <h5 className="text-xs text-gray-500 mb-0.5">How often used</h5>
                        <p className="text-sm text-gray-800">{journey.usageFrequency}</p>
                      </div>
                    )}
                    
                    {/* Recommendation */}
                    <div>
                      <h5 className="text-xs text-gray-500 mb-0.5">Would recommend</h5>
                      <p className="text-sm text-gray-800">{journey.wouldRecommend ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {/* Journey Review */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Your Feedback</h4>
                  <p className="text-gray-800">{journey.review || 'No feedback provided'}</p>
                </div>

                {/* Date & Actions */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {new Date(journey.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-4">
                    <button
                      className="text-sm text-blue-500 hover:text-blue-700"
                      onClick={() => navigate(`/journey/${journey.productId}`)}
                    >
                      Continue Journey
                    </button>
                    <button
                      className="text-sm text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteJourney(journey.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Add the "Write Journey" button in the bottom left */}
      <div >
      <button
             onClick={() => navigate('/journey')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-6"
            >
            Write Review
            </button>
      </div>
    </>
  );
};

export default JourneysFoundUI;