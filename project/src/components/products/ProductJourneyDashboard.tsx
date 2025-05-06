import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, 
                Title, Tooltip, Legend, ArcElement, RadialLinearScale);

// Simplified Journey interface with only needed fields
interface Journey {
  id: number;
  productId: number | string;
  rating?: number;
  overallSatisfaction?: number;
  awarenessSource?: string;
  wouldRecommend?: boolean;
  keyFeature_SoundQuality?: boolean;
  keyFeature_NoiseCancellation?: boolean;
  keyFeature_BatteryLife?: boolean;
  keyFeature_Comfort?: boolean;
  keyFeature_Price?: boolean;
  keyFeature_Brand?: boolean;
  keyFeature_Design?: boolean;
  awarenessCompleted?: boolean;
  considerationCompleted?: boolean;
  purchaseCompleted?: boolean;
  postPurchaseCompleted?: boolean;
  supportCompleted?: boolean;
  researchMethod_YouTube?: boolean;
  researchMethod_TechBlogs?: boolean;
  researchMethod_SocialMedia?: boolean;
  researchMethod_FriendsFamily?: boolean;
  researchMethod_InStore?: boolean;
}

interface ProductJourneyDashboardProps {
  productId?: string | number;
}

const API_BASE_URL = 'http://localhost:5031';

// Chart color palettes for consistency
const COLORS = {
  awareness: ['rgba(59, 130, 246, 0.7)', 'rgba(16, 185, 129, 0.7)', 'rgba(239, 68, 68, 0.7)', 
              'rgba(245, 158, 11, 0.7)', 'rgba(139, 92, 246, 0.7)'],
  features: ['rgba(99, 102, 241, 0.8)', 'rgba(79, 70, 229, 0.8)', 'rgba(139, 92, 246, 0.8)', 
             'rgba(168, 85, 247, 0.8)', 'rgba(217, 70, 239, 0.8)', 'rgba(236, 72, 153, 0.8)', 
             'rgba(244, 63, 94, 0.8)'],
  ratings: ['rgba(239, 68, 68, 0.7)', 'rgba(249, 115, 22, 0.7)', 'rgba(234, 179, 8, 0.7)', 
            'rgba(34, 197, 94, 0.7)', 'rgba(4, 91, 231, 0.7)'],
  recommend: ['#22c55e', '#ef4444'],
  stageProgress: {
    bg: 'rgba(59, 130, 246, 0.2)',
    border: '#3b82f6'
  }
};

// Chart option presets for reuse
const chartOptions = {
  bar: {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw} users`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    },
    animation: false,
    maintainAspectRatio: false,
    responsive: true
  },
  
  horizontalBar: {
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.raw} reviews`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  },
  
  line: {
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + '%'
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `${context.formattedValue}% completion rate`
        }
      }
    }
  },
  
  pie: {
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const value = context.raw as number;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  }
};

const ProductJourneyDashboard: React.FC<ProductJourneyDashboardProps> = ({ productId }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [productName, setProductName] = useState<string>("Product");
  
  // Chart data state - initialized with empty data
  const [chartData, setChartData] = useState({
    awarenessSources: {
      labels: ['YouTube', 'Tech Blogs', 'Social Media', 'Friends/Family', 'In-Store'],
      datasets: [{ label: 'Users', data: [0, 0, 0, 0, 0], backgroundColor: COLORS.awareness }]
    },
    keyFeatures: {
      labels: ['Sound Quality', 'Noise Cancellation', 'Battery Life', 'Comfort', 'Price', 'Brand', 'Design'],
      datasets: [{ label: 'Selected By Users', data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: COLORS.features }]
    },
    stageProgress: {
      labels: ['Awareness', 'Consideration', 'Purchase', 'Post-Purchase', 'Support'],
      datasets: [{
        label: '% Completion', 
        data: [0, 0, 0, 0, 0],
        fill: true,
        backgroundColor: COLORS.stageProgress.bg,
        borderColor: COLORS.stageProgress.border,
        tension: 0.4
      }]
    },
    recommendation: {
      labels: ['Recommend', 'Not Recommend'],
      datasets: [{ data: [0, 0], backgroundColor: COLORS.recommend }]
    },
    ratings: {
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      datasets: [{
        label: 'Number of Ratings',
        data: [0, 0, 0, 0, 0],
        backgroundColor: COLORS.ratings,
        borderWidth: 1
      }]
    }
  });
  
  const dashboardRef = useRef<HTMLDivElement>(null);

  // Fetch data when productId changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch product name if productId provided
        if (productId) {
          try {
            const { data } = await axios.get(`${API_BASE_URL}/api/Products/${productId}`);
            if (data?.name) setProductName(data.name);
          } catch (err) {
            console.error('Error fetching product details:', err);
          }
        }
        
        // Fetch journeys
        const { data } = await axios.get(`${API_BASE_URL}/api/Journey`);
        
        // Parse journey data based on response structure
        let allJourneys = Array.isArray(data) ? data : 
                         Array.isArray(data?.journeys) ? data.journeys : 
                         typeof data === 'object' ? Object.values(data) : [];
        
        // Filter by productId if provided
        const filteredJourneys = productId ? 
          allJourneys.filter(j => String(j.productId) === String(productId)) : allJourneys;
        
        console.log(`Found ${filteredJourneys.length} journeys for this product`);
        
        setJourneys(filteredJourneys);
        processChartData(filteredJourneys);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [productId]);
  
  // Process journey data into chart data
  const processChartData = (journeys: Journey[]) => {
    if (!journeys?.length) return;
    
    // Count arrays for each chart
    const counts = {
      ratings: [0, 0, 0, 0, 0],
      features: [0, 0, 0, 0, 0, 0, 0],
      recommend: [0, 0],
      stages: [0, 0, 0, 0, 0],
      sources: [0, 0, 0, 0, 0]
    };
    
    // Process all journeys to populate counts
    journeys.forEach(journey => {
      // Ratings
      const rating = journey.rating || journey.overallSatisfaction || 0;
      if (rating > 0 && rating <= 5) {
        counts.ratings[Math.floor(rating) - 1]++;
      }
      
      // Key Features
      if (journey.keyFeature_SoundQuality === true) counts.features[0]++;
      if (journey.keyFeature_NoiseCancellation === true) counts.features[1]++;
      if (journey.keyFeature_BatteryLife === true) counts.features[2]++;
      if (journey.keyFeature_Comfort === true) counts.features[3]++;
      if (journey.keyFeature_Price === true) counts.features[4]++;
      if (journey.keyFeature_Brand === true) counts.features[5]++;
      if (journey.keyFeature_Design === true) counts.features[6]++;
      
      // Recommendation
      if (journey.wouldRecommend === true) counts.recommend[0]++;
      else if (journey.wouldRecommend === false) counts.recommend[1]++;
      
      // Stage completion
      if (journey.awarenessCompleted === true) counts.stages[0]++;
      if (journey.considerationCompleted === true) counts.stages[1]++;
      if (journey.purchaseCompleted === true) counts.stages[2]++;
      if (journey.postPurchaseCompleted === true) counts.stages[3]++;
      if (journey.supportCompleted === true) counts.stages[4]++;
    });

    // Awareness sources - we need to track which journeys we've already counted
    const sourceLabels = ['YouTube', 'Tech Blogs', 'Social Media', 'Friends/Family', 'In-Store'];
    const sourceCounts = [0, 0, 0, 0, 0];
    
    journeys.forEach(journey => {
      // Create an array to track which sources this journey contributes to
      const journeySources = [false, false, false, false, false]; 
      
      // Check the awarenessSource field
      if (journey.awarenessSource) {
        const source = journey.awarenessSource.toLowerCase();
        if (source.includes('youtube')) journeySources[0] = true;
        else if (source.includes('blog')) journeySources[1] = true;
        else if (source.includes('social')) journeySources[2] = true;
        else if (source.includes('friend') || source.includes('family')) journeySources[3] = true;
        else if (source.includes('store')) journeySources[4] = true;
      }
      
      // Also check for individual research method boolean fields if they exist
      if (journey.researchMethod_YouTube === true) journeySources[0] = true;
      if (journey.researchMethod_TechBlogs === true) journeySources[1] = true;
      if (journey.researchMethod_SocialMedia === true) journeySources[2] = true;
      if (journey.researchMethod_FriendsFamily === true) journeySources[3] = true;
      if (journey.researchMethod_InStore === true) journeySources[4] = true;
      
      // Now increment each source that this journey contributes to
      journeySources.forEach((contributes, i) => {
        if (contributes) {
          sourceCounts[i]++;
        }
      });
      
      // Debug logging
      const activeSourcesForJourney = sourceLabels.filter((label, i) => journeySources[i]);
      if (activeSourcesForJourney.length > 0) {
        console.log(`Journey ${journey.id} contributes to sources: ${activeSourcesForJourney.join(', ')}`);
      }
    });

    console.log('Awareness source counts:', sourceCounts.map((count, i) => `${sourceLabels[i]}: ${count}`).join(', '));
    
    // Calculate stage percentages
    const stagePercentages = counts.stages.map(count => 
      Math.round((count / journeys.length) * 100));
    
    // Update all chart data at once
    setChartData({
      ratings: {
        ...chartData.ratings,
        datasets: [{ ...chartData.ratings.datasets[0], data: counts.ratings }]
      },
      keyFeatures: {
        ...chartData.keyFeatures,
        datasets: [{ ...chartData.keyFeatures.datasets[0], data: counts.features }]
      },
      recommendation: {
        ...chartData.recommendation,
        datasets: [{ ...chartData.recommendation.datasets[0], data: counts.recommend }]
      },
      stageProgress: {
        ...chartData.stageProgress,
        datasets: [{ ...chartData.stageProgress.datasets[0], data: stagePercentages }]
      },
      awarenessSources: {
        ...chartData.awarenessSources,
        datasets: [{ ...chartData.awarenessSources.datasets[0], data: sourceCounts }]
      }
    });
  };

  // Generate PDF from dashboard
  const downloadPDF = async () => {
    if (!dashboardRef.current) return;
    try {
      const canvas = await html2canvas(dashboardRef.current);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${productName.toLowerCase().replace(/\s+/g, '-')}-journey-dashboard.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  // Fixed Excel export function
  const exportToExcel = () => {
    if (!journeys.length) {
      console.error('No journey data to export');
      return;
    }
    
    try {
      // Prepare data for Excel export
      const exportData = journeys.map(journey => {
        // Create a simplified version of the journey data for export
        return {
          'Journey ID': journey.id,
          'Product ID': journey.productId,
          'Rating': journey.rating || journey.overallSatisfaction || 0,
          'Would Recommend': journey.wouldRecommend ? 'Yes' : 'No',
          'Awareness Source': journey.awarenessSource || 'Not specified',
          'Sound Quality Important': journey.keyFeature_SoundQuality ? 'Yes' : 'No',
          'Noise Cancellation Important': journey.keyFeature_NoiseCancellation ? 'Yes' : 'No',
          'Battery Life Important': journey.keyFeature_BatteryLife ? 'Yes' : 'No',
          'Comfort Important': journey.keyFeature_Comfort ? 'Yes' : 'No',
          'Price Important': journey.keyFeature_Price ? 'Yes' : 'No',
          'Brand Important': journey.keyFeature_Brand ? 'Yes' : 'No',
          'Design Important': journey.keyFeature_Design ? 'Yes' : 'No',
          'Awareness Stage Completed': journey.awarenessCompleted ? 'Yes' : 'No',
          'Consideration Stage Completed': journey.considerationCompleted ? 'Yes' : 'No',
          'Purchase Stage Completed': journey.purchaseCompleted ? 'Yes' : 'No',
          'Post-Purchase Stage Completed': journey.postPurchaseCompleted ? 'Yes' : 'No',
          'Support Stage Completed': journey.supportCompleted ? 'Yes' : 'No',
        };
      });
      
      // Create worksheet from the prepared data
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Journey Data');
      
      // Export to Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, `${productName.toLowerCase().replace(/\s+/g, '-')}-journey-data.xlsx`);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <p className="font-medium">Error loading dashboard</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto font-sans relative" ref={dashboardRef}>
      <div className="text-right mb-4 flex justify-end space-x-3">
        <button 
          onClick={downloadPDF} 
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow flex items-center"
        >
          <span className="mr-2">📄</span> Download PDF
        </button>
        <button 
          onClick={exportToExcel} 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow flex items-center"
        >
          <span className="mr-2">📊</span> Download Excel
        </button>
      </div>

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
        🧭 {productName} Journey Insights
      </h1>
      
      {journeys.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md mb-6">
          <p className="font-medium">No journey data available</p>
          <p>There is no customer journey data for this product yet.</p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 rounded-md mb-6">
            <p className="font-medium">Data summary</p>
            <p>Showing insights from {journeys.length} customer journeys</p>
          </div>

          {/* Awareness Section */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">📢 Awareness Stage</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Top Awareness Sources</h3>
                <div style={{ height: '300px' }}>
                  <Bar data={chartData.awarenessSources} options={chartOptions.bar} />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Stage Completion</h3>
                <div style={{ height: '300px' }}>
                  <Line data={chartData.stageProgress} options={chartOptions.line} />
                </div>
              </div>
            </div>
          </section>

          {/* Consideration & Recommendation */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">💡 Consideration & ✅ Recommendation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Key Features Considered</h3>
                <div className="max-w-md mx-auto" style={{ height: '300px' }}>
                  <Bar data={chartData.keyFeatures} options={chartOptions.bar} />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Would Users Recommend?</h3>
                <div className="max-w-sm mx-auto" style={{ height: '300px' }}>
                  <Pie data={chartData.recommendation} options={chartOptions.pie} />
                </div>
              </div>
            </div>
          </section>

          {/* Rating Section */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold text-yellow-600 mb-4">⭐ Review Ratings Summary</h2>
            <div className="max-w-lg mx-auto" style={{ height: '300px' }}>
              <Bar data={chartData.ratings} options={chartOptions.horizontalBar} />
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ProductJourneyDashboard;