import React from 'react';
import { useLocation } from 'wouter';
import { Country } from '@/types';
import { formatNumber } from '@/lib/helpers';

interface CountryBannerProps {
  country: Country;
}

const CountryBanner: React.FC<CountryBannerProps> = ({ country }) => {
  const [_, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/');
  };

  return (
    <div 
      className="relative bg-cover bg-center h-80 md:h-96" 
      style={{ backgroundImage: `url(${country.flagUrl})` }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 z-0"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-end relative z-10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={handleBack}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full w-10 h-10 flex items-center justify-center text-white"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
              {country.region || 'Unknown Region'}
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{country.name}</h1>
          
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <i className="fas fa-users"></i>
              <span>{formatNumber(country.population || 0)}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <i className="fas fa-map-marker-alt"></i>
              <span>{country.capital ? `${country.capital} (Capital)` : 'No capital data'}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <i className="fas fa-flag"></i>
              <span>{country.countryInfo?.governmentForm || 'Republic'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryBanner;
