import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PoliticalLeader } from '@shared/schema';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Schema for the form
const leaderSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  party: z.string().nullable().optional(),
  imageUrl: z.string().url('Must be a valid URL').nullable().optional(),
  startDate: z.date().nullable().optional(),
  ideologies: z.array(z.string()).optional(),
});

type LeaderFormValues = z.infer<typeof leaderSchema>;

interface LeadersEditorProps {
  countryId: number;
}

const LeadersEditor: React.FC<LeadersEditorProps> = ({ countryId }) => {
  const [editingLeader, setEditingLeader] = useState<PoliticalLeader | null>(null);
  const [ideologyInput, setIdeologyInput] = useState('');

  // Fetch political leaders for the country
  const { data: leaders = [], isLoading: leadersLoading } = useQuery<PoliticalLeader[]>({
    queryKey: [`/api/countries/${countryId}/leaders`],
    enabled: !!countryId,
  });

  // Form setup
  const form = useForm<LeaderFormValues>({
    resolver: zodResolver(leaderSchema),
    defaultValues: {
      name: '',
      title: '',
      party: '',
      imageUrl: '',
      startDate: null,
      ideologies: [],
    },
  });

  // Set form values when editing a leader
  React.useEffect(() => {
    if (editingLeader) {
      form.reset({
        name: editingLeader.name,
        title: editingLeader.title,
        party: editingLeader.party || '',
        imageUrl: editingLeader.imageUrl || '',
        startDate: editingLeader.startDate ? new Date(editingLeader.startDate) : null,
        ideologies: editingLeader.ideologies as string[] || [],
      });
    }
  }, [editingLeader, form]);

  // Create leader mutation
  const createLeaderMutation = useMutation({
    mutationFn: async (data: LeaderFormValues) => {
      return apiRequest<PoliticalLeader>('POST', `/api/countries/${countryId}/leaders`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Political leader created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/leaders`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create political leader',
        variant: 'destructive',
      });
    },
  });

  // Update leader mutation
  const updateLeaderMutation = useMutation({
    mutationFn: async (data: { id: number; formData: LeaderFormValues }) => {
      return apiRequest<PoliticalLeader>('PATCH', `/api/countries/${countryId}/leaders/${data.id}`, data.formData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Political leader updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/leaders`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update political leader',
        variant: 'destructive',
      });
    },
  });

  // Delete leader mutation
  const deleteLeaderMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/countries/${countryId}/leaders/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Political leader deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/leaders`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete political leader',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: LeaderFormValues) => {
    if (editingLeader) {
      updateLeaderMutation.mutate({ id: editingLeader.id, formData: data });
    } else {
      createLeaderMutation.mutate(data);
    }
  };

  const handleEdit = (leader: PoliticalLeader) => {
    setEditingLeader(leader);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this leader?')) {
      deleteLeaderMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingLeader(null);
    form.reset({
      name: '',
      title: '',
      party: '',
      imageUrl: '',
      startDate: null,
      ideologies: [],
    });
  };

  const addIdeology = () => {
    if (ideologyInput.trim() === '') return;
    
    const currentIdeologies = form.getValues().ideologies || [];
    if (!currentIdeologies.includes(ideologyInput.trim())) {
      form.setValue('ideologies', [...currentIdeologies, ideologyInput.trim()]);
    }
    setIdeologyInput('');
  };

  const removeIdeology = (index: number) => {
    const currentIdeologies = form.getValues().ideologies || [];
    form.setValue(
      'ideologies',
      currentIdeologies.filter((_, i) => i !== index)
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Political Leaders</h3>
        <p className="text-sm text-gray-500">
          Add and manage political leaders of this country
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., President, Prime Minister" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="party"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Political Party</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Democratic Party" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} value={field.value || ''} />
                  </FormControl>
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

          <div>
            <FormLabel>Ideologies</FormLabel>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.watch('ideologies')?.map((ideology, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-primary/10 text-primary text-sm rounded-full px-3 py-1"
                >
                  <span>{ideology}</span>
                  <button
                    type="button"
                    onClick={() => removeIdeology(index)}
                    className="text-primary hover:text-primary/70 h-4 w-4 rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add ideology e.g., Democracy, Socialism"
                value={ideologyInput}
                onChange={(e) => setIdeologyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIdeology();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addIdeology}>
                Add
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingLeader?.id && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={createLeaderMutation.isPending || updateLeaderMutation.isPending}>
              {editingLeader?.id ? 'Update Leader' : 'Add Leader'}
            </Button>
          </div>
        </form>
      </Form>

      <Separator className="my-6" />

      <h3 className="text-lg font-medium mb-4">Current Leaders</h3>

      {leadersLoading ? (
        <div className="text-center py-4">
          <p>Loading leaders...</p>
        </div>
      ) : leaders.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {leaders.map((leader) => (
            <Card key={leader.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {leader.imageUrl && (
                      <img
                        src={leader.imageUrl}
                        alt={leader.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-semibold">{leader.name}</h4>
                      <p className="text-sm text-primary">{leader.title}</p>
                      {leader.party && <p className="text-sm">Party: {leader.party}</p>}
                      {leader.startDate && (
                        <p className="text-sm">
                          In office since: {new Date(leader.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {Array.isArray(leader.ideologies) && leader.ideologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {leader.ideologies.map((ideology, index) => (
                            <span key={index} className="bg-primary/10 px-2 py-0.5 text-xs rounded-full">
                              {ideology}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(leader)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(leader.id)}
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
          <p className="text-gray-500">No political leaders added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first leader above</p>
        </div>
      )}
    </div>
  );
};

export default LeadersEditor;