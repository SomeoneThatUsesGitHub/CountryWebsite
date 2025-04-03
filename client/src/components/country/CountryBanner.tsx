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
      className="relative bg-cover bg-center h-72 md:h-72" 
      style={{ backgroundImage: `url(${country.flagUrl})` }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 z-0"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-between relative z-10 py-4">
        {/* Top section with back button and region - fixed at top */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full w-9 h-9 flex items-center justify-center text-white"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <div className="bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
            {country.region || 'Unknown Region'}
          </div>
        </div>
        
        {/* Bottom section with country info */}
        <div className="mt-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{country.name}</h1>
          
          <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <i className="fas fa-users"></i>
              <span>{formatNumber(country.population || 0)}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <i className="fas fa-map-marker-alt"></i>
              <span>{country.capital || 'No capital'}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <i className="fas fa-flag"></i>
              <span>{country.countryInfo?.governmentForm || 'Republic'}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 md:px-4 md:py-2 rounded-lg flex items-center gap-1 md:gap-2 text-xs md:text-base">
              <i className="fas fa-map"></i>
              <span>{country.area ? `${formatNumber(country.area)} km²` : 'No size data'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryBanner;
