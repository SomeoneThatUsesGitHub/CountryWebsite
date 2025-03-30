import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Law {
  id: number;
  title: string;
  description: string;
  date: string;
  category: 'Economic' | 'Social' | 'Environmental' | 'Security' | 'Political Reform';
  impact: 'High' | 'Medium' | 'Low';
  status: 'Enacted' | 'Proposed' | 'Under Review' | 'Rejected';
}

interface RecentLawsProps {
  countryName: string;
  laws?: Law[];
}

const RecentLaws: React.FC<RecentLawsProps> = ({ countryName, laws = [] }) => {
  const [expandedLaw, setExpandedLaw] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Default laws if none provided
  const countryLaws: Law[] = laws.length > 0 ? laws : [
    {
      id: 1,
      title: 'Digital Economy Act',
      description: 'Framework for regulating online businesses, data protection, and digital rights.',
      date: '2023-02-15',
      category: 'Economic',
      impact: 'High',
      status: 'Enacted'
    },
    {
      id: 2,
      title: 'Clean Energy Initiative',
      description: 'Targets for renewable energy adoption and carbon emission reduction.',
      date: '2022-11-22',
      category: 'Environmental',
      impact: 'High',
      status: 'Enacted'
    },
    {
      id: 3,
      title: 'Education Reform Bill',
      description: 'Modernization of curriculum and increased funding for public education.',
      date: '2022-08-05',
      category: 'Social',
      impact: 'Medium',
      status: 'Enacted'
    },
    {
      id: 4,
      title: 'Electoral System Reform',
      description: 'Changes to voting procedures and campaign finance regulations.',
      date: '2023-03-10',
      category: 'Political Reform',
      impact: 'Medium',
      status: 'Proposed'
    },
    {
      id: 5,
      title: 'Cybersecurity Enhancement Act',
      description: 'Framework for critical infrastructure protection and cyber threat response.',
      date: '2022-06-18',
      category: 'Security',
      impact: 'High',
      status: 'Enacted'
    }
  ];
  
  // Get unique categories for filtering
  const categories = Array.from(new Set(countryLaws.map(law => law.category)));
  
  // Filter laws based on selected category
  const filteredLaws = activeFilter 
    ? countryLaws.filter(law => law.category === activeFilter)
    : countryLaws;
  
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
  
  // Colors for different impact levels
  const impactColors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-amber-100 text-amber-800',
    'Low': 'bg-blue-100 text-blue-800'
  };
  
  // Status colors
  const statusColors = {
    'Enacted': 'bg-green-100 text-green-800',
    'Proposed': 'bg-blue-100 text-blue-800',
    'Under Review': 'bg-amber-100 text-amber-800',
    'Rejected': 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="mb-12">
      <h3 className="text-xl font-bold mb-6">Recent Laws & Legislation</h3>
      
      {/* Category filter buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <span className="text-gray-600 font-medium">Filter by:</span>
        <button 
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            activeFilter === null 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setActiveFilter(null)}
        >
          All Categories
        </button>
        
        {categories.map(category => (
          <button 
            key={category}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              activeFilter === category 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Laws List */}
      <div className="space-y-4">
        {filteredLaws.map((law, index) => (
          <motion.div 
            key={law.id}
            className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${
              law.status === 'Enacted' 
                ? 'border-green-500' 
                : law.status === 'Proposed' 
                  ? 'border-blue-500' 
                  : law.status === 'Under Review'
                    ? 'border-amber-500'
                    : 'border-gray-300'
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
                
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${impactColors[law.impact]}`}>
                    {law.impact} Impact
                  </span>
                  <i className={`fas fa-chevron-${expandedLaw === law.id ? 'up' : 'down'} text-gray-400`}></i>
                </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Key Provisions</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Primary provision affecting citizens</li>
                      <li>Secondary economic or social impact</li>
                      <li>Implementation timeline and requirements</li>
                      <li>Enforcement mechanisms and oversight</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Public Opinion</h5>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">65% Support</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                        <div className="bg-red-500 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">35% Oppose</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    <i className="fas fa-gavel mr-1"></i> 
                    Proposed by: Governing Party
                  </span>
                  <button className="text-primary text-sm hover:underline">
                    Read Full Text
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      {/* Legal System Overview */}
      <div className="bg-blue-50 p-6 rounded-lg mt-8">
        <h4 className="font-semibold mb-4">How Laws Are Made in {countryName}</h4>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="relative">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="mb-8 relative">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg mr-4 z-10">
                      {step}
                    </div>
                    <div>
                      <h5 className="font-medium">
                        {step === 1 ? 'Bill Proposed' : 
                         step === 2 ? 'Committee Review' : 
                         step === 3 ? 'Parliamentary Debate' : 
                         'Presidential Approval'}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        {step === 1 ? 'Legislation is drafted and introduced to parliament' : 
                         step === 2 ? 'Specialized committees review and amend the bill' : 
                         step === 3 ? 'Full parliament debates and votes on the proposal' : 
                         'Final approval by the head of state before becoming law'}
                      </p>
                    </div>
                  </div>
                  
                  {index < 3 && (
                    <div className="absolute left-5 top-10 bottom-0 w-0.5 h-8 bg-blue-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 bg-white p-4 rounded-lg">
            <h5 className="font-medium mb-3">Did You Know?</h5>
            <p className="text-sm text-gray-600 mb-4">
              {countryName}'s legislative process typically takes 6-8 months from proposal to implementation. 
              Citizens can participate in the process through public consultations and contacting their representatives.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <h6 className="font-medium text-sm mb-2">Compare to Other Countries</h6>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">United States</span>
                  <span className="text-xs text-gray-500">3-12 months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">United Kingdom</span>
                  <span className="text-xs text-gray-500">4-6 months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">France</span>
                  <span className="text-xs text-gray-500">5-7 months</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentLaws;