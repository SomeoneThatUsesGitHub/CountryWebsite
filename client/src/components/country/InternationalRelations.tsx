import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { InternationalRelation } from '@shared/schema';

interface InternationalRelationsProps {
  countryName: string;
  countryId: number;
}

const InternationalRelations: React.FC<InternationalRelationsProps> = ({ 
  countryName, 
  countryId
}) => {
  // Custom query function that handles 404 responses properly
  const customQueryFn = async () => {
    try {
      const response = await fetch(`/api/countries/${countryId}/relations`);
      if (response.status === 404) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching international relations:', error);
      return [];
    }
  };

  // Fetch relations from the API
  const { data: relations, isLoading } = useQuery<InternationalRelation[]>({
    queryKey: [`/api/countries/${countryId}/relations`],
    queryFn: customQueryFn,
    enabled: Boolean(countryId),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  
  // Colors for different relation types
  const relationTypeColors = {
    'Economic': 'bg-emerald-100 text-emerald-800 border-emerald-300',
    'Military': 'bg-red-100 text-red-800 border-red-300',
    'Diplomatic': 'bg-blue-100 text-blue-800 border-blue-300',
    'Cultural': 'bg-purple-100 text-purple-800 border-purple-300',
    'Historical': 'bg-amber-100 text-amber-800 border-amber-300',
    'Political': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'Environmental': 'bg-green-100 text-green-800 border-green-300',
    'Scientific': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'default': 'bg-gray-100 text-gray-800 border-gray-300'
  };
  
  // Get the appropriate color class for a relation type
  const getRelationTypeColor = (type: string) => {
    return relationTypeColors[type as keyof typeof relationTypeColors] || relationTypeColors.default;
  };
  
  // Colors for relationship strength
  const strengthColors = {
    'Strong': 'bg-green-100 text-green-800 border-green-300',
    'Moderate': 'bg-blue-100 text-blue-800 border-blue-300',
    'Weak': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Tense': 'bg-orange-100 text-orange-800 border-orange-300',
    'Hostile': 'bg-red-100 text-red-800 border-red-300',
    'default': 'bg-gray-100 text-gray-800 border-gray-300'
  };
  
  // Get the appropriate color class for relation strength
  const getStrengthColor = (strength: string | null) => {
    if (!strength) return strengthColors.default;
    return strengthColors[strength as keyof typeof strengthColors] || strengthColors.default;
  };
  
  // Bar width for relationship strength
  const strengthWidth = {
    'Strong': 'w-full',
    'Moderate': 'w-2/3',
    'Weak': 'w-1/3',
    'Tense': 'w-1/2',
    'Hostile': 'w-1/4',
    'default': 'w-1/2'
  };
  
  // Get the appropriate width class for relation strength
  const getStrengthWidth = (strength: string | null) => {
    if (!strength) return strengthWidth.default;
    return strengthWidth[strength as keyof typeof strengthWidth] || strengthWidth.default;
  };
  
  // Icons for different relation types
  const relationTypeIcons = {
    'Economic': 'fa-chart-line',
    'Military': 'fa-shield-alt',
    'Diplomatic': 'fa-handshake',
    'Cultural': 'fa-university',
    'Historical': 'fa-history',
    'Political': 'fa-landmark',
    'Environmental': 'fa-leaf',
    'Scientific': 'fa-microscope',
    'default': 'fa-globe'
  };
  
  // Get the appropriate icon for a relation type
  const getRelationTypeIcon = (type: string) => {
    return relationTypeIcons[type as keyof typeof relationTypeIcons] || relationTypeIcons.default;
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6">International Relations</h3>
      
      {/* Key Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {isLoading ? (
          <div className="col-span-2 flex justify-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : relations && relations.length > 0 ? (
          relations.map((relation, index) => (
            <motion.div 
              key={relation.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`flex items-center p-3 gap-3 ${getRelationTypeColor(relation.relationType)}`}>
                {/* Country Flag */}
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white flex-shrink-0 shadow-sm">
                  <img 
                    src={`https://flagcdn.com/${getCountryCode(relation.partnerCountry).toLowerCase()}.svg`}
                    alt={`${relation.partnerCountry} flag`} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/40x40?text=Flag';
                    }}
                  />
                </div>
                
                <div className="flex-grow">
                  <h5 className="font-bold text-lg">{relation.partnerCountry}</h5>
                  <div className="flex items-center">
                    <i className={`fas ${getRelationTypeIcon(relation.relationType)} mr-1`}></i>
                    <span className="text-sm font-medium">
                      {relation.relationType}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">Relationship Strength</span>
                    <span className="text-gray-500">
                      {relation.relationStrength || 'Not specified'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-primary ${getStrengthWidth(relation.relationStrength)}`}
                    ></div>
                  </div>
                </div>
                
                {relation.startDate && (
                  <div className="text-xs text-gray-500 mb-2">
                    Established: {new Date(relation.startDate).toLocaleDateString()}
                  </div>
                )}
                
                <p className="text-gray-600 text-sm">
                  {relation.details || 'No additional details available.'}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-2 flex justify-center items-center p-8 border rounded-lg bg-gray-50">
            <div className="text-center">
              <i className="fas fa-handshake text-gray-300 text-4xl mb-2"></i>
              <p className="text-gray-500">No international relations found for {countryName}.</p>
            </div>
          </div>
        )}
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