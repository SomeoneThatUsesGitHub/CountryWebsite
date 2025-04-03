import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { InternationalRelation } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const relationSchema = z.object({
  id: z.number().optional(),
  partnerCountry: z.string().min(1, 'Partner country is required'),
  countryCode: z.string().min(2, 'Country code should be 2 characters').max(2).nullable(),
  relationType: z.string().min(1, 'Relation type is required'),
  relationStrength: z.string().nullable(),
  details: z.string().nullable(),
  startDate: z.string().nullable().transform(val => val ? new Date(val) : null),
});

type RelationFormValues = z.infer<typeof relationSchema>;

// Helper function to get relation strength color
const getRelationStrengthColor = (strength: string | null) => {
  switch (strength) {
    case 'Strong':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Moderate':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Weak':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'Tense':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'Hostile':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

// Helper function to get relation type color
const getRelationTypeColor = (type: string) => {
  switch (type) {
    case 'Economic':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Military':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'Diplomatic':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Cultural':
      return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'Historical':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Political':
      return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    case 'Environmental':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Scientific':
      return 'bg-cyan-100 text-cyan-800 border-cyan-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

interface RelationsEditorProps {
  countryId: number;
}

const RelationsEditor: React.FC<RelationsEditorProps> = ({ countryId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRelation, setSelectedRelation] = useState<InternationalRelation | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Custom query function that handles 404 responses properly
  const customQueryFn = async () => {
    try {
      const response = await apiRequest<InternationalRelation[]>('GET', `/api/countries/${countryId}/relations`);
      return response;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }
      throw error;
    }
  };

  // Fetch international relations for the selected country
  const {
    data: relations,
    isLoading,
    refetch
  } = useQuery<InternationalRelation[]>({
    queryKey: [`/api/countries/${countryId}/relations`],
    queryFn: customQueryFn,
    enabled: Boolean(countryId),
    staleTime: Infinity, // Prevent continuous refetching
    gcTime: Infinity, // Prevent garbage collection
  });

  const form = useForm<RelationFormValues>({
    resolver: zodResolver(relationSchema),
    defaultValues: {
      partnerCountry: '',
      countryCode: null,
      relationType: 'Diplomatic',
      relationStrength: 'Moderate',
      details: '',
      startDate: null,
    },
  });

  // Reset form when changing between add/edit modes
  useEffect(() => {
    if (isEditing && selectedRelation) {
      // Format the date to YYYY-MM-DD for the input
      const formattedDate = selectedRelation.startDate 
        ? new Date(selectedRelation.startDate).toISOString().split('T')[0]
        : '';
      
      form.reset({
        id: selectedRelation.id,
        partnerCountry: selectedRelation.partnerCountry,
        countryCode: selectedRelation.countryCode || null,
        relationType: selectedRelation.relationType,
        relationStrength: selectedRelation.relationStrength,
        details: selectedRelation.details,
        startDate: formattedDate,
      });
    } else {
      form.reset({
        partnerCountry: '',
        countryCode: null,
        relationType: 'Diplomatic',
        relationStrength: 'Moderate',
        details: '',
        startDate: null,
      });
    }
  }, [isEditing, selectedRelation, form]);

  // Get filtered relations based on activeFilter
  const filteredRelations = activeFilter
    ? relations?.filter(relation => relation.relationType === activeFilter)
    : relations;

  // Handle form submission
  const onSubmit = async (data: RelationFormValues) => {
    try {
      if (isEditing && selectedRelation) {
        // Update existing relation
        await apiRequest('PATCH', `/api/countries/${countryId}/relations/${selectedRelation.id}`, {
          ...data,
          countryId,
        });
        
        toast({
          title: 'Relation Updated',
          description: `International relation with ${data.partnerCountry} has been updated.`,
        });
      } else {
        // Create new relation
        await apiRequest('POST', `/api/countries/${countryId}/relations`, {
          ...data,
          countryId,
        });
        
        toast({
          title: 'Relation Added',
          description: `International relation with ${data.partnerCountry} has been added.`,
        });
      }
      
      // Reset form and state
      form.reset();
      setIsEditing(false);
      setSelectedRelation(null);
      
      // Invalidate cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/relations`] });
      refetch();
    } catch (error) {
      console.error('Failed to save international relation:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the international relation.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit button click
  const handleEditRelation = (relation: InternationalRelation) => {
    setSelectedRelation(relation);
    setIsEditing(true);
  };

  // Handle delete button click
  const handleDeleteRelation = async (relationId: number) => {
    if (confirm('Are you sure you want to delete this international relation?')) {
      try {
        await apiRequest('DELETE', `/api/countries/${countryId}/relations/${relationId}`);
        
        toast({
          title: 'Relation Deleted',
          description: 'The international relation has been successfully deleted.',
        });
        
        // Invalidate cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/relations`] });
        refetch();
      } catch (error) {
        console.error('Failed to delete international relation:', error);
        toast({
          title: 'Error',
          description: 'There was an error deleting the international relation.',
          variant: 'destructive',
        });
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedRelation(null);
    form.reset();
  };

  // Get unique relation types for filter
  const relationTypes = relations 
    ? Array.from(new Set(relations.map(r => r.relationType))) 
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">International Relations</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setIsEditing(false);
            setSelectedRelation(null);
            form.reset();
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Relation
        </Button>
      </div>
      
      {/* Filter tabs */}
      {relations && relations.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger 
              value="all"
              onClick={() => setActiveFilter(null)}
            >
              All
            </TabsTrigger>
            {relationTypes.map(type => (
              <TabsTrigger 
                key={type} 
                value={type}
                onClick={() => setActiveFilter(type)}
              >
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {/* Relations Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="partnerCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., United States" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code (ISO)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., US" 
                      maxLength={2}
                      value={field.value || ''}
                      onChange={(e) => {
                        // Convert to uppercase
                        field.onChange(e.target.value.toUpperCase() || null);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Two-letter ISO country code (e.g., US, GB, DE)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="relationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Economic">Economic</SelectItem>
                        <SelectItem value="Military">Military</SelectItem>
                        <SelectItem value="Diplomatic">Diplomatic</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Historical">Historical</SelectItem>
                        <SelectItem value="Political">Political</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Scientific">Scientific</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="relationStrength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relation Strength</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value || null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select strength" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Strong">Strong</SelectItem>
                        <SelectItem value="Moderate">Moderate</SelectItem>
                        <SelectItem value="Weak">Weak</SelectItem>
                        <SelectItem value="Tense">Tense</SelectItem>
                        <SelectItem value="Hostile">Hostile</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    When this relationship was established
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Details</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Enter details about this international relationship"
                    value={field.value || ''}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2">
            {isEditing && (
              <Button type="button" variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {isEditing ? 'Update Relation' : 'Add Relation'}
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Relations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Relations</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredRelations && filteredRelations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRelations.map((relation) => (
              <Card key={relation.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <div className={`p-4 flex justify-between items-center border-b ${getRelationTypeColor(relation.relationType)}`}>
                      <div className="flex items-center">
                        {relation.countryCode && (
                          <img 
                            src={`https://flagcdn.com/w20/${relation.countryCode.toLowerCase()}.png`}
                            width="20"
                            height="15"
                            className="mr-2"
                            alt={`${relation.partnerCountry} flag`}
                          />
                        )}
                        <h4 className="font-medium">{relation.partnerCountry}</h4>
                        {relation.relationStrength && (
                          <Badge 
                            className={`ml-2 ${getRelationStrengthColor(relation.relationStrength)}`}
                            variant="outline"
                          >
                            {relation.relationStrength}
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditRelation(relation)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteRelation(relation.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="text-sm text-gray-500 mb-2">
                        <span className="font-medium">{relation.relationType} Relationship</span>
                        {relation.startDate && (
                          <span className="ml-2">
                            Since {new Date(relation.startDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {relation.details ? (
                        <p className="text-sm">{relation.details}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No details provided</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50">
            <div className="flex flex-col items-center text-center">
              <AlertCircle className="h-10 w-10 text-gray-400 mb-2" />
              <h4 className="font-medium text-gray-900">No international relations found</h4>
              <p className="text-gray-500 mt-1">
                Add your first international relation using the form above
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationsEditor;