import React from 'react';
import { motion } from 'framer-motion';
import { EconomicData, Industry, EconomicChallenge } from '@/types';
import { formatNumber } from '@/lib/helpers';

interface EconomyProps {
  countryName: string;
  economicData?: EconomicData;
}

const Economy: React.FC<EconomyProps> = ({ countryName, economicData }) => {
  // Default economic data if none provided
  const gdp = economicData?.gdp || 100;
  const gdpPerCapita = economicData?.gdpPerCapita || 5000;
  const gdpGrowth = economicData?.gdpGrowth || '3.2%';
  const inflation = economicData?.inflation || '5.1%';
  
  // Industry data with fallbacks
  const industries: Industry[] = economicData?.mainIndustries || [
    { name: 'Agriculture', percentage: 25 },
    { name: 'Manufacturing', percentage: 15 },
    { name: 'Services', percentage: 50 },
    { name: 'Other', percentage: 10 }
  ];
  
  // Trading partners
  const tradingPartners = economicData?.tradingPartners || [
    'United States', 'China', 'European Union', 'Japan', 'India'
  ];
  
  // Economic challenges
  const challenges: EconomicChallenge[] = economicData?.challenges || [
    { 
      title: 'Infrastructure', 
      description: 'Need for improved transportation and power infrastructure',
      icon: 'fa-bolt'
    },
    { 
      title: 'Unemployment', 
      description: 'High unemployment rate, especially among youth',
      icon: 'fa-user-times'
    },
    { 
      title: 'Diversification', 
      description: 'Reducing dependency on dominant sectors',
      icon: 'fa-chart-pie'
    }
  ];
  
  // Economic reforms
  const reforms = economicData?.reforms || [
    'Investment in renewable energy',
    'Digital economy initiatives',
    'Education and workforce development',
    'Tax reform initiatives',
    'Trade agreement expansions'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Economic Overview */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h3 className="text-lg font-bold mb-4">Economic Overview</h3>
        <p className="text-gray-600 mb-4">
          {countryName}'s economy is diverse, with key sectors including services, manufacturing, and agriculture. 
          The country has been focusing on sustainable development and economic diversification in recent years.
        </p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <motion.div 
            className="border border-gray-200 rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-sm text-gray-500 mb-1">GDP</p>
            <p className="text-2xl font-bold text-primary">${gdp}B</p>
          </motion.div>
          
          <motion.div 
            className="border border-gray-200 rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <p className="text-sm text-gray-500 mb-1">GDP Growth</p>
            <p className="text-2xl font-bold text-green-500">{gdpGrowth}</p>
          </motion.div>
          
          <motion.div 
            className="border border-gray-200 rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <p className="text-sm text-gray-500 mb-1">GDP Per Capita</p>
            <p className="text-2xl font-bold text-gray-700">${formatNumber(gdpPerCapita)}</p>
          </motion.div>
          
          <motion.div 
            className="border border-gray-200 rounded-lg p-4 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <p className="text-sm text-gray-500 mb-1">Inflation Rate</p>
            <p className="text-2xl font-bold text-red-500">{inflation}</p>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Key Industries */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h3 className="text-lg font-bold mb-4">Key Industries</h3>
        <div className="space-y-4">
          {industries.map((industry, index) => (
            <div key={industry.name}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">{industry.name}</span>
                <span>{industry.percentage}% of GDP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div 
                  className="h-2.5 rounded-full" 
                  style={{ 
                    width: `${industry.percentage}%`,
                    backgroundColor: index === 0 ? '#3B82F6' : 
                                      index === 1 ? '#10B981' : 
                                      index === 2 ? '#8B5CF6' : 
                                      '#F59E0B' 
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${industry.percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 + (index * 0.1) }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <h4 className="font-semibold mt-6 mb-2">Major Trading Partners</h4>
        <div className="flex flex-wrap gap-2">
          {tradingPartners.map((partner, index) => (
            <motion.div 
              key={partner}
              className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
            >
              <i className="fas fa-globe-americas text-gray-500"></i>
              <span>{partner}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Economic Challenges & Reforms */}
      <motion.div 
        className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="text-lg font-bold mb-4">Economic Challenges & Reforms</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {challenges.map((challenge, index) => (
            <motion.div 
              key={challenge.title}
              className="border border-gray-200 rounded-lg p-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
            >
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                <i className={`fas ${challenge.icon} text-amber-600 text-xl`}></i>
              </div>
              <h4 className="font-semibold text-center mb-2">{challenge.title}</h4>
              <p className="text-sm text-gray-600 text-center">{challenge.description}</p>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6">
          <h4 className="font-semibold mb-2">Recent Economic Reforms</h4>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {reforms.map((reform, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
              >
                {reform}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default Economy;
