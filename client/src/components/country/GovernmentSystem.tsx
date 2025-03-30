import React from 'react';
import { motion } from 'framer-motion';

interface GovernmentProps {
  countryName: string;
  governmentData?: {
    type: 'Democracy' | 'Republic' | 'Monarchy' | 'Authoritarian' | 'Totalitarian' | 'Other';
    details: string;
    rulingParty?: {
      name: string;
      ideology: string;
      leader: string;
      inPowerSince: string;
      logo?: string;
    };
    freedomIndex?: number; // 0-100, higher is more free
    electionSystem?: string;
    branches?: {
      name: string;
      role: string;
      power: 'Strong' | 'Moderate' | 'Limited';
    }[];
  };
}

const GovernmentSystem: React.FC<GovernmentProps> = ({ 
  countryName,
  governmentData
}) => {
  
  // Default government data if none provided
  const government = governmentData || {
    type: 'Democracy' as const,
    details: 'Federal constitutional republic with a strong democratic tradition',
    rulingParty: {
      name: 'Unity Party',
      ideology: 'Center-right, Liberal Conservative',
      leader: 'Jane Smith',
      inPowerSince: '2020',
      logo: undefined
    },
    freedomIndex: 78,
    electionSystem: 'Representative democracy with general elections every 4 years',
    branches: [
      {
        name: 'Executive',
        role: 'Headed by the President who serves as both head of state and government',
        power: 'Strong' as const
      },
      {
        name: 'Legislative',
        role: 'Bicameral parliament with elected representatives',
        power: 'Moderate' as const
      },
      {
        name: 'Judicial',
        role: 'Independent court system with appointed judges',
        power: 'Moderate' as const
      }
    ]
  };
  
  // Colors for government types
  const governmentColors = {
    'Democracy': 'bg-blue-100 text-blue-800 border-blue-200',
    'Republic': 'bg-green-100 text-green-800 border-green-200',
    'Monarchy': 'bg-purple-100 text-purple-800 border-purple-200',
    'Authoritarian': 'bg-amber-100 text-amber-800 border-amber-200',
    'Totalitarian': 'bg-red-100 text-red-800 border-red-200',
    'Other': 'bg-gray-100 text-gray-800 border-gray-200'
  };
  
  // Icons for government types
  const governmentIcons = {
    'Democracy': 'fa-vote-yea',
    'Republic': 'fa-landmark',
    'Monarchy': 'fa-crown',
    'Authoritarian': 'fa-gavel',
    'Totalitarian': 'fa-user-shield',
    'Other': 'fa-university'
  };
  
  // Colors for freedom index
  const getFreedomColor = (index: number) => {
    if (index >= 75) return 'bg-green-500';
    if (index >= 50) return 'bg-yellow-500';
    if (index >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Colors for branch power
  const powerColors = {
    'Strong': 'bg-blue-500',
    'Moderate': 'bg-blue-300',
    'Limited': 'bg-blue-200'
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6">Government & Political System</h3>
      
      {/* Government Type Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`p-4 border-l-4 ${governmentColors[government.type].split(' ').slice(0, 2).join(' ')}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${governmentColors[government.type]}`}>
                  <i className={`fas ${governmentIcons[government.type]} text-lg`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{government.type}</h4>
                  <p className="text-sm text-gray-500">Government System</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3">
                {government.details}
              </p>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Freedom Index</span>
                  <span className="text-sm font-bold">{government.freedomIndex}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${getFreedomColor(government.freedomIndex || 0)}`} 
                    style={{ width: `${government.freedomIndex}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Election System: {government.electionSystem}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Ruling Party Card */}
        <div className="md:col-span-1">
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="p-4">
              <h4 className="font-bold text-lg mb-3">Ruling Party</h4>
              
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {government.rulingParty?.logo ? (
                      <img 
                        src={government.rulingParty.logo} 
                        alt="Party logo" 
                        className="max-w-full max-h-full p-1"
                      />
                    ) : (
                      <i className="fas fa-landmark text-gray-400 text-2xl"></i>
                    )}
                  </div>
                  
                  <div>
                    <h5 className="font-bold">{government.rulingParty?.name}</h5>
                    <p className="text-sm text-gray-500">{government.rulingParty?.ideology}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-user text-gray-400"></i>
                    <span className="text-sm">Leader: <span className="font-medium">{government.rulingParty?.leader}</span></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <i className="fas fa-calendar-alt text-gray-400"></i>
                    <span className="text-sm">In power since: <span className="font-medium">{government.rulingParty?.inPowerSince}</span></span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Government Branches */}
        <div className="md:col-span-1">
          <motion.div 
            className="bg-white rounded-lg shadow-sm overflow-hidden h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="p-4">
              <h4 className="font-bold text-lg mb-3">Government Branches</h4>
              
              <div className="space-y-4">
                {government.branches?.map((branch, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-12 rounded-full flex-shrink-0" style={{ backgroundColor: powerColors[branch.power] }}></div>
                    <div>
                      <h5 className="font-medium">{branch.name}</h5>
                      <p className="text-sm text-gray-600">{branch.role}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 mt-1 inline-block">
                        {branch.power} Power
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Comparison with Similar Systems */}
      <div className="bg-blue-50 rounded-lg p-5">
        <h4 className="font-semibold mb-3">Political Spectrum</h4>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="w-full h-8 bg-gradient-to-r from-red-500 via-gray-300 to-blue-500 rounded-lg mb-2 relative">
            {/* Arrow indicator for where this country falls on the spectrum */}
            <div 
              className="absolute w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-black bottom-full" 
              style={{ left: `${government.freedomIndex ? 100 - government.freedomIndex : 50}%`, transform: 'translateX(-50%)' }}
            ></div>
            
            <div className="flex justify-between px-2 h-full items-center">
              <span className="text-xs font-bold text-white">Authoritarian</span>
              <span className="text-xs font-bold text-white">Democratic</span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mt-3">
            {['North Korea', 'China', 'Russia', countryName, 'Sweden'].map((country, index) => (
              <div 
                key={country}
                className={`text-center text-xs p-1 rounded ${country === countryName ? 'bg-primary/10 font-bold text-primary' : 'bg-gray-100'}`}
              >
                {country}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernmentSystem;