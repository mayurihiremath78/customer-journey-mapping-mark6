import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-indigo-900 text-white py-8">
      <div className="ml-8 align-center justify-center flex flex-col items-center">
      <p>&copy; {new Date().getFullYear()} TuneTravel. All rights reserved.</p>
        
       
         
      
      </div>
    </footer>
  );
};

export default Footer;