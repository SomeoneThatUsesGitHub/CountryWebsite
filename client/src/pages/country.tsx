import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Country, TimelineEvent } from '@/types';
import CountryBanner from '@/components/country/CountryBanner';
import CountryTabs from '@/components/country/CountryTabs';
import InteractiveTimeline from '@/components/country/InteractiveTimeline';
import { PopulationChart, GDPChart, ReligionChart, generateSamplePopulationData, generateSampleGDPData, generateSampleReligionData } from '@/components/country/ChartDisplay';
import EthnicityChart, { generateSampleEthnicGroups } from '@/components/country/EthnicityChart';
import PoliticalSystem from '@/components/country/PoliticalSystem';
import Economy from '@/components/country/Economy';
import { Skeleton } from '@/components/ui/skeleton';

const CountryPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch country data
  const { data: country, isLoading, error } = useQuery<Country>({
    queryKey: [`/api/countries/code/${code}`],
  });

  // Sample timeline events for demonstration
  // In a real app, these would come from an API
  const timelineEvents: TimelineEvent[] = [
    {
      id: 1,
      countryId: country?.id || 0,
      title: "National Election",
      description: "The country held its general election, resulting in a new government formation.",
      date: "2023-05-15",
      eventType: "Election"
    },
    {
      id: 2,
      countryId: country?.id || 0,
      title: "Major Policy Reform",
      description: "The government passed a significant reform package aimed at economic growth and social development.",
      date: "2022-11-10",
      eventType: "Legislation"
    },
    {
      id: 3,
      countryId: country?.id || 0,
      title: "International Agreement",
      description: "The country signed a major international trade agreement with neighboring nations.",
      date: "2021-07-22",
      eventType: "Agreement"
    },
    {
      id: 4,
      countryId: country?.id || 0,
      title: "Public Demonstrations",
      description: "Citizens organized peaceful protests demanding political reforms and transparency.",
      date: "2020-10-05",
      eventType: "Protest"
    }
  ];

  useEffect(() => {
    // Scroll to top when navigating to a new country
    window.scrollTo(0, 0);
  }, [code]);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-80 w-full" />
        <div className="container mx-auto px-4 py-6">
          <div className="flex space-x-8 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-8 w-32" />
            ))}
          </div>
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Country</h2>
        <p className="text-gray-600">
          We couldn't find information for this country. Please try another country or go back to the home page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <CountryBanner country={country} />
      
      <CountryTabs 
        activeTab={activeTab} 
        onTabChange={(tabId) => setActiveTab(tabId)} 
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Political Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Political Timeline</h2>
            <div className="max-w-5xl">
              <InteractiveTimeline events={timelineEvents} />
            </div>
          </div>
        )}
        
        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Key Statistics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PopulationChart data={generateSamplePopulationData(country.name)} />
              <GDPChart data={generateSampleGDPData(country.name)} />
              <EthnicityChart ethnicGroups={generateSampleEthnicGroups(country.name)} />
              <ReligionChart data={generateSampleReligionData(country.name)} />
            </div>
          </div>
        )}
        
        {/* Political System Tab */}
        {activeTab === 'political-system' && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Political System</h2>
            <PoliticalSystem 
              countryName={country.name}
              leader={{
                name: "Current Leader",
                title: "President",
                party: "Leading Party",
                startDate: "2022-01-01"
              }}
            />
          </div>
        )}
        
        {/* Economy Tab */}
        {activeTab === 'economy' && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Economy</h2>
            <Economy 
              countryName={country.name}
              economicData={{
                id: 1,
                countryId: country.id,
                gdp: 250,
                gdpPerCapita: 8500,
                gdpGrowth: "3.5%",
                inflation: "4.2%",
                mainIndustries: [
                  { name: "Services", percentage: 55 },
                  { name: "Industry", percentage: 25 },
                  { name: "Agriculture", percentage: 15 },
                  { name: "Other", percentage: 5 }
                ],
                tradingPartners: [
                  "United States", "China", "Germany", "Japan", "United Kingdom"
                ],
                challenges: [
                  { 
                    title: "Infrastructure", 
                    description: "Need for improved transportation and utilities",
                    icon: "fa-road"
                  },
                  { 
                    title: "Diversification", 
                    description: "Reliance on limited sectors",
                    icon: "fa-chart-pie"
                  },
                  { 
                    title: "Sustainability", 
                    description: "Balancing growth with environmental concerns",
                    icon: "fa-leaf"
                  }
                ],
                reforms: [
                  "Digital economy initiatives",
                  "Green energy investment",
                  "Educational reforms",
                  "Tax system modernization",
                  "Public-private partnerships"
                ]
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryPage;
