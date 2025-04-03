import React from 'react';
import { motion } from 'framer-motion';
import InternationalRelations from './InternationalRelations';
import RecentLaws from './RecentLaws';

interface PoliticalSystemProps {
  countryName: string;
  countryId?: number;
  leader?: {
    name: string;
    title: string;
    party?: string;
    imageUrl?: string;
    startDate?: string;
  };
}

const PoliticalSystem: React.FC<PoliticalSystemProps> = ({ countryName, countryId = 0, leader }) => {
  // Default leader info if none provided
  const leaderInfo = leader || {
    name: 'Current Leader',
    title: 'Leader',
    party: 'Leading Party',
    imageUrl: 'https://via.placeholder.com/300x300?text=Leader',
    startDate: new Date().toISOString()
  };

  const inOfficeDate = leaderInfo.startDate 
    ? new Date(leaderInfo.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Current';

  // Government structure branches
  const governmentBranches = [
    {
      title: 'Executive',
      icon: 'fa-user',
      color: 'bg-blue-100 text-primary',
      description: `${leader?.title || 'Leader'} serves as head of government`
    },
    {
      title: 'Legislative',
      icon: 'fa-landmark',
      color: 'bg-green-100 text-green-600',
      description: 'Parliament responsible for making laws'
    },
    {
      title: 'Judicial',
      icon: 'fa-balance-scale',
      color: 'bg-red-100 text-red-600',
      description: 'Courts interpret laws and administer justice'
    }
  ];

  // Political ideologies
  const ideologies = ['Democracy', 'Federalism', 'Secularism', 'Multi-party System'];

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Current Leader */}
        <motion.div 
          className="bg-white p-6 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="text-lg font-bold mb-4">Current Leader</h3>
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
              <img 
                src={leaderInfo.imageUrl} 
                alt={leaderInfo.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'https://via.placeholder.com/300x300?text=Leader';
                }}
              />
            </div>
            <h4 className="text-xl font-semibold">{leaderInfo.name}</h4>
            <p className="text-gray-600 mb-2">{leaderInfo.title}</p>
            {leaderInfo.party && (
              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
                {leaderInfo.party}
              </div>
            )}
            <p className="text-sm text-gray-600 text-center">In office since {inOfficeDate}</p>
          </div>
        </motion.div>
        
        {/* Government Structure */}
        <motion.div 
          className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h3 className="text-lg font-bold mb-4">Government Structure</h3>
          <p className="text-gray-600 mb-4">
            {countryName} operates with a democratic system of governance, comprising three distinct branches:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {governmentBranches.map((branch, index) => (
              <motion.div 
                key={branch.title}
                className="border border-gray-200 rounded-lg p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + (index * 0.1) }}
              >
                <div className={`w-12 h-12 ${branch.color} rounded-full flex items-center justify-center mb-3 mx-auto`}>
                  <i className={`fas ${branch.icon} text-xl`}></i>
                </div>
                <h4 className="font-semibold text-center mb-2">{branch.title}</h4>
                <p className="text-sm text-gray-600 text-center">{branch.description}</p>
              </motion.div>
            ))}
          </div>
          
          <h4 className="font-semibold mb-2">Political Ideologies</h4>
          <div className="flex flex-wrap gap-2 mb-4">
            {ideologies.map((ideology, index) => (
              <motion.span 
                key={ideology}
                className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
              >
                {ideology}
              </motion.span>
            ))}
          </div>
          
          <h4 className="font-semibold mb-2">Administrative Divisions</h4>
          <p className="text-gray-600">
            {countryName} is divided into administrative regions, with each having local government representatives.
          </p>
        </motion.div>
      </div>
      
      {/* International Relations Section */}
      <InternationalRelations countryName={countryName} countryId={countryId} />
      
      {/* Recent Laws Section */}
      <RecentLaws countryName={countryName} />
    </div>
  );
};

export default PoliticalSystem;
