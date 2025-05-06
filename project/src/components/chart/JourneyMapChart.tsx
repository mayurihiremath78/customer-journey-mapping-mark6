import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface JourneyMapChartProps {
  data: any[];
  title: string;
  height?: number;
}

const JourneyMapChart: React.FC<JourneyMapChartProps> = ({ data, title, height = 300 }) => {
  // Generate unique colors for each brand
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#ff0000', '#00C49F'];
  
  // Extract brand names (keys in the data that are not 'name')
  const brandKeys = Object.keys(data[0] || {}).filter(key => key !== 'name');
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-700 mb-4">{title}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            
            {/* Dynamically create lines for each brand */}
            {brandKeys.map((key, index) => (
              <Line 
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]} 
                activeDot={{ r: 8 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default JourneyMapChart;