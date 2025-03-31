import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Globe, Award, Gavel, Crown, BookOpen } from 'lucide-react';

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
    leader?: {
      name: string;
      title: string;
      photoUrl?: string;
      age: number;
      inOfficeSince: string;
      previousRole?: string;
    };
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
    leader: {
      name: 'John Doe',
      title: 'President',
      photoUrl: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      age: 58,
      inOfficeSince: '2020',
      previousRole: 'Governor of Eastern Province'
    }
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
  
  // Government branches
  const governmentBranches = [
    {
      name: 'Executive',
      description: 'The branch responsible for implementing and enforcing laws',
      icon: <Crown className="h-5 w-5" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      power: 'Prime Minister/President leads the government'
    },
    {
      name: 'Legislative',
      description: 'The branch responsible for making laws',
      icon: <BookOpen className="h-5 w-5" />,
      color: 'bg-green-50 border-green-200 text-green-700',
      power: 'Parliament/Congress debates and passes legislation'
    },
    {
      name: 'Judicial',
      description: 'The branch responsible for interpreting laws',
      icon: <Gavel className="h-5 w-5" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
      power: 'Courts ensure laws comply with the constitution'
    }
  ];

  // Key democratic principles 
  const democraticPrinciples = [
    {
      name: 'Free Elections',
      description: 'Regular elections where citizens choose their representatives',
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      name: 'Rule of Law',
      description: 'All citizens, including leaders, are bound by the same laws',
      icon: <Gavel className="h-5 w-5" />,
    },
    {
      name: 'Civil Rights',
      description: 'Protected freedoms such as speech, religion, and assembly',
      icon: <Award className="h-5 w-5" />,
    },
    {
      name: 'Transparency',
      description: 'Government actions and decisions are open to public scrutiny',
      icon: <Globe className="h-5 w-5" />,
    }
  ];

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6">Government & Political System</h3>
      
      {/* Government System Card - Top Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col md:flex-row">
          {/* Government Type Column */}
          <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${governmentColors[government.type]}`}>
                  <i className={`fas ${governmentIcons[government.type]} text-lg`}></i>
                </div>
                <div>
                  <h4 className="font-bold text-lg">{government.type}</h4>
                  <p className="text-sm text-gray-500">Form of Government</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                {government.details}
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Freedom Index</span>
                  <span className="text-sm font-bold">{government.freedomIndex}/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                  <div 
                    className={`h-2.5 rounded-full ${getFreedomColor(government.freedomIndex || 0)}`} 
                    style={{ width: `${government.freedomIndex}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className={`w-3 h-3 rounded-full ${getFreedomColor(government.freedomIndex || 0)}`}></span>
                  <span className="text-gray-700">{government.freedomIndex || 0 >= 75 ? 'Free' : government.freedomIndex || 0 >= 50 ? 'Partly Free' : 'Not Free'}</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Power Structure Column */}
          <div className="md:w-2/3 p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h4 className="font-bold text-lg mb-4">Power Structure</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {governmentBranches.map((branch, index) => (
                  <div 
                    key={branch.name} 
                    className={`p-4 rounded-lg border ${branch.color} flex flex-col`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {branch.icon}
                      <h5 className="font-semibold">{branch.name}</h5>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{branch.description}</p>
                    <p className="text-xs font-medium mt-auto">{branch.power}</p>
                  </div>
                ))}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-vote-yea text-primary"></i>
                  <h5 className="font-medium text-sm">Election System</h5>
                </div>
                <p className="text-sm text-gray-600">{government.electionSystem}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Leadership and Party Section - 2 Column Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Leader Card */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="p-6">
            <h4 className="font-bold text-lg mb-4">Current Leadership</h4>
            
            <div className="flex items-center gap-5">
              <div className="shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm">
                  <img 
                    src={government.leader?.photoUrl || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                    alt="Leader portrait" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              <div>
                <h5 className="font-bold text-lg">{government.leader?.name || "John Doe"}</h5>
                <p className="text-primary font-medium">{government.leader?.title || "President"}</p>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                  <span>Age: {government.leader?.age || 58}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Since {government.leader?.inOfficeSince || "2020"}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h6 className="font-medium text-sm mb-1">Previous Role</h6>
                <p className="text-sm text-gray-600">{government.leader?.previousRole || "Governor"}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h6 className="font-medium text-sm mb-1">Political Party</h6>
                <p className="text-sm text-gray-600">{government.rulingParty?.name}</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Ruling Party Card */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="p-6">
            <h4 className="font-bold text-lg mb-4">Ruling Party</h4>
            
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 bg-primary/5 rounded-full border-2 border-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                <img 
                  src="https://via.placeholder.com/100x100?text=Party"
                  alt="Party logo" 
                  className="max-w-full max-h-full p-1"
                />
              </div>
              
              <div>
                <h5 className="font-bold text-lg">{government.rulingParty?.name}</h5>
                <span className="text-sm text-gray-600 bg-primary/5 px-3 py-1 rounded-full inline-block mt-1">
                  {government.rulingParty?.ideology}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h6 className="font-medium text-sm mb-1">Party Leader</h6>
                <p className="text-sm text-gray-600">{government.rulingParty?.leader}</p>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <h6 className="font-medium text-sm mb-1">In Power Since</h6>
                <p className="text-sm text-gray-600">{government.rulingParty?.inPowerSince}</p>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-info-circle text-blue-500"></i>
                <h6 className="font-medium text-sm">Key Policy Positions</h6>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500 w-4"></i>
                  <span>Economic development and job creation</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500 w-4"></i>
                  <span>National security and defense</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500 w-4"></i>
                  <span>Public healthcare and education reform</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Democratic Principles Section */}
      <motion.div 
        className="bg-white rounded-lg shadow-sm overflow-hidden mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-6">
          <h4 className="font-bold text-lg mb-4">Key Democratic Principles</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {democraticPrinciples.map((principle) => (
              <div key={principle.name} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2 text-primary">
                  {principle.icon}
                  <h5 className="font-semibold text-sm">{principle.name}</h5>
                </div>
                <p className="text-xs text-gray-600">{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Political Spectrum Visualization */}
      <motion.div 
        className="bg-gray-50 rounded-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h4 className="font-semibold mb-4">Political Spectrum Position</h4>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="mb-6">
            <div className="text-sm font-medium mb-2">Democratic Freedom Scale</div>
            <div className="w-full h-8 bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 rounded-lg relative">
              {/* Arrow indicator for where this country falls on the spectrum */}
              <div 
                className="absolute w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-black bottom-full" 
                style={{ left: `${government.freedomIndex}%`, transform: 'translateX(-50%)' }}
              ></div>
              
              <div className="flex justify-between px-4 h-full items-center text-white font-semibold text-xs">
                <span>Authoritarian</span>
                <span>Partly Free</span>
                <span>Democratic</span>
              </div>
            </div>
            
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2">
              {['North Korea', 'China', 'Russia', countryName, 'Sweden'].map((country, index) => (
                <div 
                  key={country}
                  className={`text-center py-2 px-1 rounded text-sm ${country === countryName ? 'bg-primary/10 font-bold text-primary' : 'bg-gray-100'}`}
                >
                  {country}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center bg-red-100 rounded py-1 text-xs text-red-800">
                <span>0-19</span>
              </div>
              <div className="text-center bg-orange-100 rounded py-1 text-xs text-orange-800">
                <span>20-39</span>
              </div>
              <div className="text-center bg-yellow-100 rounded py-1 text-xs text-yellow-800">
                <span>40-59</span>
              </div>
              <div className="text-center bg-lime-100 rounded py-1 text-xs text-lime-800">
                <span>60-79</span>
              </div>
              <div className="text-center bg-green-100 rounded py-1 text-xs text-green-800">
                <span>80-100</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GovernmentSystem;