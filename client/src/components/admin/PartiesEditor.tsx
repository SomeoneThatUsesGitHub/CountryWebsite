import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { PoliticalParty } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2Icon } from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Schema for the form
const partySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  acronym: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  ideology: z.string().nullable().optional(),
  logoUrl: z.string().url('Must be a valid URL').nullable().optional(),
  foundedYear: z.coerce.number().int().positive().nullable().optional(),
  isRuling: z.boolean().nullable().optional(),
  seats: z.coerce.number().int().min(0).nullable().optional(),
  totalSeats: z.coerce.number().int().min(0).nullable().optional(),
});

type PartyFormValues = z.infer<typeof partySchema>;

interface PartiesEditorProps {
  countryId: number;
}

const PartiesEditor: React.FC<PartiesEditorProps> = ({ countryId }) => {
  const [editingParty, setEditingParty] = useState<PoliticalParty | null>(null);
  const [colorPickerValue, setColorPickerValue] = useState('#6366F1');

  // Fetch political parties for the country
  const { data: parties = [], isLoading: partiesLoading } = useQuery<PoliticalParty[]>({
    queryKey: [`/api/countries/${countryId}/parties`],
    enabled: !!countryId,
  });

  // Form setup
  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      name: '',
      acronym: '',
      color: '#6366F1',
      ideology: '',
      logoUrl: '',
      foundedYear: null,
      isRuling: false,
      seats: null,
      totalSeats: null,
    },
  });

  // Set form values when editing a party
  React.useEffect(() => {
    if (editingParty) {
      form.reset({
        name: editingParty.name,
        acronym: editingParty.acronym || '',
        color: editingParty.color || '#6366F1',
        ideology: editingParty.ideology || '',
        logoUrl: editingParty.logoUrl || '',
        foundedYear: editingParty.foundedYear || null,
        isRuling: editingParty.isRuling || false,
        seats: editingParty.seats || null,
        totalSeats: editingParty.totalSeats || null,
      });
      
      if (editingParty.color) {
        setColorPickerValue(editingParty.color);
      }
    }
  }, [editingParty, form]);

  // Create party mutation
  const createPartyMutation = useMutation({
    mutationFn: async (data: PartyFormValues) => {
      return apiRequest<PoliticalParty>('POST', `/api/countries/${countryId}/parties`, data);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Political party created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/parties`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create political party',
        variant: 'destructive',
      });
    },
  });

  // Update party mutation
  const updatePartyMutation = useMutation({
    mutationFn: async (data: { id: number; formData: PartyFormValues }) => {
      return apiRequest<PoliticalParty>('PATCH', `/api/countries/${countryId}/parties/${data.id}`, data.formData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Political party updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/parties`] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update political party',
        variant: 'destructive',
      });
    },
  });

  // Delete party mutation
  const deletePartyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/countries/${countryId}/parties/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Political party deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/parties`] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete political party',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: PartyFormValues) => {
    if (editingParty) {
      updatePartyMutation.mutate({ id: editingParty.id, formData: data });
    } else {
      createPartyMutation.mutate(data);
    }
  };

  const handleEdit = (party: PoliticalParty) => {
    setEditingParty(party);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      deletePartyMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingParty(null);
    form.reset({
      name: '',
      acronym: '',
      color: '#6366F1',
      ideology: '',
      logoUrl: '',
      foundedYear: null,
      isRuling: false,
      seats: null,
      totalSeats: null,
    });
    setColorPickerValue('#6366F1');
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColorPickerValue(newColor);
    form.setValue('color', newColor);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Political Parties</h3>
        <p className="text-sm text-gray-500">
          Add and manage political parties of this country
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
                  <FormLabel>Party Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Democratic Party" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acronym"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acronym</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., DP" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ideology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ideology</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Democracy, Conservatism" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.jpg" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="foundedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Founded Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 1980" 
                      {...field} 
                      value={field.value === null ? '' : field.value} 
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Party Color</FormLabel>
                  <div className="flex gap-2">
                    <div 
                      className="w-10 h-10 rounded-md border"
                      style={{ backgroundColor: colorPickerValue }}
                    />
                    <FormControl>
                      <Input 
                        type="color" 
                        {...field} 
                        value={colorPickerValue} 
                        onChange={(e) => {
                          handleColorChange(e);
                          field.onChange(e);
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="seats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seats in Parliament</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 45" 
                      {...field} 
                      value={field.value === null ? '' : field.value} 
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="totalSeats"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Seats in Parliament</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 100" 
                      {...field} 
                      value={field.value === null ? '' : field.value} 
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isRuling"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Ruling Party</FormLabel>
                    <FormDescription>
                      Is this the current ruling party?
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            {editingParty?.id && (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={createPartyMutation.isPending || updatePartyMutation.isPending}>
              {editingParty?.id ? 'Update Party' : 'Add Party'}
            </Button>
          </div>
        </form>
      </Form>

      <Separator className="my-6" />

      <h3 className="text-lg font-medium mb-4">Current Parties</h3>

      {partiesLoading ? (
        <div className="text-center py-4">
          <p>Loading parties...</p>
        </div>
      ) : parties.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {parties.map((party) => (
            <Card key={party.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: party.color || '#6366F1' }}
                    >
                      {party.logoUrl ? (
                        <img
                          src={party.logoUrl}
                          alt={party.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        party.acronym || party.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{party.name}</h4>
                      {party.acronym && <p className="text-sm text-primary">{party.acronym}</p>}
                      {party.ideology && <p className="text-sm">Ideology: {party.ideology}</p>}
                      {party.foundedYear && <p className="text-sm">Founded: {party.foundedYear}</p>}
                      {party.seats && (
                        <p className="text-sm">
                          Seats: {party.seats}
                          {party.totalSeats ? ` / ${party.totalSeats} (${Math.round((party.seats / party.totalSeats) * 100)}%)` : ''}
                        </p>
                      )}
                      {party.isRuling && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 mt-1">
                          Ruling Party
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(party)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(party.id)}
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
          <p className="text-gray-500">No political parties added yet</p>
          <p className="text-sm text-gray-400 mt-1">Add your first party above</p>
        </div>
      )}
    </div>
  );
};

export default PartiesEditor;