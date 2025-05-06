import React from 'react';
import { useNavigate } from 'react-router-dom';

const NoJourneysUI: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white shadow-md rounded-lg p-8 text-center">
      <div className="mb-6">
        <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">No Journeys Yet</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Share your experiences with products to help others make informed decisions. Start your first product journey now!
      </p>
      
      <div className="flex flex-col items-center space-y-4">
        <button 
          onClick={() => navigate('/journey')}
          className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Start Your First Journey
        </button>
        
     
      </div>
    </div>
  );
};

export default NoJourneysUI;