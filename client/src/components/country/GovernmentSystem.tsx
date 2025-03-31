import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PoliticalLeader, PoliticalParty } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

interface GovernmentSystemProps {
  countryId: number;
}

const GovernmentSystem: React.FC<GovernmentSystemProps> = ({ countryId }) => {
  // Fetch political leaders for the country
  const { data: leaders = [], isLoading: leadersLoading } = useQuery<PoliticalLeader[]>({
    queryKey: [`/api/countries/${countryId}/leaders`],
    enabled: !!countryId,
  });

  // Fetch political parties for the country
  const { data: parties = [], isLoading: partiesLoading } = useQuery<PoliticalParty[]>({
    queryKey: [`/api/countries/${countryId}/parties`],
    enabled: !!countryId,
  });

  const isLoading = leadersLoading || partiesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Loading political information...</p>
      </div>
    );
  }

  if (leaders.length === 0 && parties.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 space-y-2">
        <p className="text-muted-foreground text-center">No political information available</p>
      </div>
    );
  }

  // Calculate total seats for the parliament visualization
  const totalSeats = parties.length > 0 
    ? parties.reduce((total, party) => total + (party.seats || 0), 0) 
    : 0;

  // Sort parties by seats in descending order
  const sortedParties = [...parties].sort((a, b) => (b.seats || -1) - (a.seats || -1));
  
  // Find ruling party
  const rulingParty = parties.find(party => party.isRuling);

  return (
    <div className="space-y-12 pb-8">
      {leaders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Political Leaders</h2>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} />
            ))}
          </div>
        </div>
      )}
      
      {parties.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Political Parties</h2>
          </div>
          
          <Separator className="my-4" />
          
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedParties.map((party, index) => (
              <PartyCard key={party.id} party={party} colorIndex={index} />
            ))}
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

export default GovernmentSystem;