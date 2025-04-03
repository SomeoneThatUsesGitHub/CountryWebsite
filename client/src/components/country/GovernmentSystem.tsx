import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { PoliticalLeader, PoliticalParty, PoliticalSystem } from '@shared/schema';

interface GovernmentSystemProps {
  countryId: number;
}

const GovernmentSystem: React.FC<GovernmentSystemProps> = ({ countryId }) => {
  // Fetch political leaders for the country
  const { 
    data: leaders = [], 
    isLoading: leadersLoading,
    isSuccess: leadersSuccess
  } = useQuery<PoliticalLeader[]>({
    queryKey: [`/api/countries/${countryId}/leaders`],
    enabled: !!countryId,
  });

  // Fetch political parties for the country
  const { 
    data: parties = [], 
    isLoading: partiesLoading,
    isSuccess: partiesSuccess
  } = useQuery<PoliticalParty[]>({
    queryKey: [`/api/countries/${countryId}/parties`],
    enabled: !!countryId,
  });
  
  // Attempt to fetch political system for the country with complete control over retries
  const { 
    data: politicalSystem,
    isLoading: systemLoading,
    isSuccess: systemSuccess,
    isPaused: systemPaused,
    fetchStatus
  } = useQuery<PoliticalSystem>({
    queryKey: [`/api/countries/${countryId}/political-system`],
    enabled: !!countryId,
    retry: false, // Disable retry completely
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    staleTime: Infinity, // Prevent automatic refetching due to staleness
    gcTime: Infinity, // Keep data in cache forever to prevent re-queries
    // This function transforms any error into a successful response with null data
    queryFn: async ({ queryKey }) => {
      try {
        const response = await fetch(queryKey[0] as string);
        if (!response.ok) {
          // For 404s, treat as successful fetch with null data
          if (response.status === 404) {
            return null;
          }
          throw new Error('Network response was not ok');
        }
        return await response.json();
      } catch (error) {
        console.log('Error fetching political system, returning null:', error);
        return null;
      }
    }
  });

  // Consider loading complete when all three queries have finished their network operations
  // regardless of success/error state
  const isLoading = 
    leadersLoading || 
    partiesLoading || 
    (systemLoading && fetchStatus !== 'idle');
  
  // Check if we actually have any meaningful data to display
  const hasNoData = 
    !isLoading && 
    leaders.length === 0 && 
    parties.length === 0;

  // Check if country has an unstable political situation - this needs special handling because it's important
  // We need to handle three cases:
  // 1. System exists and has unstable situation flag set to true
  // 2. System exists but unstable situation flag is false or missing
  // 3. System doesn't exist (handle as stable, since unstable requires explicit opt-in)
  const hasUnstablePoliticalSituation = politicalSystem?.hasUnstablePoliticalSituation === true;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Loading political information...</p>
      </div>
    );
  }

  // Handle the case where there's no meaningful data to display
  if (hasNoData) {
    // For unstable countries, show only the warning alert
    if (hasUnstablePoliticalSituation) {
      return (
        <div className="space-y-8">
          <Alert variant="destructive" className="bg-red-50 border-red-300 text-red-800 mb-6">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              This country is currently experiencing political instability. Detailed information about leadership and political parties is not available at this time.
            </AlertDescription>
          </Alert>
        </div>
      );
    }
    
    // For stable countries with no data, show the default message
    return (
      <div className="space-y-8">
        <div className="flex flex-col justify-center items-center h-48 space-y-2">
          <p className="text-muted-foreground text-center">No political leadership or party information available</p>
        </div>
      </div>
    );
  }

  // Calculate total seats for the parliament visualization
  const totalSeats = parties.length > 0 
    ? parties.reduce((total, party) => total + (party.seats || 0), 0) 
    : 0;

  // Sort parties by seats in descending order
  const sortedParties = [...parties].sort((a, b) => (b.seats || 0) - (a.seats || 0));
  
  // Find ruling party
  const rulingParty = parties.find(party => party.isRuling);

  return (
    <div className="space-y-12 pb-8">
      {/* Unstable political situation alert - shown when there IS actual data */}
      {hasUnstablePoliticalSituation && (
        <Alert variant="destructive" className="bg-red-50 border-red-300 text-red-800 mb-6">
          <AlertTriangle className="h-5 w-5" />
          <AlertDescription className="ml-2">
            This country is currently experiencing political instability. The information below may change frequently.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Section: Political Leaders */}
      {leaders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Political Leaders</h2>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Leader cards */}
            {leaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
            
            {/* Political System Summary Card - Only shown on desktop when there's only 1 leader */}
            {leaders.length === 1 && (
              <div className="hidden lg:col-span-2 lg:block">
                <PoliticalSystemSummaryCard politicalSystem={politicalSystem} countryId={countryId} />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Visual separator between major sections */}
      {leaders.length > 0 && parties.length > 0 && (
        <div className="py-2">
          <Separator className="h-0.5 bg-gray-300" />
        </div>
      )}
      
      {/* Section: Political Parties */}
      {parties.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Political Parties</h2>
          </div>
          
          <Separator className="my-4" />
          
          {/* Ruling Party subsection */}
          {rulingParty && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Ruling Party</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {rulingParty.logoUrl ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden">
                        <img 
                          src={rulingParty.logoUrl} 
                          alt={rulingParty.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                        style={{ backgroundColor: rulingParty.color || '#6366F1' }}
                      >
                        {rulingParty.acronym || rulingParty.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold">{rulingParty.name}</h4>
                      {rulingParty.ideology && (
                        <p className="text-muted-foreground">{rulingParty.ideology}</p>
                      )}
                      {rulingParty.seats && totalSeats > 0 && (
                        <p className="text-sm mt-1">
                          {rulingParty.seats} seats ({Math.round((rulingParty.seats / totalSeats) * 100)}% of parliament)
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Visual separator between subsections */}
          {rulingParty && totalSeats > 0 && (
            <div className="mb-6 mt-4">
              <Separator className="bg-gray-200" />
            </div>
          )}
          
          {/* Parliament Composition subsection */}
          {totalSeats > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Parliament Composition</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="w-full h-6 flex rounded-full overflow-hidden">
                    {sortedParties.map((party, index) => {
                      if (!party.seats) return null;
                      
                      const percentage = (party.seats / totalSeats) * 100;
                      return (
                        <div
                          key={party.id}
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: party.color || `hsl(${(index * 137) % 360}, 70%, 60%)`,
                          }}
                          className="h-full"
                          title={`${party.name}: ${party.seats} seats (${Math.round(percentage)}%)`}
                        />
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-3">
                    {sortedParties.map((party, index) => {
                      if (!party.seats) return null;
                      
                      const percentage = (party.seats / totalSeats) * 100;
                      return (
                        <div key={party.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: party.color || `hsl(${(index * 137) % 360}, 70%, 60%)` }}
                            />
                            <span className="font-medium">{party.name} {party.acronym ? `(${party.acronym})` : ''}</span>
                          </div>
                          <span>{party.seats} seats ({Math.round(percentage)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Visual separator between subsections */}
          {totalSeats > 0 && (
            <div className="mb-6 mt-4">
              <Separator className="bg-gray-200" />
            </div>
          )}
          
          {/* All Parties subsection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">All Parties</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedParties.map((party, index) => (
                <PartyCard key={party.id} party={party} colorIndex={index} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Leader Card Component
interface LeaderCardProps {
  leader: PoliticalLeader;
}

const LeaderCard: React.FC<LeaderCardProps> = ({ leader }) => {
  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-0">
        <div className="relative">
          {leader.imageUrl ? (
            <div className="w-full h-48 overflow-hidden bg-gray-200">
              <img 
                src={leader.imageUrl} 
                alt={leader.name} 
                className="w-full h-full object-cover" 
              />
            </div>
          ) : (
            <div className="w-full h-48 flex items-center justify-center bg-muted">
              <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl">
                {leader.name?.charAt(0) || '?'}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-bold">{leader.name}</h3>
            <p className="text-primary font-medium">{leader.title}</p>
          </div>
          
          {leader.party && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Political Party</p>
              <p>{leader.party}</p>
            </div>
          )}
          
          {leader.startDate && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">In Office Since</p>
              <p>{format(new Date(leader.startDate), 'MMMM d, yyyy')}</p>
            </div>
          )}
          
          {Array.isArray(leader.ideologies) && leader.ideologies.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Ideologies</p>
              <div className="flex flex-wrap gap-1">
                {leader.ideologies.map((ideology, index) => (
                  <span 
                    key={index} 
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {ideology}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Party Card Component
interface PartyCardProps {
  party: PoliticalParty;
  colorIndex: number;
}

const PartyCard: React.FC<PartyCardProps> = ({ party, colorIndex }) => {
  const partyColor = party.color || `hsl(${(colorIndex * 137) % 360}, 70%, 60%)`;
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div 
          className="h-2" 
          style={{ backgroundColor: partyColor }}
        />
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {party.logoUrl ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img 
                      src={party.logoUrl} 
                      alt={party.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: partyColor }}
                  >
                    {party.acronym || party.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold">{party.name}</h3>
                  <div className="flex items-center space-x-2">
                    {party.acronym && <span className="text-sm text-muted-foreground">{party.acronym}</span>}
                    {party.seats && party.totalSeats && (
                      <span className="text-sm text-muted-foreground">
                        {party.seats} seats ({Math.round((party.seats / party.totalSeats) * 100)}%)
                      </span>
                    )}
                    {party.isRuling && (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Ruling
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <CollapsibleTrigger asChild>
                <button className="rounded-full w-8 h-8 inline-flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </CollapsibleTrigger>
            </div>
            
            {party.seats && party.totalSeats && (
              <div className="mt-3">
                <Progress 
                  value={(party.seats / party.totalSeats) * 100} 
                  className="h-2"
                  style={{ backgroundColor: `${partyColor}25` }}
                />
              </div>
            )}
          </div>
          
          <CollapsibleContent>
            <div className="px-4 pb-4 space-y-4 border-t pt-3 mt-1">
              {party.ideology && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Ideology</p>
                  <p>{party.ideology}</p>
                </div>
              )}
              
              {party.foundedYear && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Founded</p>
                  <p>{party.foundedYear}</p>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

// Political System Summary Card Component
interface PoliticalSystemSummaryCardProps {
  politicalSystem: PoliticalSystem | null | undefined;
  countryId: number;
}

const PoliticalSystemSummaryCard: React.FC<PoliticalSystemSummaryCardProps> = ({ politicalSystem, countryId }) => {
  // Government structure branches for the card display
  const governmentBranches = [
    {
      title: 'Executive',
      icon: 'fa-user-tie',
      color: 'bg-blue-100 text-blue-600',
      description: 'Head of government'
    },
    {
      title: 'Legislative',
      icon: 'fa-landmark',
      color: 'bg-green-100 text-green-600',
      description: 'Parliament'
    },
    {
      title: 'Judicial',
      icon: 'fa-balance-scale',
      color: 'bg-amber-100 text-amber-600',
      description: 'Courts'
    }
  ];

  // Core democratic principles for display
  const democraticPrinciples = [
    'Rule of Law', 
    'Freedom of Speech', 
    'Democratic Elections', 
    'Separation of Powers'
  ];

  const systemType = politicalSystem?.type || 'Democratic Republic';
  const hasUnstablePoliticalSituation = politicalSystem?.hasUnstablePoliticalSituation;

  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-primary/10 p-4">
          <h3 className="text-xl font-bold mb-2">Political System</h3>
          <p className="text-muted-foreground">{systemType}</p>
          
          {hasUnstablePoliticalSituation && (
            <Alert variant="destructive" className="mt-3 bg-red-50 border-red-200 py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2 text-sm">
                Currently experiencing political instability
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <div className="p-5 space-y-6">
          <div>
            <h4 className="font-semibold mb-3">Government Structure</h4>
            <div className="grid grid-cols-3 gap-3">
              {governmentBranches.map((branch) => (
                <div key={branch.title} className="text-center">
                  <div className={`w-12 h-12 mx-auto ${branch.color} rounded-full flex items-center justify-center mb-2`}>
                    <i className={`fas ${branch.icon} text-lg`}></i>
                  </div>
                  <div className="text-sm font-medium">{branch.title}</div>
                  <div className="text-xs text-muted-foreground">{branch.description}</div>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-3">Key Principles</h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {democraticPrinciples.map((principle) => (
                <span 
                  key={principle}
                  className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-sm font-medium"
                >
                  {principle}
                </span>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h4 className="font-semibold mb-3">Election System</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-vote-yea"></i>
                  </div>
                  <div>
                    <h5 className="font-medium">Parliamentary Elections</h5>
                    <p className="text-sm text-muted-foreground">Held every 4-5 years</p>
                  </div>
                </div>
                <p className="text-sm">Elections determine the composition of parliament and influence who forms the government.</p>
              </div>
              
              <div className="bg-gray-50 rounded-md p-3">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mr-3">
                    <i className="fas fa-users"></i>
                  </div>
                  <div>
                    <h5 className="font-medium">Electoral System</h5>
                    <p className="text-sm text-muted-foreground">Democratic representation</p>
                  </div>
                </div>
                <p className="text-sm">Combination of proportional representation and direct voting ensures fair democratic processes.</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GovernmentSystem;