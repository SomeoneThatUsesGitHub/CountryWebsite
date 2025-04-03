import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { InternationalRelation } from '@shared/schema';

interface InternationalRelationsProps {
  countryName: string;
  countryId: number;
}

// Convert country name to country code for flag URLs
function getCountryCode(countryName: string): string {
  // Common country names to code mapping
  const countryCodeMap: Record<string, string> = {
    'Afghanistan': 'AF',
    'Albania': 'AL',
    'Algeria': 'DZ',
    'Argentina': 'AR',
    'Australia': 'AU',
    'Austria': 'AT',
    'Belgium': 'BE',
    'Brazil': 'BR',
    'Bulgaria': 'BG',
    'Canada': 'CA',
    'Chile': 'CL',
    'China': 'CN',
    'Colombia': 'CO',
    'Croatia': 'HR',
    'Cuba': 'CU',
    'Czech Republic': 'CZ',
    'Denmark': 'DK',
    'Egypt': 'EG',
    'Finland': 'FI',
    'France': 'FR',
    'Germany': 'DE',
    'Greece': 'GR',
    'Hungary': 'HU',
    'Iceland': 'IS',
    'India': 'IN',
    'Indonesia': 'ID',
    'Iran': 'IR',
    'Iraq': 'IQ',
    'Ireland': 'IE',
    'Israel': 'IL',
    'Italy': 'IT',
    'Japan': 'JP',
    'Kazakhstan': 'KZ',
    'Kenya': 'KE',
    'South Korea': 'KR', 
    'Mexico': 'MX',
    'Netherlands': 'NL',
    'New Zealand': 'NZ',
    'Nigeria': 'NG',
    'Norway': 'NO',
    'Pakistan': 'PK',
    'Peru': 'PE',
    'Philippines': 'PH',
    'Poland': 'PL',
    'Portugal': 'PT',
    'Romania': 'RO',
    'Russia': 'RU',
    'Saudi Arabia': 'SA',
    'Serbia': 'RS',
    'Singapore': 'SG',
    'South Africa': 'ZA',
    'Spain': 'ES',
    'Sweden': 'SE',
    'Switzerland': 'CH',
    'Thailand': 'TH',
    'Turkey': 'TR',
    'Ukraine': 'UA',
    'United Arab Emirates': 'AE',
    'United Kingdom': 'GB',
    'United States': 'US',
    'Vietnam': 'VN',
  };
  
  return countryCodeMap[countryName] || 'xx'; // Return 'xx' as fallback for unknown countries
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
    </div>
  );
};

export default InternationalRelations;