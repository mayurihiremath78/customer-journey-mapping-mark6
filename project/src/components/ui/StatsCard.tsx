import React from 'react';

interface StatsCardProps {
  value: string | number;
  label: string;
  onClick?: () => void;
  variant?: 'light' | 'dark';
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  value, 
  label, 
  onClick, 
  variant = 'light' 
}) => {
  // The styling changes based on the variant (dark or light)
  const cardClass = variant === 'dark'
    ? 'text-center p-6 cursor-pointer hover:bg-white/10 rounded-lg transition-colors'
    : 'bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow';
  
  const valueClass = variant === 'dark'
    ? 'text-4xl font-bold mb-2'
    : 'text-4xl font-bold text-blue-600 mb-2';
  
  const labelClass = variant === 'dark'
    ? 'text-indigo-200 text-lg'
    : 'text-gray-600 text-lg';

  return (
    <div 
      className={cardClass}
      onClick={onClick}
    >
      <div className={valueClass}>{value}</div>
      <div className={labelClass}>{label}</div>
    </div>
  );
};

export default StatsCard;