import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PoliticalLeader } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface GovernmentSystemProps {
  countryId: number;
}

const GovernmentSystem: React.FC<GovernmentSystemProps> = ({ countryId }) => {
  // Fetch political leaders for the country
  const { data: leaders = [], isLoading } = useQuery<PoliticalLeader[]>({
    queryKey: [`/api/countries/${countryId}/leaders`],
    enabled: !!countryId,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-muted-foreground">Loading political leaders...</p>
      </div>
    );
  }

  if (leaders.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 space-y-2">
        <p className="text-muted-foreground text-center">No political leaders information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
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

export default GovernmentSystem;