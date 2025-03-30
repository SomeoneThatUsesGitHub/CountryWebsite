import React, { useState } from 'react';
import { useLocation } from 'wouter';

const Header: React.FC = () => {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <a 
          href="#" 
          className="flex items-center gap-2"
          onClick={(e) => {
            e.preventDefault();
            handleNavigation('/');
          }}
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <i className="fas fa-globe text-white"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-900">WorldPolitics</h1>
        </a>
        
        <nav className="hidden md:flex gap-6">
          <a 
            href="#" 
            className={`font-medium hover:text-primary transition-colors ${
              location === '/' ? 'text-primary' : 'text-gray-600'
            }`}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation('/');
            }}
          >
            Home
          </a>
          <a 
            href="#" 
            className="font-medium text-gray-600 hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement Explore page
            }}
          >
            Explore
          </a>
          <a 
            href="#" 
            className="font-medium text-gray-600 hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement Compare page
            }}
          >
            Compare
          </a>
          <a 
            href="#" 
            className="font-medium text-gray-600 hover:text-primary transition-colors"
            onClick={(e) => {
              e.preventDefault();
              // TODO: Implement About page
            }}
          >
            About
          </a>
        </nav>
        
        <button 
          className="md:hidden text-gray-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <nav className="flex flex-col container mx-auto px-4 py-2">
            <a 
              href="#" 
              className={`py-3 font-medium hover:text-primary transition-colors ${
                location === '/' ? 'text-primary' : 'text-gray-600'
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/');
              }}
            >
              Home
            </a>
            <a 
              href="#" 
              className="py-3 font-medium text-gray-600 hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement Explore page
              }}
            >
              Explore
            </a>
            <a 
              href="#" 
              className="py-3 font-medium text-gray-600 hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement Compare page
              }}
            >
              Compare
            </a>
            <a 
              href="#" 
              className="py-3 font-medium text-gray-600 hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Implement About page
              }}
            >
              About
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
