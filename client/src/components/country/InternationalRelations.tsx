import React from 'react';
import { motion } from 'framer-motion';

interface Relation {
  country: string;
  type: 'Ally' | 'Economic Partner' | 'Cultural Exchange' | 'Dispute' | 'Treaty';
  strength: 'Strong' | 'Moderate' | 'Developing';
  details: string;
  flagUrl?: string;
}

interface InternationalRelationsProps {
  countryName: string;
  relations?: Relation[];
}

const InternationalRelations: React.FC<InternationalRelationsProps> = ({ 
  countryName, 
  relations = []
}) => {
  // Default relations if none provided
  const countryRelations: Relation[] = relations.length > 0 ? relations : [
    {
      country: 'United States',
      type: 'Economic Partner',
      strength: 'Strong',
      details: 'Major trading partner with bilateral trade agreements. Cooperation on technology and security.',
      flagUrl: 'https://flagcdn.com/us.svg'
    },
    {
      country: 'Germany',
      type: 'Ally',
      strength: 'Strong',
      details: 'Strategic military alliance and defense cooperation. Shared diplomatic objectives.',
      flagUrl: 'https://flagcdn.com/de.svg'
    },
    {
      country: 'Japan',
      type: 'Economic Partner',
      strength: 'Moderate',
      details: 'Growing economic relationship with focus on technology exchange and investment.',
      flagUrl: 'https://flagcdn.com/jp.svg'
    },
    {
      country: 'Brazil',
      type: 'Cultural Exchange',
      strength: 'Developing',
      details: 'Educational and cultural programs promoting mutual understanding and cooperation.',
      flagUrl: 'https://flagcdn.com/br.svg'
    },
    {
      country: 'Russia',
      type: 'Treaty',
      strength: 'Moderate',
      details: 'Limited cooperation through specific international agreements and treaties.',
      flagUrl: 'https://flagcdn.com/ru.svg'
    }
  ];
  
  // Colors for different relation types
  const relationColors = {
    'Ally': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-300',
      icon: 'text-blue-500'
    },
    'Economic Partner': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-300',
      icon: 'text-green-500'
    },
    'Cultural Exchange': {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-300',
      icon: 'text-purple-500'
    },
    'Dispute': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-300',
      icon: 'text-red-500'
    },
    'Treaty': {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: 'text-amber-500'
    }
  };
  
  // Bar width for relationship strength
  const strengthWidth = {
    'Strong': 'w-full',
    'Moderate': 'w-2/3',
    'Developing': 'w-1/3'
  };
  
  // Icons for different relation types
  const relationIcons = {
    'Ally': 'fa-handshake',
    'Economic Partner': 'fa-chart-line',
    'Cultural Exchange': 'fa-university',
    'Dispute': 'fa-exclamation-triangle',
    'Treaty': 'fa-file-signature'
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6">International Relations</h3>
      
      {/* Key Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {countryRelations.map((relation, index) => (
          <motion.div 
            key={relation.country}
            className="bg-white rounded-lg overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className={`flex items-center p-3 gap-3 ${relationColors[relation.type].bg}`}>
              {relation.flagUrl && (
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white flex-shrink-0 shadow-sm">
                  <img 
                    src={relation.flagUrl} 
                    alt={`${relation.country} flag`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/40x40?text=Flag';
                    }}
                  />
                </div>
              )}
              
              <div className="flex-grow">
                <h5 className="font-bold text-lg">{relation.country}</h5>
                <div className="flex items-center">
                  <i className={`fas ${relationIcons[relation.type]} mr-1 ${relationColors[relation.type].icon}`}></i>
                  <span className={`text-sm font-medium ${relationColors[relation.type].text}`}>
                    {relation.type}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Relationship Strength</span>
                  <span className="text-gray-500">{relation.strength}</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-primary ${strengthWidth[relation.strength]}`}
                  ></div>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm">
                {relation.details}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Historical Laws */}
      <div className="bg-gradient-to-r from-blue-100/50 to-indigo-100/50 p-5 rounded-lg shadow-sm">
        <h4 className="font-semibold mb-4 text-gray-800 flex items-center">
          <i className="fas fa-gavel text-primary mr-2"></i>
          Historical Laws
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { 
              name: 'Constitutional Reform', 
              year: '2010', 
              description: 'Major revision of the constitution that strengthened democratic institutions and expanded civil liberties.', 
              icon: 'fa-landmark'
            },
            { 
              name: 'Environmental Protection Act', 
              year: '2015', 
              description: 'Landmark legislation establishing strict environmental standards and conservation regulations.', 
              icon: 'fa-tree'
            },
            { 
              name: 'Digital Rights Law', 
              year: '2018', 
              description: 'Comprehensive legislation protecting digital privacy and regulating tech companies.', 
              icon: 'fa-shield-alt'
            }
          ].map((law, index) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-lg overflow-hidden shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
            >
              <div className="p-3 bg-primary/10 border-b border-primary/20">
                <div className="flex items-center gap-2">
                  <i className={`fas ${law.icon} text-primary`}></i>
                  <h5 className="font-semibold">{law.name}</h5>
                </div>
                <p className="text-xs text-gray-600 mt-1">Enacted in {law.year}</p>
              </div>
              <div className="p-3">
                <p className="text-sm text-gray-600">{law.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* International Organizations */}
      <div className="mt-6 bg-white p-5 rounded-lg shadow-sm border border-primary/10">
        <h4 className="font-semibold mb-4 text-gray-800 flex items-center">
          <i className="fas fa-globe-americas text-primary mr-2"></i>
          International Organizations Membership
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[
            { name: 'United Nations', icon: 'fa-globe-americas', color: 'bg-blue-50 text-blue-600 border-blue-200' },
            { name: 'World Trade Organization', icon: 'fa-balance-scale', color: 'bg-green-50 text-green-600 border-green-200' },
            { name: 'G20', icon: 'fa-users', color: 'bg-purple-50 text-purple-600 border-purple-200' },
            { name: 'NATO', icon: 'fa-shield-alt', color: 'bg-red-50 text-red-600 border-red-200' },
            { name: 'World Health Organization', icon: 'fa-heartbeat', color: 'bg-teal-50 text-teal-600 border-teal-200' }
          ].map((org, index) => (
            <motion.div 
              key={org.name}
              className={`flex items-center gap-2 p-3 rounded-lg border ${org.color}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + (index * 0.1) }}
            >
              <i className={`fas ${org.icon} text-lg`}></i>
              <p className="text-sm font-medium">{org.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InternationalRelations;