import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { InternationalRelation, PoliticalSystem } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, AlertOctagon, Calendar, Users } from 'lucide-react';

// Helper function to determine the header color for conflict cards
function getConflictHeaderColor(type: string): string {
  switch (type?.toLowerCase()) {
    case 'military':
    case 'armed conflict':
    case 'war':
      return 'bg-red-600';
    case 'territorial':
    case 'border dispute':
      return 'bg-amber-600';
    case 'civil':
    case 'civil conflict':
    case 'internal':
      return 'bg-orange-600';
    case 'diplomatic':
    case 'political':
      return 'bg-blue-600';
    case 'economic':
    case 'trade':
    case 'sanctions':
      return 'bg-emerald-600';
    case 'ethnic':
    case 'religious':
      return 'bg-purple-600';
    default:
      return 'bg-gray-600';
  }
}

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
  
  // Custom query function for political system data
  const politicalSystemQueryFn = async () => {
    try {
      const response = await fetch(`/api/countries/${countryId}/political-system`);
      if (response.status === 404) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching political system data:', error);
      return null;
    }
  };
  
  // Fetch political system data for freedom index
  const { data: politicalSystem } = useQuery<PoliticalSystem | null>({
    queryKey: [`/api/countries/${countryId}/political-system`],
    queryFn: politicalSystemQueryFn,
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
                    src={`https://flagcdn.com/${relation.isoCode ? relation.isoCode.toLowerCase() : getCountryCode(relation.partnerCountry).toLowerCase()}.svg`}
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

      {/* Freedom Indicator Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h3 className="text-xl font-bold mb-4">Freedom Indicator</h3>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 border-b">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-sm flex-shrink-0">
                  <i className="fas fa-flag text-sm sm:text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">{countryName}'s Freedom Rating</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Based on political and civil liberties</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-6">
              {politicalSystem?.freedomIndex !== undefined && politicalSystem.freedomIndex !== null ? (
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className="text-sm sm:text-base font-medium">Freedom Index Score</span>
                    <span className="text-base sm:text-lg font-bold">{politicalSystem.freedomIndex}/100</span>
                  </div>
                  
                  <div className="space-y-1 sm:space-y-2">
                    <Progress 
                      value={politicalSystem.freedomIndex} 
                      className="h-2 sm:h-3"
                    />
                    
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Not Free</span>
                      <span className="hidden sm:inline">Partially Free</span>
                      <span className="inline sm:hidden">Partial</span>
                      <span>Free</span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-md p-3 sm:p-4 mt-2 sm:mt-4">
                    <div className="flex items-start">
                      <div className="mt-0.5 sm:mt-1 mr-2 sm:mr-3 flex-shrink-0">
                        {politicalSystem.freedomIndex >= 70 ? (
                          <i className="fas fa-check-circle text-green-500 text-base sm:text-lg"></i>
                        ) : politicalSystem.freedomIndex >= 40 ? (
                          <i className="fas fa-exclamation-circle text-amber-500 text-base sm:text-lg"></i>
                        ) : (
                          <i className="fas fa-times-circle text-red-500 text-base sm:text-lg"></i>
                        )}
                      </div>
                      <div>
                        <h5 className="text-sm sm:text-base font-medium mb-0.5 sm:mb-1">
                          {politicalSystem.freedomIndex >= 70 
                            ? 'Free Society' 
                            : politicalSystem.freedomIndex >= 40 
                              ? 'Partially Free Society' 
                              : 'Not Free Society'}
                        </h5>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {politicalSystem.freedomIndex >= 70 
                            ? 'Strong protection of civil liberties and political rights.'
                            : politicalSystem.freedomIndex >= 40 
                              ? 'Moderate protection of civil liberties with some political restrictions.'
                              : 'Limited civil liberties and significant political restrictions.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Freedom Index Data Available</h4>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                    Freedom index information for {countryName} is currently not available in our database.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Ongoing Conflicts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h3 className="text-xl font-bold mb-4">Ongoing Conflicts</h3>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 sm:p-4 border-b">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 shadow-sm flex-shrink-0">
                  <i className="fas fa-exclamation-triangle text-sm sm:text-xl"></i>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold">Current Conflicts</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Military, territorial, and diplomatic disputes</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-6">
              {politicalSystem?.ongoingConflicts && Array.isArray(politicalSystem.ongoingConflicts) && politicalSystem.ongoingConflicts.length > 0 ? (
                <div className="space-y-3">
                  {politicalSystem.ongoingConflicts.map((conflict: any, index: number) => (
                    <div 
                      key={index} 
                      className="border rounded-md overflow-hidden shadow-sm"
                    >
                      <div className={`p-3 text-white ${getConflictHeaderColor(conflict.type)}`}>
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">{conflict.name}</h5>
                          <span className="text-xs px-2 py-1 bg-white bg-opacity-20 rounded-full">
                            {conflict.type || 'Conflict'}
                          </span>
                        </div>
                      </div>
                      <div className="p-3 bg-white">
                        <div className="flex flex-col space-y-2">
                          {conflict.parties && (
                            <div className="flex items-center text-sm">
                              <Users className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-gray-700">
                                <span className="font-medium">Parties: </span>
                                {conflict.parties}
                              </span>
                            </div>
                          )}
                          
                          {conflict.startYear && (
                            <div className="flex items-center text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-gray-700">
                                <span className="font-medium">Since: </span>
                                {conflict.startYear}
                              </span>
                            </div>
                          )}
                          
                          {conflict.casualties && (
                            <div className="flex items-center text-sm">
                              <AlertOctagon className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="text-gray-700">
                                <span className="font-medium">Casualties: </span>
                                {conflict.casualties}
                              </span>
                            </div>
                          )}
                          
                          {conflict.description && (
                            <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                              {conflict.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-4 sm:py-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                    <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h4 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No Active Conflicts</h4>
                  <p className="text-xs sm:text-sm text-gray-500 max-w-md">
                    {countryName} is not currently involved in any major conflicts or disputes according to our database.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default InternationalRelations;