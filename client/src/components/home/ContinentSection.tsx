import React from 'react';
import { Country } from '@/types';
import CountryCard from './CountryCard';

interface ContinentSectionProps {
  continent: string;
  countries: Country[];
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const ContinentSection: React.FC<ContinentSectionProps> = ({ 
  continent, 
  countries, 
  expanded = false, 
  onToggleExpand 
}) => {
  // Display all countries when expanded, otherwise just the first 4
  const displayCountries = expanded ? countries : countries.slice(0, 4);

  return (
    <section id={`continent-${continent}`} className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-2xl font-bold">{continent}</h3>
        <div className="h-0.5 flex-grow bg-gray-200"></div>
        <button 
          className="text-primary font-medium hover:underline"
          onClick={onToggleExpand}
        >
          {expanded ? 'Show Less' : 'View All'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayCountries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
      
      {expanded && countries.length > 8 && (
        <div className="mt-6 text-center">
          <button 
            className="text-primary font-medium hover:underline"
            onClick={onToggleExpand}
          >
            Show Less
          </button>
        </div>
      )}
    </section>
  );
};

export default ContinentSection;
