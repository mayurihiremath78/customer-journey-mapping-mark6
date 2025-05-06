import React from 'react';
import { useNavigate } from "react-router-dom";
import { Headphones, ArrowRight, BarChart3, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import { mockProducts } from '../data/mockData';
import ProductCard from '../components/ui/ProductCard';
import StatsCard from '../components/ui/StatsCard';
import FeatureCard from '../components/ui/FeatureCard';
import { useStats } from '../components/ui/StatsData';

const HomePage: React.FC = () => {
  const featuredProducts = mockProducts.slice(0, 3);
  const navigate = useNavigate();
  
  // Fetch statistics from the API
  const {  reviewCount, productCount, brandCount, loading, error } = useStats();
  
  // Helper function for navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-indigo-900 text-white h-[750px] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-indigo-800 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3394658/pexels-photo-3394658.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 animate-fade-in">
              Map Your Earphone Journey
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 mb-10">
              Discover, compare, and share your experiences with earphones to help others make better decisions.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                variant="secondary" 
                size="lg"
                icon={<Headphones size={20} />}
                onClick={() => handleNavigation("/journey")}
              >
                Start Your Journey
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => handleNavigation("/compare")}
              >
                Compare Products
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-60">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Document and analyze your earphone experience from discovery to daily use
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Map Your Journey"
              description="Document each stage of your earphone experience from how you discovered the product to your ongoing usage."
              icon={<Headphones size={32} className="text-indigo-900" />}
              onClick={() => handleNavigation("/journey")}
            />
            
            <FeatureCard
              title="Visualize & Compare"
              description="See how your experience compares to others through interactive visualizations and detailed comparisons."
              icon={<BarChart3 size={32} className="text-coral-500" />}
              iconBgColor="bg-coral-100"
              onClick={() => handleNavigation("/compare")}
            />
            
            <FeatureCard
              title="Help Others Decide"
              description="Your journey helps others make more informed decisions and helps brands improve their products."
              icon={<Users size={32} className="text-green-600" />}
              iconBgColor="bg-green-100"
              onClick={() => handleNavigation("/reviews")}
            />
          </div>
        </div>
      </section>

   

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">The Power of Shared Experiences</h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Our collective journey data provides valuable insights for both consumers and brands
            </p>
          </div>
          
          {error && (
            <div className="bg-red-800/20 text-white p-4 rounded-md mb-8 max-w-2xl mx-auto">
              <p>{error}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatsCard 
              value={loading ? "Loading..." : `${reviewCount}`}
              label="Customer Journeys" 
              onClick={() => handleNavigation("/reviews")}
              variant="dark"
            />
            
            <StatsCard 
              value={loading ? "Loading..." : `${productCount}`}
              label="Earphone Models" 
              onClick={() => handleNavigation("/products")}
              variant="dark"
            />
            
            <StatsCard 
              value={loading ? "Loading..." : `${brandCount}`}
              label="Brands Analyzed" 
              onClick={() => handleNavigation("/brands")}
              variant="dark"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Share Your Journey?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Your experience helps others make better choices and provides valuable feedback to manufacturers.
            </p>
            <Button 
              variant="primary" 
              size="lg"
              icon={<Headphones size={20} />}
              onClick={() => handleNavigation("/journey")}
            >
              Start Mapping Your Journey
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;