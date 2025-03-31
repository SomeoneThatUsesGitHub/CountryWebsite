import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Country as CountrySchema, TimelineEvent as TimelineEventSchema, PoliticalSystem, EconomicData as EconomicDataSchema } from '@shared/schema';
import { Country, TimelineEvent, EconomicData } from '@/types';
import CountryBanner from '@/components/country/CountryBanner';
import CountryTabs from '@/components/country/CountryTabs';
import InteractiveTimeline from '@/components/country/InteractiveTimeline';
import { PopulationChart, GDPChart, ReligionChart, getPopulationData, getGDPData, getReligionData } from '@/components/country/ChartDisplay';
import EthnicityChart, { getEthnicGroupsData } from '@/components/country/EthnicityChart';
import GovernmentSystem from '@/components/country/GovernmentSystem';
import InternationalRelations from '@/components/country/InternationalRelations';
import Economy from '@/components/country/Economy';
import { Skeleton } from '@/components/ui/skeleton';

const CountryPage: React.FC = () => {
  const [location] = useLocation();
  // Extract alpha3Code from URL query parameter
  let code = '';
  
  // Use window.location.search to get query parameters directly
  const urlParams = new URLSearchParams(window.location.search);
  code = urlParams.get('code') || '';
  
  console.log("Country code from URL:", code);
  console.log("Current location:", location);
  console.log("Window search params:", window.location.search);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch country data
  const { data: country, isLoading: countryLoading, error: countryError } = useQuery<Country>({
    queryKey: [`/api/countries/code/${code}`],
    enabled: code.length > 0, // Only run query if code exists
  });
  
  // Fetch timeline events for the country
  const { data: timelineEvents = [], isLoading: eventsLoading, error: eventsError } = useQuery<TimelineEvent[]>({
    queryKey: [`/api/countries/${country?.id}/timeline`],
    enabled: !!country?.id, // Only run query if country ID exists
  });
  
  // Fetch statistics for the country
  const { data: statistics = [], isLoading: statisticsLoading } = useQuery<any[]>({
    queryKey: [`/api/countries/${country?.id}/statistics`],
    enabled: !!country?.id, // Only run query if country ID exists
  });
  
  // Fetch political system data for the country
  const { data: politicalSystem, isLoading: politicalSystemLoading } = useQuery<PoliticalSystem | undefined>({
    queryKey: [`/api/countries/${country?.id}/political-system`],
    enabled: !!country?.id, // Only run query if country ID exists
  });
  
  // Fetch economic data for the country
  const { data: rawEconomicData, isLoading: economicDataLoading } = useQuery<EconomicDataSchema | undefined>({
    queryKey: [`/api/countries/${country?.id}/economy`],
    enabled: !!country?.id, // Only run query if country ID exists
  });
  
  // Convert the raw economic data to the format expected by the Economy component
  const economicData: EconomicData | undefined = rawEconomicData ? {
    id: rawEconomicData.id,
    countryId: rawEconomicData.countryId,
    gdp: rawEconomicData.gdp ?? undefined,
    gdpPerCapita: rawEconomicData.gdpPerCapita ?? undefined,
    gdpGrowth: rawEconomicData.gdpGrowth ?? undefined,
    inflation: rawEconomicData.inflation ?? undefined,
    mainIndustries: Array.isArray(rawEconomicData.mainIndustries) ? rawEconomicData.mainIndustries : [],
    tradingPartners: Array.isArray(rawEconomicData.tradingPartners) ? rawEconomicData.tradingPartners : [],
    challenges: Array.isArray(rawEconomicData.challenges) ? rawEconomicData.challenges : [],
    reforms: Array.isArray(rawEconomicData.reforms) ? rawEconomicData.reforms : []
  } : undefined;

  useEffect(() => {
    // Scroll to top when navigating to a new country
    window.scrollTo(0, 0);
  }, [code]);

  if (countryLoading || eventsLoading || statisticsLoading || politicalSystemLoading || economicDataLoading) {
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

  if (!country) {
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
              <PopulationChart data={getPopulationData(statistics)} />
              <GDPChart data={getGDPData(statistics)} />
              <EthnicityChart ethnicGroups={getEthnicGroupsData(statistics)} />
              <ReligionChart data={getReligionData(statistics)} />
            </div>
          </div>
        )}
        
        {/* Political System Tab */}
        {activeTab === 'political-system' && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Political System</h2>
            <GovernmentSystem countryId={country.id} />
            <div className="mt-8">
              <InternationalRelations countryName={country.name} countryId={country.id} />
            </div>
          </div>
        )}
        
        {/* Economy Tab */}
        {activeTab === 'economy' && (
          <div>
            <h2 className="text-2xl font-bold mb-8">Economy</h2>
            <Economy 
              countryName={country.name}
              economicData={economicData || {
                id: 0,
                countryId: country.id,
                gdp: 0,
                gdpPerCapita: 0,
                gdpGrowth: "0%",
                inflation: "0%",
                mainIndustries: [],
                tradingPartners: [],
                challenges: [],
                reforms: []
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryPage;
