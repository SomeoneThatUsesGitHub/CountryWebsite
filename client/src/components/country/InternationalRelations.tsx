import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Relation {
  country: string;
  type: 'Ally' | 'Economic Partner' | 'Cultural Exchange' | 'Dispute' | 'Treaty';
  strength: 'Strong' | 'Moderate' | 'Developing';
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
      flagUrl: 'https://flagcdn.com/us.svg'
    },
    {
      country: 'Germany',
      type: 'Ally',
      strength: 'Strong',
      flagUrl: 'https://flagcdn.com/de.svg'
    },
    {
      country: 'Japan',
      type: 'Economic Partner',
      strength: 'Moderate',
      flagUrl: 'https://flagcdn.com/jp.svg'
    },
    {
      country: 'Brazil',
      type: 'Cultural Exchange',
      strength: 'Developing',
      flagUrl: 'https://flagcdn.com/br.svg'
    },
    {
      country: 'Russia',
      type: 'Treaty',
      strength: 'Moderate',
      flagUrl: 'https://flagcdn.com/ru.svg'
    },
    {
      country: 'China',
      type: 'Economic Partner',
      strength: 'Strong',
      flagUrl: 'https://flagcdn.com/cn.svg'
    }
  ];
  
  // Colors for different relation types
  const relationColors = {
    'Ally': '#3b82f6',
    'Economic Partner': '#10b981',
    'Cultural Exchange': '#8b5cf6',
    'Dispute': '#ef4444',
    'Treaty': '#f59e0b'
  };
  
  // Colors for relationship strength
  const strengthColors = {
    'Strong': '#4ade80',
    'Moderate': '#fbbf24',
    'Developing': '#94a3b8'
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
      
      {/* Interactive relationship map visualization */}
      <div className="bg-gradient-to-r from-blue-500/10 to-primary/10 p-6 rounded-xl mb-8 shadow-sm">
        <div className="relative h-64 overflow-hidden rounded-lg bg-white/90">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Central country */}
              <motion.div 
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 
                  w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  <i className="fas fa-flag text-primary text-xl"></i>
                  <p className="text-primary font-bold text-sm mt-1">{countryName}</p>
                </div>
              </motion.div>
              
              {/* Relation connections */}
              {countryRelations.map((relation, index) => {
                // Calculate position in a circle around the center
                const angle = (360 / countryRelations.length) * index * (Math.PI / 180);
                const radius = 110; // Distance from center
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                
                // Line style based on relationship strength
                const lineStyle = relation.strength === 'Strong' 
                  ? 'stroke-[3px]' 
                  : relation.strength === 'Moderate'
                    ? 'stroke-[2px] stroke-dasharray-2'
                    : 'stroke-[1px] stroke-dasharray-4';
                
                return (
                  <motion.div key={relation.country} className="absolute left-1/2 top-1/2 origin-center z-0"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 + (index * 0.1) }}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                  >
                    {/* Connection line */}
                    <svg 
                      className="absolute top-1/2 right-1/2 h-[1px] w-[110px] -z-10" 
                      style={{ 
                        transform: `rotate(${angle + Math.PI}rad)`,
                        transformOrigin: 'right center',
                        stroke: relationColors[relation.type],
                        opacity: 0.7
                      }}
                    >
                      <line 
                        x1="0" 
                        y1="0" 
                        x2="110" 
                        y2="0" 
                        className={lineStyle}
                      />
                    </svg>
                    
                    {/* Country bubble */}
                    <div 
                      className="flex flex-col items-center w-16 h-16 -ml-8 -mt-8"
                    >
                      <div 
                        className="w-14 h-14 rounded-full bg-white shadow-sm border border-gray-200
                        flex items-center justify-center overflow-hidden"
                        style={{ 
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundImage: `url(${relation.flagUrl})` 
                        }}
                      >
                      </div>
                      <div 
                        className="text-xs px-2 py-0.5 rounded-full mt-1 font-medium"
                        style={{ 
                          backgroundColor: `${relationColors[relation.type]}20`, 
                          color: relationColors[relation.type]
                        }}
                      >
                        {relation.country}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-4 gap-4">
          {['Ally', 'Economic Partner', 'Cultural Exchange', 'Treaty', 'Dispute'].map(type => (
            <div 
              key={type} 
              className="flex items-center gap-1"
            >
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: relationColors[type as keyof typeof relationColors] }}
              ></div>
              <span className="text-xs text-gray-700">{type}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Key Partners List */}
      <div className="mb-8">
        <h4 className="font-semibold mb-4">Key International Partners</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {countryRelations.map((relation, index) => (
            <motion.div 
              key={relation.country}
              className="bg-white rounded-lg overflow-hidden shadow-sm relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex p-3 items-center gap-3">
                {relation.flagUrl && (
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
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
                  <h5 className="font-bold text-sm">{relation.country}</h5>
                  <div className="flex items-center mt-1">
                    <i className={`fas ${relationIcons[relation.type]} text-xs mr-1`} 
                      style={{ color: relationColors[relation.type] }}></i>
                    <span className="text-xs text-gray-500">{relation.type}</span>
                  </div>
                </div>
                
                <div 
                  className="w-2 h-10 flex-shrink-0 rounded-sm"
                  style={{ backgroundColor: strengthColors[relation.strength] }}
                ></div>
              </div>
              
              <div 
                className="h-1" 
                style={{ backgroundColor: relationColors[relation.type], opacity: 0.7 }}
              ></div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Diplomatic Activity */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h4 className="font-semibold mb-3">Recent Diplomatic Activity</h4>
        <div className="space-y-3">
          {[
            { event: 'Trade Summit', date: '2023-04-15', countries: ['United States', 'China', 'Japan'] },
            { event: 'Climate Change Conference', date: '2023-02-10', countries: ['Germany', 'France', 'United Kingdom'] },
            { event: 'Cultural Exchange Program', date: '2023-01-22', countries: ['Brazil', 'Argentina'] }
          ].map((activity, index) => (
            <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                <i className="fas fa-globe text-blue-500"></i>
              </div>
              
              <div>
                <h5 className="font-medium text-sm">{activity.event}</h5>
                <div className="flex flex-wrap gap-2 mt-1">
                  {activity.countries.map(country => (
                    <span key={country} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      {country}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InternationalRelations;