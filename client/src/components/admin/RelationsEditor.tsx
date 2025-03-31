import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { InternationalRelation } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Trash2Icon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Schema for the form
const relationSchema = z.object({
  partnerCountry: z.string().min(1, 'Partner country is required'),
  relationType: z.string().min(1, 'Relation type is required'),
  relationStrength: z.string().min(1, 'Strength is required'),
  details: z.string().optional().nullable(),
  startDate: z.date().nullable().optional(),
});

type RelationFormValues = z.infer<typeof relationSchema>;

// Relation type options
const relationTypes = [
  'Ally',
  'Economic Partner',
  'Cultural Exchange',
  'Dispute',
  'Treaty',
  'Military Cooperation',
  'Diplomatic Relations',
  'Historical Alliance',
];

// Relation strength options
const relationStrengths = [
  'Strong',
  'Moderate',
  'Weak',
  'Developing',
  'Deteriorating',
];

interface RelationsEditorProps {
  countryId: number;
}

const RelationsEditor: React.FC<RelationsEditorProps> = ({ countryId }) => {
  const [editingRelation, setEditingRelation] = useState<InternationalRelation | null>(null);

  // Fetch international relations for the country
  const {
    data: relations = [],
    isLoading: relationsLoading,
    refetch: refetchRelations,
  } = useQuery<InternationalRelation[]>({
    queryKey: [`/api/countries/${countryId}/relations`],
    enabled: !!countryId,
  });

  // Form setup
  const form = useForm<RelationFormValues>({
    resolver: zodResolver(relationSchema),
    defaultValues: {
      partnerCountry: '',
      relationType: 'Economic Partner',
      relationStrength: 'Moderate',
      details: '',
      startDate: null,
    },
  });

  // Set form values when editing a relation
  React.useEffect(() => {
    if (editingRelation) {
      form.reset({
        partnerCountry: editingRelation.partnerCountry,
        relationType: editingRelation.relationType,
        relationStrength: editingRelation.relationStrength || 'Moderate',
        details: editingRelation.details || '',
        startDate: editingRelation.startDate ? new Date(editingRelation.startDate) : null,
      });
    }
  }, [editingRelation, form]);

  // Create relation mutation
  const createRelationMutation = useMutation({
    mutationFn: async (data: RelationFormValues) => {
      return apiRequest<InternationalRelation>('POST', `/api/countries/${countryId}/relations`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'International relation created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/relations`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create international relation',
        variant: 'destructive',
      });
    },
  });

  // Update relation mutation
  const updateRelationMutation = useMutation({
    mutationFn: async (data: { id: number; formData: RelationFormValues }) => {
      return apiRequest<InternationalRelation>(
        'PATCH',
        `/api/countries/${countryId}/relations/${data.id}`,
        data.formData
      );
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'International relation updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/relations`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update international relation',
        variant: 'destructive',
      });
    },
  });

  // Delete relation mutation
  const deleteRelationMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/countries/${countryId}/relations/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'International relation deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/relations`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete international relation',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: RelationFormValues) => {
    if (editingRelation) {
      updateRelationMutation.mutate({ id: editingRelation.id, formData: data });
    } else {
      createRelationMutation.mutate(data);
    }
  };

  const handleEdit = (relation: InternationalRelation) => {
    setEditingRelation(relation);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this international relation?')) {
      deleteRelationMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingRelation(null);
    form.reset({
      partnerCountry: '',
      relationType: 'Economic Partner',
      relationStrength: 'Moderate',
      details: '',
      startDate: null,
    });
  };

  // Colors for different relation types
  const relationColors: Record<string, string> = {
    'Ally': 'bg-blue-100 text-blue-800 border-blue-300',
    'Economic Partner': 'bg-green-100 text-green-800 border-green-300',
    'Cultural Exchange': 'bg-purple-100 text-purple-800 border-purple-300',
    'Dispute': 'bg-red-100 text-red-800 border-red-300',
    'Treaty': 'bg-amber-100 text-amber-800 border-amber-300',
    'Military Cooperation': 'bg-indigo-100 text-indigo-800 border-indigo-300',
    'Diplomatic Relations': 'bg-cyan-100 text-cyan-800 border-cyan-300',
    'Historical Alliance': 'bg-rose-100 text-rose-800 border-rose-300',
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">International Relations</h3>
        <p className="text-sm text-gray-500">
          Add and manage international relations with other countries
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="partnerCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., United States, Germany" {...field} />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relation type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relationTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strength level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relationStrengths.map((strength) => (
                        <SelectItem key={strength} value={strength}>
                          {strength}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
                    placeholder="Describe the relationship between the countries"
                    className="h-24"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            {editingRelation?.id && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={createRelationMutation.isPending || updateRelationMutation.isPending}>
              {editingRelation?.id ? 'Update Relation' : 'Add Relation'}
            </Button>
          </div>
        </form>
      </Form>

      <Separator className="my-6" />

      <h3 className="text-lg font-medium mb-4">Current International Relations</h3>

      {relationsLoading ? (
        <div className="text-center py-4">
          <p>Loading relations...</p>
        </div>
      ) : relations.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {relations.map((relation) => (
            <Card key={relation.id}>
              <CardContent className="pt-6 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{relation.partnerCountry}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${relationColors[relation.relationType] || 'bg-gray-100'}`}>
                        {relation.relationType}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium mr-2">Strength:</span>
                        <span className="text-sm">{relation.relationStrength}</span>
                      </div>
                      
                      {relation.startDate && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">Since:</span>
                          <span className="text-sm">{new Date(relation.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    
                    {relation.details && (
                      <p className="text-sm text-gray-600 mt-1">{relation.details}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(relation)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(relation.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No international relations added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first relation above</p>
        </div>
      )}
    </div>
  );
};

export default RelationsEditor;