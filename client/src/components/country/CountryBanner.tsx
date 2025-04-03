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
      className="relative bg-cover bg-center h-64 md:h-72" 
      style={{ backgroundImage: `url(${country.flagUrl})` }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 z-0"></div>
      
      {/* Content */}
      <div className="container mx-auto px-4 h-full flex items-end relative z-10 pb-6 md:pb-8">
        <div className="w-full">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 mb-1 sm:mb-2">
            <button 
              onClick={handleBack}
              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-white"
            >
              <i className="fas fa-arrow-left text-xs sm:text-sm"></i>
            </button>
            <div className="bg-primary/80 backdrop-blur-sm text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] xs:text-xs sm:text-sm">
              {country.region || 'Unknown Region'}
            </div>
          </div>
          
          <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-1 sm:mb-2">{country.name}</h1>
          
          <div className="grid grid-cols-2 xxs:flex xxs:flex-wrap gap-1.5 sm:gap-2 mt-2 mb-2">
            <div className="bg-white/20 backdrop-blur-sm text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm">
              <i className="fas fa-users"></i>
              <span>{formatNumber(country.population || 0)}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm">
              <i className="fas fa-map-marker-alt"></i>
              <span>{country.capital ? (country.capital.length > 15 ? `${country.capital.substring(0, 13)}...` : country.capital) : 'No capital'}</span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm">
              <i className="fas fa-flag"></i>
              <span>
                {country.countryInfo?.governmentForm && country.countryInfo.governmentForm.length > 15 
                  ? `${country.countryInfo.governmentForm.substring(0, 13)}...` 
                  : (country.countryInfo?.governmentForm || 'Republic')}
              </span>
            </div>
            
            <div className="bg-white/20 backdrop-blur-sm text-white px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg flex items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm">
              <i className="fas fa-map"></i>
              <span>{country.area ? `${formatNumber(country.area)} km²` : 'No size'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryBanner;
