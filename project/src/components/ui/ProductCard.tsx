import React from 'react';
import { Star } from 'lucide-react';
import { Product } from '../../types';
import Card from './Card';

interface ProductCardProps {
  product: Product;
  onSelect?: () => void;
  selected?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onSelect,
  selected = false,
}) => {
  return (
    <Card 
      className={`relative transition-all duration-200 ${
        selected ? 'ring-2 ring-indigo-500' : ''
      }`}
      hoverable
      onClick={onSelect}
    >
      {selected && (
        <div className="absolute top-3 right-3 z-10 bg-indigo-500 text-white rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center">
            <div className="flex items-center text-yellow-400 mr-1">
              <Star size={16} fill="currentColor" />
            </div>
            <span className="text-white text-sm font-medium">{product.averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-xs font-semibold text-indigo-500 mb-1">
          {product.brand}
        </div>
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-gray-700 font-bold">₹{product.price}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {product.type}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;