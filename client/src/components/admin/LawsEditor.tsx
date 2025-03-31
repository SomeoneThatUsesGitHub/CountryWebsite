import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HistoricalLaw } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/helpers';
import { PlusCircle, Edit2, Trash2, AlertCircle } from 'lucide-react';

// Law categories
const lawCategories = [
  'Economic',
  'Social',
  'Environmental',
  'Security',
  'Political Reform',
  'Civil Rights',
  'Constitutional',
  'Education',
  'Healthcare',
  'Labor',
  'Other'
];

// Law statuses
const lawStatuses = [
  'Enacted',
  'Proposed',
  'Under Review',
  'Repealed',
  'Amended'
];

// Define the law schema
const lawSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.string().optional().nullable(),
  category: z.string().min(1, 'Category is required'),
  status: z.string().min(1, 'Status is required'),
});

type LawFormValues = z.infer<typeof lawSchema>;

interface LawsEditorProps {
  countryId: number;
}

const LawsEditor: React.FC<LawsEditorProps> = ({ countryId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLaw, setSelectedLaw] = useState<HistoricalLaw | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Custom query function that handles 404 responses properly
  const customQueryFn = async () => {
    try {
      const response = await apiRequest<HistoricalLaw[]>('GET', `/api/countries/${countryId}/laws`);
      return response;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return [];
      }
      throw error;
    }
  };

  // Fetch historical laws for the selected country
  const {
    data: laws,
    isLoading,
    refetch
  } = useQuery<HistoricalLaw[]>({
    queryKey: [`/api/countries/${countryId}/laws`],
    queryFn: customQueryFn,
    enabled: Boolean(countryId),
    staleTime: Infinity, // Prevent continuous refetching
    gcTime: Infinity, // Prevent garbage collection
  });

  const form = useForm<LawFormValues>({
    resolver: zodResolver(lawSchema),
    defaultValues: {
      title: '',
      description: '',
      date: null,
      category: 'Economic',
      status: 'Enacted',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LawFormValues) => {
    try {
      if (isEditing && selectedLaw) {
        // Update existing law
        await apiRequest('PATCH', `/api/countries/${countryId}/laws/${selectedLaw.id}`, data);
        toast({
          title: 'Success',
          description: 'Historical law updated successfully',
        });
      } else {
        // Create new law
        await apiRequest('POST', `/api/countries/${countryId}/laws`, {
          ...data,
          countryId,
        });
        toast({
          title: 'Success',
          description: 'New historical law added successfully',
        });
      }

      // Reset form and state
      form.reset();
      setSelectedLaw(null);
      setIsEditing(false);

      // Invalidate the query to refetch
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/laws`] });
      await refetch();
    } catch (error) {
      console.error('Error saving historical law:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the historical law',
        variant: 'destructive',
      });
    }
  };

  // Handle edit
  const handleEdit = (law: HistoricalLaw) => {
    setSelectedLaw(law);
    setIsEditing(true);
    form.reset({
      title: law.title,
      description: law.description || '',
      date: law.date ? new Date(law.date).toISOString().split('T')[0] : null,
      category: law.category || 'Economic',
      status: law.status || 'Enacted',
    });
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this historical law?')) {
      return;
    }

    try {
      await apiRequest('DELETE', `/api/countries/${countryId}/laws/${id}`);
      toast({
        title: 'Success',
        description: 'Historical law deleted successfully',
      });

      // Invalidate the query to refetch
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/laws`] });
      await refetch();
    } catch (error) {
      console.error('Error deleting historical law:', error);
      toast({
        title: 'Error',
        description: 'There was an error deleting the historical law',
        variant: 'destructive',
      });
    }
  };

  // Get category color
  const getCategoryColor = (category: string | null | undefined) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    switch (category) {
      case 'Economic':
        return 'bg-emerald-100 text-emerald-800';
      case 'Social':
        return 'bg-blue-100 text-blue-800';
      case 'Environmental':
        return 'bg-green-100 text-green-800';
      case 'Security':
        return 'bg-red-100 text-red-800';
      case 'Political Reform':
        return 'bg-purple-100 text-purple-800';
      case 'Civil Rights':
        return 'bg-indigo-100 text-indigo-800';
      case 'Constitutional':
        return 'bg-amber-100 text-amber-800';
      case 'Education':
        return 'bg-cyan-100 text-cyan-800';
      case 'Healthcare':
        return 'bg-pink-100 text-pink-800';
      case 'Labor':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Enacted':
        return 'bg-green-100 text-green-800';
      case 'Proposed':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-amber-100 text-amber-800';
      case 'Repealed':
        return 'bg-red-100 text-red-800';
      case 'Amended':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter laws by category
  const filteredLaws = activeFilter
    ? laws?.filter(law => law.category === activeFilter)
    : laws;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Historical Laws</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setIsEditing(false);
            setSelectedLaw(null);
            form.reset({
              title: '',
              description: '',
              date: null,
              category: 'Economic',
              status: 'Enacted',
            });
          }}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Law
        </Button>
      </div>
      
      {/* Filter tabs */}
      {laws && laws.length > 0 && (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger 
              value="all"
              onClick={() => setActiveFilter(null)}
            >
              All
            </TabsTrigger>
            {Array.from(new Set(laws.map(law => law.category || 'Other'))).map(category => (
              <TabsTrigger 
                key={category} 
                value={category as string}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}
      
      {/* Law Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Law Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter the law title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lawCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
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
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lawStatuses.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field} 
                      value={field.value || ''} 
                    />
                  </FormControl>
                  <FormDescription>
                    The date when the law was enacted or proposed
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
                      {...field}
                      placeholder="Provide a brief description of the law"
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            {isEditing && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedLaw(null);
                  form.reset({
                    title: '',
                    description: '',
                    date: null,
                    category: 'Economic',
                    status: 'Enacted',
                  });
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit">
              {isEditing ? 'Update Law' : 'Add Law'}
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Laws List */}
      {isLoading ? (
        <div className="flex justify-center p-4">
          <p>Loading laws...</p>
        </div>
      ) : filteredLaws && filteredLaws.length > 0 ? (
        <div className="space-y-4">
          {filteredLaws.map(law => (
            <Card key={law.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{law.title}</h4>
                      <Badge className={getCategoryColor(law.category || 'Other')}>
                        {law.category}
                      </Badge>
                      <Badge className={getStatusColor(law.status || 'Unknown')}>
                        {law.status}
                      </Badge>
                    </div>
                    {law.date && (
                      <p className="text-sm text-gray-500">
                        Date: {formatDate(law.date)}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">{law.description}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(law)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(law.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg p-8 text-center bg-gray-50">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">No historical laws found for this country.</p>
          <p className="text-gray-400 text-sm mt-1">
            Add a new law using the form above.
          </p>
        </div>
      )}
    </div>
  );
};

export default LawsEditor;