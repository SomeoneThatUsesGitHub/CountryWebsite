import React, { useState } from 'react';
import { TabOption } from '@/types';

interface CountryTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const CountryTabs: React.FC<CountryTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: TabOption[] = [
    { id: 'overview', label: 'Political Overview' },
    { id: 'statistics', label: 'Statistics' },
    { id: 'political-system', label: 'Political System' },
    { id: 'economy', label: 'Economy' }
  ];

  return (
    <div className="bg-white border-b sticky top-0 z-20">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="relative overflow-x-auto">
          <nav className="flex space-x-3 sm:space-x-6 md:space-x-8 py-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`tab-button py-2 sm:py-4 text-sm sm:text-base font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'text-primary border-primary' 
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default CountryTabs;
