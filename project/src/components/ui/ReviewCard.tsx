import React from 'react';
import { Journey, Product, User } from '../../types';

interface ReviewCardProps {
  journey: Journey;
  product?: Product;
  user: User;
  isExpanded: boolean;
  toggleExpand: (id: number) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ 
  journey, 
  product, 
  user, 
  isExpanded, 
  toggleExpand 
}) => {
  const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Anonymous');
  const rating = journey.rating || journey.overallSatisfaction || 0;
  const date = journey.date || journey.createdAt;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 transition-all duration-300 h-auto border border-gray-100 hover:shadow-lg">
      {/* Product Name */}
      {product && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-100 pb-2">
          {product.brand} {product.name}
        </h3>
      )}
      
      {/* Date and User Info Row */}
      <div className="flex flex-col mb-4">
        {/* Top Row: Rating stars and Date */}
        <div className="flex justify-between items-center mb-2">
          {/* Left: Rating stars */}
          <div className="flex space-x-1 text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-xl">
                {star <= rating ? '★' : '☆'}
              </span>
            ))}
          </div>
          
          {/* Right: Date */}
          <div className="text-xs text-gray-500">
            {date 
              ? new Date(date).toLocaleDateString('en-US', { 
                  year: 'numeric',
                  month: 'short', 
                  day: 'numeric' 
                })
              : 'No date'}
          </div>
        </div>
        
        {/* Bottom Row: User info with avatar */}
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mr-2">
            {user.image ? (
              <img 
                src={user.image} 
                alt={displayName} 
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as any;
                  target.outerHTML = `<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">${displayName.charAt(0).toUpperCase()}</div>`;
                }}
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-gray-700 font-medium">
              {displayName}
            </span>
            <span className="text-xs text-gray-500">
              {user.email}
            </span>
          </div>
        </div>
      </div>
      
      {/* Journey Review */}
      <div className={`transition-all duration-300 mb-4 ${isExpanded ? '' : 'line-clamp-3'}`}>
        <p className="text-gray-700">
          {journey.review || "No review provided."}
        </p>
      </div>
      
      {/* Product Details (when expanded) */}
      {isExpanded && product && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start">
            {product.imageUrl && (
              <img 
                src={product.imageUrl} 
                alt={product.name}
                className="w-16 h-16 object-cover rounded-md mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}

            <div>
              <p className="text-gray-700 font-medium">
                {product.brand} {product.name}
              </p>
              {product.description && (
                <p className="text-gray-500 text-sm mt-1">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* User info when expanded */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Reviewer Info:</h4>
          <div className="flex flex-col space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Name:</span> {user.name || 'Not provided'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {user.email || 'Not provided'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">User ID:</span> {journey.userId}
            </p>
          </div>
        </div>
      )}
      
      {/* Read More / Show Less Button */}
      <div className="flex justify-end mt-3">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand(journey.id);
          }}
          className="text-blue-500 hover:text-blue-700 text-sm focus:outline-none"
        >
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;