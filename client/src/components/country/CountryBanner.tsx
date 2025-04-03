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
      className="relative bg-cover bg-center h-[300px] sm:h-80 md:h-72 lg:h-80" 
      style={{ backgroundImage: `url(${country.flagUrl})` }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 z-0"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-end relative z-10 pb-6 md:pb-8">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <button 
              onClick={handleBack}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="bg-primary/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs sm:text-sm">
              {country.region || 'Unknown Region'}
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">{country.name}</h1>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3">
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <i className="fas fa-users"></i>
              <span>{formatNumber(country.population || 0)}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <i className="fas fa-map-marker-alt"></i>
              <span>{country.capital ? (country.capital.length > 20 ? `${country.capital.substring(0, 18)}...` : country.capital) : 'No capital data'}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <i className="fas fa-flag"></i>
              <span>
                {country.countryInfo?.governmentForm && country.countryInfo.governmentForm.length > 20 
                  ? `${country.countryInfo.governmentForm.substring(0, 18)}...` 
                  : (country.countryInfo?.governmentForm || 'Republic')}
              </span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
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
