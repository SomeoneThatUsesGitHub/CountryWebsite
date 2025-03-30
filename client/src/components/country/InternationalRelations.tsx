import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Relation {
  country: string;
  type: 'Ally' | 'Economic Partner' | 'Cultural Exchange' | 'Dispute' | 'Treaty';
  description: string;
  flagUrl?: string;
}

interface Treaty {
  name: string;
  description: string;
  year: string;
  countries: string[];
}

interface InternationalRelationsProps {
  countryName: string;
  relations?: Relation[];
  treaties?: Treaty[];
}

const InternationalRelations: React.FC<InternationalRelationsProps> = ({ 
  countryName, 
  relations = [],
  treaties = []
}) => {
  const [activeRelation, setActiveRelation] = useState<string | null>(null);
  
  // Default relations if none provided
  const countryRelations: Relation[] = relations.length > 0 ? relations : [
    {
      country: 'United States',
      type: 'Economic Partner',
      description: 'Strong trading partnership with regular diplomatic exchanges.',
      flagUrl: 'https://flagcdn.com/us.svg'
    },
    {
      country: 'Germany',
      type: 'Ally',
      description: 'Military alliance and significant cultural exchanges.',
      flagUrl: 'https://flagcdn.com/de.svg'
    },
    {
      country: 'Japan',
      type: 'Economic Partner',
      description: 'Technology partnership and mutual investment agreements.',
      flagUrl: 'https://flagcdn.com/jp.svg'
    },
    {
      country: 'Brazil',
      type: 'Cultural Exchange',
      description: 'Educational programs and cultural heritage preservation efforts.',
      flagUrl: 'https://flagcdn.com/br.svg'
    },
    {
      country: 'Russia',
      type: 'Treaty',
      description: 'Non-aggression pact and space exploration cooperation.',
      flagUrl: 'https://flagcdn.com/ru.svg'
    }
  ];
  
  // Default treaties if none provided
  const countryTreaties: Treaty[] = treaties.length > 0 ? treaties : [
    {
      name: 'Climate Action Accord',
      description: 'Agreement to reduce carbon emissions and promote renewable energy',
      year: '2019',
      countries: ['France', 'Germany', 'United Kingdom', 'Japan', countryName]
    },
    {
      name: 'Pacific Trade Alliance',
      description: 'Free trade agreement to reduce barriers and promote economic growth',
      year: '2017',
      countries: ['United States', 'Canada', 'Mexico', 'Japan', countryName]
    },
    {
      name: 'Security Cooperation Framework',
      description: 'Military cooperation and intelligence sharing agreement',
      year: '2020',
      countries: ['United Kingdom', 'Australia', 'Canada', countryName]
    }
  ];

  // Colors for different relation types
  const relationColors = {
    'Ally': 'bg-blue-100 text-blue-800',
    'Economic Partner': 'bg-green-100 text-green-800',
    'Cultural Exchange': 'bg-purple-100 text-purple-800',
    'Dispute': 'bg-red-100 text-red-800',
    'Treaty': 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6">International Relations</h3>
      
      {/* World Map Visualization (Placeholder) */}
      <div className="bg-blue-50 p-4 rounded-lg mb-8 relative overflow-hidden">
        <h4 className="font-semibold mb-4">Global Diplomatic Presence</h4>
        <div className="h-64 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800">
          <div className="text-center">
            <i className="fas fa-globe-americas text-5xl mb-3"></i>
            <p>Interactive world map showing diplomatic relations</p>
            <p className="text-sm text-blue-600 mt-2">Click on countries to see relationship details</p>
          </div>
        </div>
        
        {/* Map overlay dots to represent relations */}
        <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 left-2/3 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
      </div>
      
      {/* Key Relationships */}
      <div className="mb-8">
        <h4 className="font-semibold mb-4">Key Relationships</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countryRelations.map((relation, index) => (
            <motion.div 
              key={relation.country}
              className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow 
                cursor-pointer border ${activeRelation === relation.country ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setActiveRelation(activeRelation === relation.country ? null : relation.country)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="h-24 relative">
                {relation.flagUrl && (
                  <img 
                    src={relation.flagUrl} 
                    alt={`${relation.country} flag`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/300x150?text=Flag';
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-2 left-3 text-white">
                  <h5 className="font-bold">{relation.country}</h5>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${relationColors[relation.type]}`}>
                    {relation.type}
                  </span>
                </div>
              </div>
              
              {activeRelation === relation.country && (
                <motion.div 
                  className="p-3 bg-gray-50"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-sm text-gray-700">{relation.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Since 2015</span>
                    <button className="text-xs text-primary hover:underline">View Details</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Recent International Agreements */}
      <div>
        <h4 className="font-semibold mb-4">Recent International Agreements</h4>
        <div className="space-y-4">
          {countryTreaties.map((treaty, index) => (
            <motion.div 
              key={treaty.name}
              className="bg-white p-4 rounded-lg shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h5 className="font-bold text-gray-800">{treaty.name} ({treaty.year})</h5>
                  <p className="text-sm text-gray-600 mt-1">{treaty.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {treaty.countries.map(country => (
                      <span 
                        key={country} 
                        className={`text-xs px-2 py-1 rounded-full ${
                          country === countryName 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-file-signature text-blue-500"></i>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InternationalRelations;