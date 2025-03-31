import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PoliticalLeader } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';

interface GovernmentProps {
  countryName: string;
  countryId: number;
  governmentData?: {
    type: 'Democracy' | 'Republic' | 'Monarchy' | 'Authoritarian' | 'Totalitarian' | 'Other';
    details: string;
    freedomIndex?: number; // 0-100, higher is more free
    electionSystem?: string;
  };
}

const GovernmentSystem: React.FC<GovernmentProps> = ({ 
  countryName,
  countryId,
  governmentData
}) => {
  // Fetch political leaders data
  const { data: serverLeaders = [], isLoading: leadersLoading } = useQuery<PoliticalLeader[]>({
    queryKey: [`/api/countries/${countryId}/leaders`],
    enabled: !!countryId, // Only run query if country ID exists
  });
  
  // Add sample leader for demonstration purposes
  const leaders = serverLeaders.length > 0 ? serverLeaders : [
    {
      id: 999,
      countryId: countryId,
      name: countryName === "United States" ? "Joseph R. Biden" : `Current Leader of ${countryName}`,
      title: countryName === "United States" ? "President" : "Head of Government",
      party: countryName === "United States" ? "Democratic Party" : "Majority Party",
      imageUrl: null,
      startDate: new Date("2021-01-20"),
      ideologies: ["Democracy", "Liberalism", "Federalism"]
    }
  ];

  return (
    <div className="space-y-8">
      {/* Empty state for political system as per user request */}
      <motion.div 
        className="flex items-center justify-center h-32 bg-gray-100 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-gray-500 text-lg">Political System content has been removed</p>
      </motion.div>
      
      {/* Political Leaders section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Political Leaders</h3>
        
        {leadersLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : leaders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leaders.map((leader) => (
              <motion.div 
                key={leader.id}
                className="bg-white border rounded-lg shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-start p-4">
                  {leader.imageUrl ? (
                    <div className="flex-shrink-0 mr-4">
                      <img 
                        src={leader.imageUrl} 
                        alt={leader.name} 
                        className="w-20 h-20 object-cover rounded-full border-2 border-primary/20"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 mr-4 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{leader.name}</h4>
                    <p className="text-primary font-medium">{leader.title}</p>
                    
                    {leader.party && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Party:</span> {leader.party}
                      </p>
                    )}
                    
                    {leader.startDate && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Since:</span> {new Date(leader.startDate).toLocaleDateString()}
                      </p>
                    )}
                    
                    {Array.isArray(leader.ideologies) && leader.ideologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {leader.ideologies.map((ideology, index) => (
                          <span key={index} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                            {ideology}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-500">No political leaders information available for {countryName}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GovernmentSystem;