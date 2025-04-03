import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { PoliticalSystem } from '@shared/schema';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, AlertCircle, Plus, Edit } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

// Form schema for conflict
const conflictSchema = z.object({
  name: z.string().min(1, 'Conflict name is required'),
  type: z.string().min(1, 'Conflict type is required'),
  parties: z.string().optional(),
  startYear: z.string().optional(),
  casualties: z.string().optional(),
  description: z.string().optional(),
});

// Types
type ConflictFormValues = z.infer<typeof conflictSchema>;

interface ConflictsEditorProps {
  countryId: number;
}

const ConflictsEditor: React.FC<ConflictsEditorProps> = ({ countryId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Custom query function for political system data
  const politicalSystemQueryFn = async () => {
    try {
      const response = await fetch(`/api/countries/${countryId}/political-system`);
      if (response.status === 404) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching political system data:', error);
      return null;
    }
  };
  
  // Fetch political system data
  const { data: politicalSystem, isLoading, refetch } = useQuery<PoliticalSystem | null>({
    queryKey: [`/api/countries/${countryId}/political-system`],
    queryFn: politicalSystemQueryFn,
    enabled: Boolean(countryId),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Initialize conflicts from political system data
  useEffect(() => {
    if (politicalSystem && politicalSystem.ongoingConflicts) {
      try {
        if (Array.isArray(politicalSystem.ongoingConflicts)) {
          setConflicts(politicalSystem.ongoingConflicts);
        } else {
          console.error('ongoingConflicts is not an array:', politicalSystem.ongoingConflicts);
          setConflicts([]);
        }
      } catch (error) {
        console.error('Error parsing ongoing conflicts:', error);
        setConflicts([]);
      }
    } else {
      setConflicts([]);
    }
  }, [politicalSystem]);

  // Setup form
  const form = useForm<ConflictFormValues>({
    resolver: zodResolver(conflictSchema),
    defaultValues: {
      name: '',
      type: 'Military',
      parties: '',
      startYear: '',
      casualties: '',
      description: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: ConflictFormValues) => {
    try {
      // Prepare new conflicts array
      let updatedConflicts;
      
      if (isEditing && editIndex !== null) {
        // Update existing conflict
        updatedConflicts = [...conflicts];
        updatedConflicts[editIndex] = data;
      } else {
        // Add new conflict
        updatedConflicts = [...conflicts, data];
      }
      
      // Get existing political system or create a new one
      const currentSystem = politicalSystem || {
        id: 0,
        countryId,
        type: 'Unknown',
        ongoingConflicts: [],
      };
      
      // Update the political system with new conflicts
      const result = await apiRequest('PATCH', `/api/countries/${countryId}/political-system`, {
        ...currentSystem,
        ongoingConflicts: updatedConflicts,
      });
      
      // Update local state with result and reset form
      setConflicts(updatedConflicts);
      setIsEditing(false);
      setEditIndex(null);
      form.reset({
        name: '',
        type: 'Military',
        parties: '',
        startYear: '',
        casualties: '',
        description: '',
      });
      
      // Invalidate cache and show success toast
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/political-system`] });
      
      toast({
        title: isEditing ? 'Conflict Updated' : 'Conflict Added',
        description: isEditing 
          ? `The conflict "${data.name}" has been updated.` 
          : `The conflict "${data.name}" has been added.`,
      });
      
      // Refetch data
      refetch();
      
    } catch (error) {
      console.error('Failed to save conflict:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the conflict information.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit button click
  const handleEditConflict = (index: number) => {
    const conflict = conflicts[index];
    form.reset({
      name: conflict.name || '',
      type: conflict.type || 'Military',
      parties: conflict.parties || '',
      startYear: conflict.startYear || '',
      casualties: conflict.casualties || '',
      description: conflict.description || '',
    });
    setIsEditing(true);
    setEditIndex(index);
  };

  // Handle delete button click
  const handleDeleteConflict = async (index: number) => {
    if (window.confirm('Are you sure you want to delete this conflict?')) {
      try {
        // Create a copy of conflicts and remove the item at index
        const updatedConflicts = [...conflicts];
        updatedConflicts.splice(index, 1);
        
        // Get existing political system
        const currentSystem = politicalSystem || {
          id: 0,
          countryId,
          type: 'Unknown',
          ongoingConflicts: [],
        };
        
        // Update the political system with new conflicts array
        await apiRequest('PATCH', `/api/countries/${countryId}/political-system`, {
          ...currentSystem,
          ongoingConflicts: updatedConflicts,
        });
        
        // Update local state
        setConflicts(updatedConflicts);
        
        // Invalidate cache and show success toast
        queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/political-system`] });
        
        toast({
          title: 'Conflict Deleted',
          description: 'The conflict has been successfully deleted.',
        });
        
        // Refetch data
        refetch();
        
      } catch (error) {
        console.error('Failed to delete conflict:', error);
        toast({
          title: 'Error',
          description: 'There was an error deleting the conflict.',
          variant: 'destructive',
        });
      }
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditIndex(null);
    form.reset({
      name: '',
      type: 'Military',
      parties: '',
      startYear: '',
      casualties: '',
      description: '',
    });
  };

  // Get color for badge based on conflict type
  const getConflictTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'military':
      case 'armed conflict':
      case 'war':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'territorial':
      case 'border dispute':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'civil':
      case 'civil conflict':
      case 'internal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'diplomatic':
      case 'political':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'economic':
      case 'trade':
      case 'sanctions':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ethnic':
      case 'religious':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">
          {isEditing ? 'Edit Conflict' : 'Add New Conflict'}
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conflict Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Territorial Dispute with Country X" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conflict Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a conflict type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Military">Military Conflict</SelectItem>
                        <SelectItem value="Territorial">Territorial Dispute</SelectItem>
                        <SelectItem value="Civil">Civil Conflict</SelectItem>
                        <SelectItem value="Diplomatic">Diplomatic Tension</SelectItem>
                        <SelectItem value="Economic">Economic Dispute</SelectItem>
                        <SelectItem value="Ethnic">Ethnic Tension</SelectItem>
                        <SelectItem value="Religious">Religious Conflict</SelectItem>
                        <SelectItem value="Political">Political Dispute</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="parties"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Involved Parties</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Country A, Country B, Rebel Group C" />
                    </FormControl>
                    <FormDescription>
                      List all countries or groups involved in this conflict
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Year</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2010" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="casualties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Casualties</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 1,000+" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Provide details about the conflict's background, cause, and current status..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center space-x-2 pt-2">
              <Button 
                type="submit"
                className="flex items-center"
              >
                {isEditing ? (
                  <>
                    <Edit className="mr-2 h-4 w-4" /> Update Conflict
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Add Conflict
                  </>
                )}
              </Button>
              
              {isEditing && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
      
      <Separator className="my-4" />
      
      <div>
        <h3 className="text-lg font-medium mb-4">Ongoing Conflicts</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : conflicts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {conflicts.map((conflict, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4 border-b flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-lg">{conflict.name}</h4>
                      <Badge className={`mt-1 ${getConflictTypeColor(conflict.type)}`}>
                        {conflict.type || 'Conflict'}
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditConflict(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteConflict(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                      {conflict.parties && (
                        <div>
                          <Label className="text-xs text-gray-500">Parties</Label>
                          <p className="text-sm">{conflict.parties}</p>
                        </div>
                      )}
                      
                      {conflict.startYear && (
                        <div>
                          <Label className="text-xs text-gray-500">Since</Label>
                          <p className="text-sm">{conflict.startYear}</p>
                        </div>
                      )}
                      
                      {conflict.casualties && (
                        <div>
                          <Label className="text-xs text-gray-500">Casualties</Label>
                          <p className="text-sm">{conflict.casualties}</p>
                        </div>
                      )}
                    </div>
                    
                    {conflict.description && (
                      <div className="mt-2 pt-2 border-t">
                        <Label className="text-xs text-gray-500">Description</Label>
                        <p className="text-sm mt-1">{conflict.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-gray-50">
            <AlertCircle className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-gray-500">No ongoing conflicts recorded. Add a conflict using the form above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConflictsEditor;