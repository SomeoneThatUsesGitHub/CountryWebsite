import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Law {
  id: number;
  title: string;
  description: string;
  date: string;
  category: 'Economic' | 'Social' | 'Environmental' | 'Security' | 'Political Reform';
  status: 'Enacted' | 'Proposed' | 'Under Review';
}

interface RecentLawsProps {
  countryName: string;
  laws?: Law[];
}

const RecentLaws: React.FC<RecentLawsProps> = ({ countryName, laws = [] }) => {
  const [expandedLaw, setExpandedLaw] = useState<number | null>(null);
  
  // Default laws if none provided
  const countryLaws: Law[] = laws.length > 0 ? laws : [
    {
      id: 1,
      title: 'Digital Economy Act',
      description: 'Framework for regulating online businesses, data protection, and digital rights.',
      date: '2023-02-15',
      category: 'Economic',
      status: 'Enacted'
    },
    {
      id: 2,
      title: 'Clean Energy Initiative',
      description: 'Targets for renewable energy adoption and carbon emission reduction.',
      date: '2022-11-22',
      category: 'Environmental',
      status: 'Enacted'
    },
    {
      id: 3,
      title: 'Education Reform Bill',
      description: 'Modernization of curriculum and increased funding for public education.',
      date: '2022-08-05',
      category: 'Social',
      status: 'Enacted'
    },
    {
      id: 4,
      title: 'Electoral System Reform',
      description: 'Changes to voting procedures and campaign finance regulations.',
      date: '2023-03-10',
      category: 'Political Reform',
      status: 'Proposed'
    },
    {
      id: 5,
      title: 'Cybersecurity Enhancement Act',
      description: 'Framework for critical infrastructure protection and cyber threat response.',
      date: '2022-06-18',
      category: 'Security',
      status: 'Under Review'
    }
  ];
  
  // Colors for different categories
  const categoryColors = {
    'Economic': 'bg-blue-100 text-blue-800',
    'Social': 'bg-purple-100 text-purple-800',
    'Environmental': 'bg-green-100 text-green-800',
    'Security': 'bg-red-100 text-red-800',
    'Political Reform': 'bg-amber-100 text-amber-800'
  };
  
  // Icons for different categories
  const categoryIcons = {
    'Economic': 'fa-chart-line',
    'Social': 'fa-users',
    'Environmental': 'fa-leaf',
    'Security': 'fa-shield-alt',
    'Political Reform': 'fa-balance-scale'
  };
  
  // Status colors
  const statusColors = {
    'Enacted': 'bg-green-100 text-green-800',
    'Proposed': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-amber-100 text-amber-800'
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6">Recent Laws & Legislation</h3>
      
      {/* Laws List */}
      <div className="space-y-4">
        {countryLaws.map((law, index) => (
          <motion.div 
            key={law.id}
            className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${
              law.status === 'Enacted' 
                ? 'border-green-500' 
                : law.status === 'Proposed' 
                  ? 'border-blue-500' 
                  : 'border-amber-500'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedLaw(expandedLaw === law.id ? null : law.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[law.category]}`}>
                      {law.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[law.status]}`}>
                      {law.status}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <i className={`fas ${categoryIcons[law.category]} text-gray-400`}></i>
                    {law.title}
                  </h4>
                  
                  <p className="text-sm text-gray-500 mt-1">
                    Passed on {new Date(law.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                
                <i className={`fas fa-chevron-${expandedLaw === law.id ? 'up' : 'down'} text-gray-400`}></i>
              </div>
              
              <p className="text-gray-600 mt-2">
                {law.description}
              </p>
            </div>
            
            {expandedLaw === law.id && (
              <motion.div 
                className="px-4 pb-4 mt-1 border-t border-gray-100 pt-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <h5 className="font-medium text-sm mb-2">Key Provisions</h5>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Primary provision affecting citizens</li>
                    <li>Secondary economic or social impact</li>
                    <li>Implementation timeline and requirements</li>
                  </ul>
                </div>
                
                <div className="flex justify-end">
                  <button className="text-primary text-sm hover:underline">
                    Read Full Text
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Legal System Overview - Simplified */}
      <div className="bg-blue-50 p-5 rounded-lg mt-6">
        <div className="flex items-center mb-2">
          <i className="fas fa-gavel mr-2 text-primary"></i>
          <h4 className="font-semibold">How Laws Are Made in {countryName}</h4>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          {[
            { step: 1, title: 'Bill Proposed', icon: 'fa-file-alt' },
            { step: 2, title: 'Committee Review', icon: 'fa-users' },
            { step: 3, title: 'Parliamentary Vote', icon: 'fa-vote-yea' },
            { step: 4, title: 'Presidential Approval', icon: 'fa-signature' }
          ].map((item) => (
            <div key={item.step} className="flex items-center bg-white p-2 rounded-lg shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mr-2">
                {item.step}
              </div>
              <div className="flex items-center">
                <i className={`fas ${item.icon} text-gray-500 mr-2`}></i>
                <span className="font-medium text-sm">{item.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentLaws;