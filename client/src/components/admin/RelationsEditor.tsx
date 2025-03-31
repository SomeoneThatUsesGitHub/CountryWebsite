import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InternationalRelation, insertInternationalRelationSchema } from '@shared/schema';
import { UseFormReset, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Edit, Plus, Trash2 } from 'lucide-react';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Form Schema for validation
const relationSchema = insertInternationalRelationSchema.extend({
  startDate: z.date().nullable().optional(),
});

type RelationFormValues = z.infer<typeof relationSchema>;

// Component Props
interface RelationsEditorProps {
  countryId: number;
}

// Relationship type options for dropdown
const relationTypes = [
  { value: 'economic', label: 'Economic' },
  { value: 'treaty', label: 'Treaty' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'ally', label: 'Ally' },
  { value: 'military', label: 'Military' }
];

// Relationship strength options for dropdown
const strengthOptions = [
  { value: 'strong', label: 'Strong' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'weak', label: 'Weak' }
];

// Function to get background color based on relationship type
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

// Function to get background color based on relationship strength
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

const RelationsEditor: React.FC<RelationsEditorProps> = ({ countryId }) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const [selectedRelation, setSelectedRelation] = useState<InternationalRelation | null>(null);
  
  // Fetch international relations
  const { data: relations = [], isLoading, refetch } = useQuery<InternationalRelation[]>({
    queryKey: [`/api/countries/${countryId}/relations`],
    enabled: !!countryId,
  });

  // Form setup
  const form = useForm<RelationFormValues>({
    resolver: zodResolver(relationSchema),
    defaultValues: {
      countryId,
      partnerCountry: '',
      relationType: '',
      relationStrength: '',
      details: '',
      startDate: null,
    }
  });

  // Reset form when switching between add and edit modes
  useEffect(() => {
    if (selectedRelation) {
      form.reset({
        ...selectedRelation,
        startDate: selectedRelation.startDate ? new Date(selectedRelation.startDate) : null,
      });
    } else {
      form.reset({
        countryId,
        partnerCountry: '',
        relationType: '',
        relationStrength: '',
        details: '',
        startDate: null,
      });
    }
  }, [selectedRelation, countryId, form]);

  // Handle form submission
  const onSubmit = async (data: RelationFormValues) => {
    try {
      if (editMode && selectedRelation) {
        // Update existing relation
        await apiRequest('PATCH', `/api/countries/${countryId}/relations/${selectedRelation.id}`, data);
        toast({
          title: 'Success',
          description: 'International relation updated successfully.',
        });
      } else {
        // Create new relation
        await apiRequest('POST', `/api/countries/${countryId}/relations`, data);
        toast({
          title: 'Success',
          description: 'International relation added successfully.',
        });
      }

      // Reset form and refetch data
      form.reset({
        countryId,
        partnerCountry: '',
        relationType: '',
        relationStrength: '',
        details: '',
        startDate: null,
      });
      setEditMode(false);
      setSelectedRelation(null);
      refetch();
    } catch (error) {
      console.error('Error saving international relation:', error);
      toast({
        title: 'Error',
        description: 'Failed to save international relation.',
        variant: 'destructive',
      });
    }
  };

  // Handle edit button click
  const handleEdit = (relation: InternationalRelation) => {
    setSelectedRelation(relation);
    setEditMode(true);
  };

  // Handle delete button click
  const handleDelete = async (id: number) => {
    try {
      await apiRequest('DELETE', `/api/countries/${countryId}/relations/${id}`, {});
      toast({
        title: 'Success',
        description: 'International relation deleted successfully.',
      });
      refetch();
    } catch (error) {
      console.error('Error deleting international relation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete international relation.',
        variant: 'destructive',
      });
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    setEditMode(false);
    setSelectedRelation(null);
    form.reset({
      countryId,
      partnerCountry: '',
      relationType: '',
      relationStrength: '',
      details: '',
      startDate: null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Form for adding/editing relations */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="partnerCountry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Partner Country</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter country name" />
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
                  <FormLabel>Relationship Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {relationTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
                  <FormLabel>Relationship Strength</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select strength" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {strengthOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
                  <FormLabel>Relationship Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                  <FormDescription>
                    When the relationship was established
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
                    placeholder="Brief description of the relationship"
                    className="min-h-[100px] resize-y"
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            {editMode && (
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {editMode ? 'Update Relation' : 'Add Relation'}
            </Button>
          </div>
        </form>
      </Form>

      {isLoading ? (
        <p className="text-center py-4">Loading relations...</p>
      ) : relations.length === 0 ? (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            No international relations have been added yet. Use the form above to add relationships with other countries.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {relations.map((relation) => (
            <Card key={relation.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-lg">{relation.partnerCountry}</h3>
                    <Badge className={getRelationBadgeColor(relation.relationType)}>
                      {relation.relationType}
                    </Badge>
                    {relation.relationStrength && (
                      <Badge className={getStrengthBadgeColor(relation.relationStrength)}>
                        {relation.relationStrength}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(relation)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(relation.id)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  {relation.startDate && (
                    <p className="text-sm text-gray-500 mb-2">
                      Established: {format(new Date(relation.startDate), "MMMM d, yyyy")}
                    </p>
                  )}
                  {relation.details && (
                    <p className="text-sm">{relation.details}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelationsEditor;