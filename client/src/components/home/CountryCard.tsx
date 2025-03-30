import React from 'react';
import { useLocation } from 'wouter';
import { Country } from '@/types';
import { formatNumber } from '@/lib/helpers';

interface CountryCardProps {
  country: Country;
}

const CountryCard: React.FC<CountryCardProps> = ({ country }) => {
  const [_, setLocation] = useLocation();

  const handleClick = () => {
    setLocation(`/country?code=${country.alpha3Code}`);
  };

  // Fallback values for missing data
  const population = country.population || 0;
  const capital = country.capital || 'N/A';
  const governmentForm = country.countryInfo?.governmentForm || 'Republic';

  return (
    <div 
      className="low-poly-card rounded-lg overflow-hidden hover:cursor-pointer shadow-sm hover:shadow-md transition-all transform hover:-translate-y-1 bg-white relative"
      onClick={handleClick}
    >
      <div 
        className="h-32 bg-cover bg-center relative" 
        style={{ backgroundImage: `url(${country.flagUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h4 className="font-bold text-lg">{country.name}</h4>
          <p className="text-sm opacity-90">{governmentForm}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <i className="fas fa-users mr-2"></i>
          <span>{formatNumber(population)}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <i className="fas fa-map-marker-alt mr-2"></i>
          <span>{capital}</span>
        </div>
      </div>
      {/* Low-poly effect */}
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-primary/10 to-transparent"></div>
    </div>
  );
};

export default CountryCard;
