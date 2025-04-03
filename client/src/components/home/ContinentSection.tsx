import React, { useState } from 'react';
import { Country } from '@/types';
import CountryCard from './CountryCard';

interface ContinentSectionProps {
  continent: string;
  countries: Country[];
}

const ContinentSection: React.FC<ContinentSectionProps> = ({ continent, countries }) => {
  const [showAll, setShowAll] = useState(false);
  
  // To ensure variety, get a random selection of countries if there are more than 4
  const getRandomizedCountries = React.useCallback((allCountries: Country[], count: number) => {
    if (allCountries.length <= count) return allCountries;
    
    // Create a copy to avoid mutating the original array
    const shuffled = [...allCountries];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, count);
  }, []);
  
  // Memoize the random selection so it doesn't change on every render
  const randomizedCountries = React.useMemo(() => 
    getRandomizedCountries(countries, 4), 
    [countries, getRandomizedCountries]
  );
  
  // Choose memoized random countries or all countries if showing all
  const displayCountries = showAll ? countries : randomizedCountries;

  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-2xl font-bold">{continent}</h3>
        <div className="h-0.5 flex-grow bg-gray-200"></div>
        <button 
          className="text-primary font-medium hover:underline"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : 'View All'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayCountries.map((country) => (
          <CountryCard key={country.id} country={country} />
        ))}
      </div>
    </section>
  );
};

export default ContinentSection;
