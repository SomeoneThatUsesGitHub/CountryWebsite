import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PoliticalSystem } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { InfoIcon, AlertCircle, Check, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FreedomIndexEditorProps {
  countryId: number;
}

// Zod schema for form validation
const freedomIndexSchema = z.object({
  freedomIndex: z.coerce.number()
    .min(0, { message: "Freedom index must be at least 0" })
    .max(100, { message: "Freedom index cannot exceed 100" }),
});

type FreedomIndexFormValues = z.infer<typeof freedomIndexSchema>;

const FreedomIndexEditor: React.FC<FreedomIndexEditorProps> = ({ countryId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Custom query function that handles 404 responses
  const customQueryFn = async () => {
    try {
      const response = await apiRequest<PoliticalSystem>('GET', `/api/countries/${countryId}/political-system`);
      return response;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  // Fetch political system data
  const { data: politicalSystem, isLoading: systemLoading } = useQuery<PoliticalSystem | null>({
    queryKey: [`/api/countries/${countryId}/political-system`],
    queryFn: customQueryFn,
    enabled: Boolean(countryId),
    staleTime: Infinity, // Prevent continuous refetching
    gcTime: Infinity, // Prevent garbage collection
  });

  // Form setup
  const form = useForm<FreedomIndexFormValues>({
    resolver: zodResolver(freedomIndexSchema),
    defaultValues: {
      freedomIndex: politicalSystem?.freedomIndex || 50,
    },
  });

  // Update form values when political system data is loaded
  React.useEffect(() => {
    if (politicalSystem) {
      form.reset({
        freedomIndex: politicalSystem.freedomIndex || 50,
      });
    }
  }, [politicalSystem, form]);

  // Handle form submission
  const onSubmit = async (values: FreedomIndexFormValues) => {
    setIsLoading(true);
    try {
      if (politicalSystem) {
        // Update existing political system
        await apiRequest('PATCH', `/api/countries/${countryId}/political-system`, {
          freedomIndex: values.freedomIndex
        });
        
        toast({
          title: 'Success',
          description: 'Freedom index updated successfully.',
        });
      } else {
        // Create new political system
        await apiRequest('POST', `/api/countries/${countryId}/political-system`, {
          countryId,
          type: 'Unknown', // Provide a default type
          freedomIndex: values.freedomIndex
        });
        
        toast({
          title: 'Success',
          description: 'Political system created with freedom index.',
        });
      }
      
      // Invalidate the query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/political-system`] });
      
    } catch (error) {
      console.error('Failed to update freedom index:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the freedom index.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get freedom classification based on index value
  const getFreedomClassification = (index: number | undefined | null) => {
    if (index === undefined || index === null) return 'Unknown';
    if (index >= 70) return 'Free';
    if (index >= 40) return 'Partially Free';
    return 'Not Free';
  };

  // Get badge color based on freedom classification
  const getClassificationBadge = (classification: string) => {
    switch(classification) {
      case 'Free':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Partially Free':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Not Free':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Current freedom classification
  const currentClassification = getFreedomClassification(form.watch('freedomIndex'));
  const classificationBadge = getClassificationBadge(currentClassification);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Freedom Index</FormLabel>
                  <Badge className={classificationBadge}>
                    {currentClassification}
                  </Badge>
                </div>
                
                <FormField
                  control={form.control}
                  name="freedomIndex"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormDescription>
                            Adjust the slider to set the freedom index (0-100)
                          </FormDescription>
                          <span className="font-bold text-lg">
                            {field.value || 0}
                          </span>
                        </div>
                        
                        <div className="pt-2 pb-4">
                          <Slider
                            value={[field.value || 0]}
                            min={0}
                            max={100}
                            step={1}
                            onValueChange={(vals) => {
                              field.onChange(vals[0]);
                            }}
                          />
                        </div>
                        
                        <div className="relative pt-1">
                          <Progress 
                            value={field.value || 0} 
                            className="h-3"
                          />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Not Free (0-39)</span>
                            <span>Partially Free (40-69)</span>
                            <span>Free (70-100)</span>
                          </div>
                        </div>
                        
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-2">
                  <div className="flex">
                    <InfoIcon className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p>The Freedom Index measures political rights and civil liberties on a scale from 0 to 100:</p>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><span className="font-medium">70-100</span>: Free societies with robust political rights and civil liberties</li>
                        <li><span className="font-medium">40-69</span>: Partially free societies with some restrictions</li>
                        <li><span className="font-medium">0-39</span>: Not free societies with significant restrictions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoading || systemLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Freedom Index'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Preview of Freedom Indicator */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b">
          <h3 className="font-medium">Freedom Indicator Preview</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Freedom Index Score</span>
              <span className="text-lg font-bold">{form.watch('freedomIndex')}/100</span>
            </div>
            
            <div className="space-y-2">
              <Progress 
                value={form.watch('freedomIndex') || 0} 
                className="h-3"
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Not Free</span>
                <span>Partially Free</span>
                <span>Free</span>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-md p-4 mt-4">
              <div className="flex items-start">
                <div className="mt-1 mr-3">
                  {form.watch('freedomIndex') >= 70 ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : form.watch('freedomIndex') >= 40 ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <h5 className="font-medium mb-1">
                    {form.watch('freedomIndex') >= 70 
                      ? 'Free Society' 
                      : form.watch('freedomIndex') >= 40 
                        ? 'Partially Free Society' 
                        : 'Not Free Society'}
                  </h5>
                  <p className="text-sm text-gray-600">
                    {form.watch('freedomIndex') >= 70 
                      ? 'Strong protection of civil liberties and political rights.'
                      : form.watch('freedomIndex') >= 40 
                        ? 'Moderate protection of civil liberties with some political restrictions.'
                        : 'Limited civil liberties and significant political restrictions.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreedomIndexEditor;