import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  getPopulationData,
  getGDPData,
  getReligionData
} from '@/components/country/ChartDisplay';
import { getEthnicGroupsData } from '@/components/country/EthnicityChart';
import { PopulationChart, GDPChart, ReligionChart } from '@/components/country/ChartDisplay';
import EthnicityChart from '@/components/country/EthnicityChart';

const statisticSchema = z.object({
  id: z.number().optional(),
  type: z.string(),
  year: z.number().nullable(),
  data: z.any(),
});

type Statistic = z.infer<typeof statisticSchema>;

interface StatisticsEditorProps {
  countryId: number;
}

const populationEntrySchema = z.object({
  year: z.string(),
  population: z.coerce.number().positive('Population must be a positive number')
});

const gdpEntrySchema = z.object({
  year: z.string(),
  gdp: z.coerce.number().positive('GDP must be a positive number')
});

const religionEntrySchema = z.object({
  name: z.string().min(1, 'Religion name is required'),
  value: z.coerce.number().min(0, 'Value must be positive').max(100, 'Value cannot exceed 100%')
});

const ethnicityEntrySchema = z.object({
  name: z.string().min(1, 'Ethnicity name is required'),
  percentage: z.coerce.number().min(0, 'Percentage must be positive').max(100, 'Percentage cannot exceed 100%')
});

// Define schemas for each statistic type
const populationSchema = z.object({
  values: z.array(populationEntrySchema)
    .min(1, 'At least one population entry is required')
});

const gdpSchema = z.object({
  values: z.array(gdpEntrySchema)
    .min(1, 'At least one GDP entry is required')
});

const religionSchema = z.object({
  values: z.array(religionEntrySchema)
    .min(1, 'At least one religion entry is required')
    .refine(data => {
      const total = data.reduce((sum, item) => sum + item.value, 0);
      return Math.abs(total - 100) < 0.1; // Allow small rounding errors
    }, {
      message: 'Religion percentages must sum to 100%',
      path: ['values']
    })
});

const ethnicitySchema = z.object({
  values: z.array(ethnicityEntrySchema)
    .min(1, 'At least one ethnicity entry is required')
    .refine(data => {
      const total = data.reduce((sum, item) => sum + item.percentage, 0);
      return Math.abs(total - 100) < 0.1; // Allow small rounding errors
    }, {
      message: 'Ethnicity percentages must sum to 100%',
      path: ['values']
    })
});

const getSchemaForType = (type: string) => {
  switch (type) {
    case 'Population':
      return populationSchema;
    case 'GDP':
      return gdpSchema;
    case 'Religion':
      return religionSchema;
    case 'Ethnicity':
      return ethnicitySchema;
    default:
      return z.object({});
  }
};

export const StatisticsEditor: React.FC<StatisticsEditorProps> = ({ countryId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeStatisticType, setActiveStatisticType] = useState<string>('Population');

  // Fetch statistics for the country
  const { data: statistics = [], isLoading } = useQuery<Statistic[]>({
    queryKey: [`/api/countries/${countryId}/statistics`],
    enabled: !!countryId
  });

  // Find existing statistic of the active type
  const existingStatistic = statistics.find(s => s.type === activeStatisticType);
  
  // Set up default values based on statistic type
  const getDefaultValues = () => {
    if (existingStatistic) {
      return existingStatistic;
    }
    
    let defaultData = { values: [] };
    
    switch (activeStatisticType) {
      case 'Population':
        defaultData.values = getPopulationData();
        break;
      case 'GDP':
        defaultData.values = getGDPData();
        break;
      case 'Religion':
        defaultData.values = getReligionData();
        break;
      case 'Ethnicity':
        defaultData.values = getEthnicGroupsData();
        break;
    }
    
    return {
      type: activeStatisticType,
      year: new Date().getFullYear(),
      data: defaultData
    };
  };

  // Form for editing statistics
  const form = useForm<Statistic>({
    resolver: zodResolver(statisticSchema),
    defaultValues: getDefaultValues()
  });

  // Reset form when changing statistic type
  React.useEffect(() => {
    form.reset(getDefaultValues());
  }, [activeStatisticType, statistics]);

  // Setup FieldArray for values based on statistic type
  const getFieldArrayName = () => {
    return 'data.values';
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: getFieldArrayName() as any
  });

  // Mutations for create/update
  const createMutation = useMutation({
    mutationFn: (data: Statistic) => apiRequest('POST', `/api/countries/${countryId}/statistics`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/statistics`] });
      toast({
        title: 'Success',
        description: `${activeStatisticType} statistics created successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create statistics: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: Statistic) => apiRequest('PATCH', `/api/statistics/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${countryId}/statistics`] });
      toast({
        title: 'Success',
        description: `${activeStatisticType} statistics updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update statistics: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const onSubmit = async (data: Statistic) => {
    try {
      // Validate data based on the specific schema for this statistic type
      const specificSchema = getSchemaForType(data.type);
      specificSchema.parse(data.data);
      
      if (existingStatistic?.id) {
        updateMutation.mutate({
          ...data,
          id: existingStatistic.id
        });
      } else {
        createMutation.mutate(data);
      }
    } catch (error: any) {
      toast({
        title: 'Validation Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const addNewEntry = () => {
    switch (activeStatisticType) {
      case 'Population':
        append({ year: new Date().getFullYear().toString(), population: 0 });
        break;
      case 'GDP':
        append({ year: new Date().getFullYear().toString(), gdp: 0 });
        break;
      case 'Religion':
        append({ name: '', value: 0 });
        break;
      case 'Ethnicity':
        append({ name: '', percentage: 0 });
        break;
    }
  };

  // Function to calculate totals for percentages
  const calculateTotal = () => {
    const values = form.getValues('data.values') || [];
    
    if (activeStatisticType === 'Religion') {
      return values.reduce((sum: number, item: any) => sum + (parseFloat(item.value) || 0), 0);
    } else if (activeStatisticType === 'Ethnicity') {
      return values.reduce((sum: number, item: any) => sum + (parseFloat(item.percentage) || 0), 0);
    }
    
    return null;
  };

  const renderFieldsByType = () => {
    if (!fields.length) return null;

    return (
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center space-x-2">
            {activeStatisticType === 'Population' && (
              <>
                <FormField
                  control={form.control}
                  name={`data.values.${index}.year`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`data.values.${index}.population`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Population</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {activeStatisticType === 'GDP' && (
              <>
                <FormField
                  control={form.control}
                  name={`data.values.${index}.year`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Year</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`data.values.${index}.gdp`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>GDP (billions)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {activeStatisticType === 'Religion' && (
              <>
                <FormField
                  control={form.control}
                  name={`data.values.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Religion</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`data.values.${index}.value`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Percentage</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" max="100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {activeStatisticType === 'Ethnicity' && (
              <>
                <FormField
                  control={form.control}
                  name={`data.values.${index}.name`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Ethnic Group</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`data.values.${index}.percentage`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Percentage</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" max="100" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button 
              variant="destructive" 
              className="mt-8"
              onClick={() => remove(index)}
              size="sm"
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    );
  };

  const renderPreview = () => {
    // Get current form values for preview
    const formValues = form.getValues();
    
    if (!formValues?.data?.values?.length) return null;
    
    switch (activeStatisticType) {
      case 'Population':
        return <PopulationChart data={formValues.data.values} />;
      case 'GDP':
        return <GDPChart data={formValues.data.values} />;
      case 'Religion':
        return <ReligionChart data={formValues.data.values} />;
      case 'Ethnicity':
        return <EthnicityChart ethnicGroups={formValues.data.values} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Country Statistics</CardTitle>
          <CardDescription>
            Manage statistical data for the country. Select a statistic type to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="Population" 
            value={activeStatisticType}
            onValueChange={setActiveStatisticType}
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="Population">Population</TabsTrigger>
              <TabsTrigger value="GDP">GDP</TabsTrigger>
              <TabsTrigger value="Religion">Religion</TabsTrigger>
              <TabsTrigger value="Ethnicity">Ethnicity</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeStatisticType}>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <input type="hidden" {...form.register('type')} value={activeStatisticType} />
                  
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reference Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value || ''} 
                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Data Points</h3>
                    
                    {/* Show percentage total for Religion and Ethnicity */}
                    {(activeStatisticType === 'Religion' || activeStatisticType === 'Ethnicity') && (
                      <div className="text-sm font-medium">
                        Total: {calculateTotal()}% {Math.abs((calculateTotal() || 0) - 100) > 0.1 && (
                          <span className="text-red-500">(should total 100%)</span>
                        )}
                      </div>
                    )}
                    
                    {renderFieldsByType()}
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addNewEntry}
                    >
                      Add Data Point
                    </Button>
                  </div>
                  
                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {existingStatistic?.id ? 'Update' : 'Create'} {activeStatisticType} Statistics
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            Visual preview of the {activeStatisticType} data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            {renderPreview()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsEditor;