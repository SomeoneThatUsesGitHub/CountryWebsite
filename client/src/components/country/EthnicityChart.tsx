import React from 'react';
import { motion } from 'framer-motion';

interface EthnicGroupProps {
  name: string;
  percentage: number;
}

const EthnicityChart: React.FC<{ ethnicGroups: EthnicGroupProps[] }> = ({ ethnicGroups }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <h3 className="text-lg font-bold mb-4">Major Ethnic Groups</h3>
      <div className="space-y-4">
        {ethnicGroups.map((group, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="font-medium">{group.name}</span>
              <span>{group.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div 
                className="bg-primary h-2.5 rounded-full"
                style={{ width: `${group.percentage}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${group.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const getEthnicGroupsData = (statistics: any[] = []) => {
  const ethnicityStat = statistics.find(s => s.type === 'Ethnicity');
  
  if (ethnicityStat && ethnicityStat.data && Array.isArray(ethnicityStat.data.values)) {
    return ethnicityStat.data.values;
  }
  
  // Default data if no statistics found
  return [
    { name: 'Main Group', percentage: 45 },
    { name: 'Second Group', percentage: 25 },
    { name: 'Third Group', percentage: 15 },
    { name: 'Fourth Group', percentage: 10 },
    { name: 'Others', percentage: 5 },
  ];
};

// Sample data generator for backward compatibility
export const generateSampleEthnicGroups = (countryName: string) => {
  return [
    { name: 'Main Group', percentage: 45 },
    { name: 'Second Group', percentage: 25 },
    { name: 'Third Group', percentage: 15 },
    { name: 'Fourth Group', percentage: 10 },
    { name: 'Others', percentage: 5 },
  ];
};

export default EthnicityChart;
