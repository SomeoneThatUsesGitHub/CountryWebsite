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
      
      {/* Diplomatic Activity */}
      <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
        <h4 className="font-semibold mb-4 flex items-center">
          <i className="fas fa-globe text-primary mr-2"></i>
          Recent Diplomatic Activity
        </h4>
        <div className="space-y-4">
          {[
            { event: 'Trade Summit', date: '2023-04-15', countries: ['United States', 'China', 'Japan'], icon: 'fa-handshake' },
            { event: 'Climate Change Conference', date: '2023-02-10', countries: ['Germany', 'France', 'United Kingdom'], icon: 'fa-leaf' },
            { event: 'Cultural Exchange Program', date: '2023-01-22', countries: ['Brazil', 'Argentina'], icon: 'fa-theater-masks' }
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-b-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center">
                <i className={`fas ${activity.icon} text-primary`}></i>
              </div>
              
              <div className="flex-grow">
                <h5 className="font-medium">{activity.event}</h5>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {activity.countries.map(country => (
                    <span key={country} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* International Organizations */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold mb-3">International Organizations</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {['United Nations', 'World Trade Organization', 'G20', 'NATO', 'World Health Organization'].map((org, index) => (
            <div key={org} className="bg-white p-3 rounded-lg text-center shadow-sm">
              <i className={`fas ${
                org === 'United Nations' ? 'fa-globe-americas' :
                org === 'World Trade Organization' ? 'fa-balance-scale' :
                org === 'G20' ? 'fa-users' :
                org === 'NATO' ? 'fa-shield-alt' :
                'fa-heartbeat'
              } text-gray-500 mb-2`}></i>
              <p className="text-sm font-medium">{org}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InternationalRelations;