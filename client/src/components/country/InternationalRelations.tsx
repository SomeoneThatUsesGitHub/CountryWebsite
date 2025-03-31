import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { InternationalRelation } from '@shared/schema';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InternationalRelationsProps {
  countryId: number;
}

// Function to get badge color based on relationship type
const getRelationBadgeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'economic':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'treaty':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'cultural':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'ally':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'military':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Function to get badge color based on relationship strength
const getStrengthBadgeColor = (strength: string | null): string => {
  if (!strength) return 'bg-gray-100 text-gray-800';
  
  switch (strength.toLowerCase()) {
    case 'strong':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'weak':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const InternationalRelations: React.FC<InternationalRelationsProps> = ({ countryId }) => {
  // Fetch international relations for the country
  const { data: relations = [], isLoading } = useQuery<InternationalRelation[]>({
    queryKey: [`/api/countries/${countryId}/relations`],
    enabled: !!countryId,
  });

  // Group relations by type
  const relationsByType: Record<string, InternationalRelation[]> = relations.reduce((acc, relation) => {
    const type = relation.relationType;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(relation);
    return acc;
  }, {} as Record<string, InternationalRelation[]>);

  // Define the order of relation types
  const relationTypeOrder = ['ally', 'military', 'economic', 'treaty', 'cultural'];
  
  // Sort the relation types
  const sortedRelationTypes = Object.keys(relationsByType).sort(
    (a, b) => relationTypeOrder.indexOf(a.toLowerCase()) - relationTypeOrder.indexOf(b.toLowerCase())
  );

  if (isLoading) {
    return <div className="py-6 text-center">Loading international relations...</div>;
  }

  if (relations.length === 0) {
    return (
      <Alert variant="default" className="bg-blue-50 border-blue-200 my-4">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          No international relations information available for this country.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="h-5 w-5 text-blue-600" />
      </div>

      {sortedRelationTypes.map((type) => (
        <div key={type} className="space-y-3">
          <h3 className="font-medium text-lg text-gray-700 flex items-center space-x-2">
            <Badge className={getRelationBadgeColor(type)}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Relations
            </Badge>
          </h3>
          
          <div className="grid grid-cols-1 gap-3">
            {relationsByType[type].map((relation) => (
              <Card key={relation.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{relation.partnerCountry}</h4>
                      {relation.relationStrength && (
                        <Badge className={getStrengthBadgeColor(relation.relationStrength)}>
                          {relation.relationStrength}
                        </Badge>
                      )}
                    </div>
                    {relation.startDate && (
                      <span className="text-sm text-gray-500">
                        Established: {format(new Date(relation.startDate), "MMMM d, yyyy")}
                      </span>
                    )}
                  </div>
                  {relation.details && (
                    <p className="mt-2 text-sm text-gray-600">{relation.details}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
          
          {type !== sortedRelationTypes[sortedRelationTypes.length - 1] && (
            <Separator className="my-4" />
          )}
        </div>
      ))}
    </div>
  );
};

export default InternationalRelations;