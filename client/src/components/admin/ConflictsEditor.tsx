import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { PoliticalSystem } from '@shared/schema';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, AlertTriangle, Shield, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface for the component props
interface ConflictsEditorProps {
  countryId: number;
}

// Interface for a conflict
interface Conflict {
  name: string;
  type: string;
  status: string;
  year?: number | null;
  description?: string;
}

// Create a schema for conflict entries
const conflictSchema = z.object({
  name: z.string().min(1, 'Conflict name is required'),
  type: z.string().min(1, 'Conflict type is required'),
  status: z.string().min(1, 'Status is required'),
  year: z.number().int().positive().optional().nullable(),
  description: z.string().optional(),
});

type ConflictFormValues = z.infer<typeof conflictSchema>;

const ConflictsEditor: React.FC<ConflictsEditorProps> = ({ countryId }) => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  // Fetch the political system data for the country
  const { data: politicalSystem, isLoading: isPoliticalSystemLoading, refetch: refetchPoliticalSystem } = useQuery<PoliticalSystem>({
    queryKey: [`/api/countries/${countryId}/political-system`],
    enabled: countryId > 0,
  });

  // Set up the form
  const form = useForm<ConflictFormValues>({
    resolver: zodResolver(conflictSchema),
    defaultValues: {
      name: '',
      type: 'Territorial',
      status: 'Active',
      year: new Date().getFullYear(),
      description: '',
    },
  });

  // When political system data is loaded, update the conflicts state
  useEffect(() => {
    if (politicalSystem && politicalSystem.ongoingConflicts) {
      setConflicts(politicalSystem.ongoingConflicts as Conflict[]);
    }
  }, [politicalSystem]);

  // Reset form when entering edit mode
  useEffect(() => {
    if (editIndex !== null && conflicts[editIndex]) {
      const conflict = conflicts[editIndex];
      form.reset({
        name: conflict.name,
        type: conflict.type,
        status: conflict.status,
        year: conflict.year || null,
        description: conflict.description || '',
      });
    }
  }, [editIndex, conflicts, form]);

  // Handle form submission
  const onSubmit = async (values: ConflictFormValues) => {
    try {
      // Create a new conflicts array
      let updatedConflicts = [...conflicts];
      
      if (editIndex !== null) {
        // Update existing conflict
        updatedConflicts[editIndex] = values;
        setEditIndex(null);
        setIsEditMode(false);
      } else {
        // Add new conflict
        updatedConflicts.push(values);
      }
      
      // Update the political system with the new conflicts
      if (politicalSystem) {
        await apiRequest('PATCH', `/api/countries/${countryId}/political-system/${politicalSystem.id}`, {
          ongoingConflicts: updatedConflicts,
        });
        
        // Refetch to update the UI
        refetchPoliticalSystem();
        
        // Reset the form
        form.reset({
          name: '',
          type: 'Territorial',
          status: 'Active',
          year: new Date().getFullYear(),
          description: '',
        });
        
        // Show success message
        toast({
          title: editIndex !== null ? 'Conflict Updated' : 'Conflict Added',
          description: editIndex !== null 
            ? 'The conflict has been successfully updated.' 
            : 'A new conflict has been added to the country profile.',
        });
      }
      
    } catch (error) {
      console.error('Failed to update conflicts:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the conflicts.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit button click
  const handleEdit = (index: number) => {
    setEditIndex(index);
    setIsEditMode(true);
  };

  // Handle delete button click
  const handleDelete = async (index: number) => {
    try {
      // Remove the conflict at the specified index
      const updatedConflicts = conflicts.filter((_, i) => i !== index);
      
      // Update the political system with the filtered conflicts
      if (politicalSystem) {
        await apiRequest('PATCH', `/api/countries/${countryId}/political-system/${politicalSystem.id}`, {
          ongoingConflicts: updatedConflicts,
        });
        
        // Refetch to update the UI
        refetchPoliticalSystem();
        
        // Show success message
        toast({
          title: 'Conflict Removed',
          description: 'The conflict has been successfully removed.',
        });
      }
      
    } catch (error) {
      console.error('Failed to remove conflict:', error);
      toast({
        title: 'Error',
        description: 'There was an error removing the conflict.',
        variant: 'destructive',
      });
    }
  };

  // Function to get conflict type icon and color
  const getConflictTypeStyle = (type: string) => {
    switch (type) {
      case 'Territorial':
        return { 
          icon: <Crosshair className="h-4 w-4 mr-1" />, 
          color: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'Ethnic':
        return { 
          icon: <AlertTriangle className="h-4 w-4 mr-1" />, 
          color: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      case 'Religious':
        return { 
          icon: <Shield className="h-4 w-4 mr-1" />, 
          color: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      default:
        return { 
          icon: <AlertTriangle className="h-4 w-4 mr-1" />, 
          color: 'bg-gray-100 text-gray-800 border-gray-300'
        };
    }
  };

  // Function to get conflict status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Frozen':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Dormant':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (isPoliticalSystemLoading) {
    return <div>Loading political system data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Current Conflicts List */}
      {conflicts && conflicts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-lg font-medium">Current Conflicts</h3>
          {conflicts.map((conflict, index) => (
            <Card key={index} className="border border-gray-200">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-md font-bold">{conflict.name}</CardTitle>
                    {conflict.year && (
                      <CardDescription>Started: {conflict.year}</CardDescription>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(index)}
                      className="h-8"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      className="h-8 text-red-500 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={cn("flex items-center", getConflictTypeStyle(conflict.type).color)}
                  >
                    {getConflictTypeStyle(conflict.type).icon}
                    {conflict.type}
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className={cn("flex items-center", getStatusStyle(conflict.status))}
                  >
                    {conflict.status}
                  </Badge>
                </div>
                {conflict.description && (
                  <p className="text-sm text-gray-600">{conflict.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-500">No conflicts have been added yet.</p>
        </div>
      )}

      <Separator />

      {/* Add/Edit Conflict Form */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          {isEditMode ? 'Edit Conflict' : 'Add New Conflict'}
        </h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conflict Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Crimea Dispute" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter the name of the conflict or dispute
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conflict Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a conflict type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Territorial">Territorial</SelectItem>
                        <SelectItem value="Ethnic">Ethnic</SelectItem>
                        <SelectItem value="Religious">Religious</SelectItem>
                        <SelectItem value="Political">Political</SelectItem>
                        <SelectItem value="Economic">Economic</SelectItem>
                        <SelectItem value="Civil War">Civil War</SelectItem>
                        <SelectItem value="Diplomatic">Diplomatic</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Frozen">Frozen</SelectItem>
                        <SelectItem value="Dormant">Dormant</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Escalating">Escalating</SelectItem>
                        <SelectItem value="Peace Process">Peace Process</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Started</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 2014" 
                      {...field} 
                      value={field.value === null ? '' : field.value}
                      onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the year when the conflict started (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a brief description of the conflict"
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Briefly describe the nature and context of the conflict (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              {isEditMode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditIndex(null);
                    form.reset({
                      name: '',
                      type: 'Territorial',
                      status: 'Active',
                      year: new Date().getFullYear(),
                      description: '',
                    });
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit">
                {isEditMode ? 'Update Conflict' : 'Add Conflict'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ConflictsEditor;