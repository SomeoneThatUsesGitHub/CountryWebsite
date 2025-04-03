import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Country } from '@/types';
import { groupCountriesByRegion } from '@/lib/helpers';
import ContinentSection from '@/components/home/ContinentSection';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [resetting, setResetting] = useState(false);
  const queryClient = useQueryClient();

  // Fonction pour réinitialiser les données
  const resetAllData = async () => {
    try {
      if (confirm("Êtes-vous sûr de vouloir réinitialiser toutes les données? Cette action supprimera toutes les données existantes.")) {
        setResetting(true);
        toast({
          title: "Réinitialisation en cours",
          description: "Suppression de toutes les données...",
        });
        
        const result = await apiRequest('POST', '/api/debug/reset');
        
        if (result.success) {
          toast({
            title: "Succès",
            description: "Toutes les données ont été réinitialisées. La page va être rechargée.",
          });
          
          // Recharger la page après 2 secondes
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la réinitialisation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser les données.",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  // Fetch all countries
  const { data: countries, isLoading, error } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
  });

  // Group countries by region (continent)
  const groupedCountries = countries ? groupCountriesByRegion(countries) : {};
  
  // Filter countries by search query if provided
  const filteredGroupedCountries = Object.entries(groupedCountries).reduce((acc, [region, countries]) => {
    if (!searchQuery) return groupedCountries;
    
    const filteredCountries = countries.filter(country => 
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (filteredCountries.length > 0) {
      acc[region] = filteredCountries;
    }
    
    return acc;
  }, {} as Record<string, Country[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold text-center flex-grow">Explore Countries by Continent</h2>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={resetAllData}
          disabled={resetting}
          className="text-xs"
        >
          {resetting ? "Réinitialisation..." : "Réinitialiser les données"}
        </Button>
      </div>
      <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
        Discover political systems, economic data, and historical timelines of countries around the world
      </p>
      
      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-12">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search for a country..." 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
            <i className="fas fa-search"></i>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-8">
          {[1, 2].map(i => (
            <div key={i} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-8 w-32" />
                <div className="h-0.5 flex-grow bg-gray-200"></div>
                <Skeleton className="h-6 w-16" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(j => (
                  <div key={j} className="rounded-lg overflow-hidden shadow-sm">
                    <Skeleton className="h-32 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center text-red-500 py-8">
          <i className="fas fa-exclamation-circle text-3xl mb-2"></i>
          <p>Error loading countries. Please try again later.</p>
        </div>
      )}

      {/* Countries by Region */}
      {!isLoading && !error && Object.keys(filteredGroupedCountries).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No countries found matching your search.</p>
        </div>
      )}

      {!isLoading && !error && Object.entries(filteredGroupedCountries).map(([region, countries]) => (
        <ContinentSection 
          key={region} 
          continent={region} 
          countries={countries}
        />
      ))}
    </div>
  );
};

export default HomePage;
