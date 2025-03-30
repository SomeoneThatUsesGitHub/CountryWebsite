import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage, 
  FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Country } from '@shared/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const countrySchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Country name is required'),
  alpha2Code: z.string().length(2, 'Alpha-2 code must be exactly 2 characters'),
  alpha3Code: z.string().length(3, 'Alpha-3 code must be exactly 3 characters'),
  capital: z.string().nullable(),
  region: z.string().nullable(),
  subregion: z.string().nullable(),
  population: z.number().nullable(),
  area: z.number().nullable(),
  flagUrl: z.string().url('Must be a valid URL').nullable(),
  governmentForm: z.string().nullable(),
});

type CountryFormValues = z.infer<typeof countrySchema>;

const AdminPage: React.FC = () => {
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  
  // Fetch all countries for the dropdown
  const { data: countries, isLoading: countriesLoading } = useQuery<Country[]>({
    queryKey: ['/api/countries'],
  });
  
  // Fetch the selected country details
  const { data: selectedCountry, isLoading: countryLoading } = useQuery<Country>({
    queryKey: [`/api/countries/${selectedCountryId}`],
    enabled: selectedCountryId !== null,
  });
  
  const form = useForm<CountryFormValues>({
    resolver: zodResolver(countrySchema),
    defaultValues: {
      id: 0,
      name: '',
      alpha2Code: '',
      alpha3Code: '',
      capital: null,
      region: null,
      subregion: null,
      population: null,
      area: null,
      flagUrl: null,
      governmentForm: null,
    },
  });
  
  // Update form values when selected country changes
  React.useEffect(() => {
    if (selectedCountry) {
      // Extract the government form from the countryInfo object
      const governmentForm = selectedCountry.countryInfo?.governmentForm || null;
      
      form.reset({
        id: selectedCountry.id,
        name: selectedCountry.name,
        alpha2Code: selectedCountry.alpha2Code,
        alpha3Code: selectedCountry.alpha3Code,
        capital: selectedCountry.capital,
        region: selectedCountry.region,
        subregion: selectedCountry.subregion,
        population: selectedCountry.population,
        area: selectedCountry.area,
        flagUrl: selectedCountry.flagUrl,
        governmentForm: governmentForm,
      });
    }
  }, [selectedCountry, form]);
  
  const onSubmit = async (data: CountryFormValues) => {
    try {
      // Create the updated country object
      const countryInfo = selectedCountry?.countryInfo ? 
        {
          ...selectedCountry.countryInfo,
          governmentForm: data.governmentForm,
        } : 
        {
          capital: selectedCountry?.capital || null,
          region: selectedCountry?.region || null,
          subregion: selectedCountry?.subregion || null,
          population: selectedCountry?.population || null,
          governmentForm: data.governmentForm,
        };

      const updatedCountry = {
        ...data,
        countryInfo
      };
      
      // Remove the governmentForm field as it's not directly on the country object
      delete (updatedCountry as any).governmentForm;
      
      // Send the update request
      await apiRequest('PATCH', `/api/countries/${data.id}`, updatedCountry);
      
      // Invalidate queries to refetch country data
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${data.id}`] });
      
      toast({
        title: 'Country Updated',
        description: `${data.name} has been successfully updated.`,
      });
    } catch (error) {
      console.error('Failed to update country:', error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating the country information.',
        variant: 'destructive',
      });
    }
  };
  
  const handleCountrySelect = (countryId: string) => {
    setSelectedCountryId(parseInt(countryId));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Country Administration</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select a Country to Edit</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            onValueChange={handleCountrySelect} 
            disabled={countriesLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((country) => (
                <SelectItem key={country.id} value={country.id.toString()}>
                  {country.name} ({country.alpha3Code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {selectedCountry && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Country: {selectedCountry.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="alpha2Code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alpha-2 Code</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={2} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="alpha3Code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alpha-3 Code</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={3} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="capital"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capital City</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subregion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subregion</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="population"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Population</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
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
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area (km²)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            value={field.value === null ? '' : field.value}
                            onChange={(e) => {
                              const value = e.target.value === '' ? null : Number(e.target.value);
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
                    name="flagUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flag URL</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormDescription>
                          URL to the country's flag image
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="governmentForm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Government Form</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value || 'none'}
                            onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select government form" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="Republic">Republic</SelectItem>
                              <SelectItem value="Constitutional Monarchy">Constitutional Monarchy</SelectItem>
                              <SelectItem value="Federal Republic">Federal Republic</SelectItem>
                              <SelectItem value="Parliamentary Democracy">Parliamentary Democracy</SelectItem>
                              <SelectItem value="Presidential Democracy">Presidential Democracy</SelectItem>
                              <SelectItem value="Communist State">Communist State</SelectItem>
                              <SelectItem value="Islamic Republic">Islamic Republic</SelectItem>
                              <SelectItem value="Monarchy">Monarchy</SelectItem>
                              <SelectItem value="Federation">Federation</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {selectedCountry && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Current Flag</h3>
                    {selectedCountry.flagUrl ? (
                      <img 
                        src={selectedCountry.flagUrl} 
                        alt={`Flag of ${selectedCountry.name}`} 
                        className="h-32 border"
                      />
                    ) : (
                      <p className="text-gray-500">No flag available</p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={countryLoading}>
                    Update Country
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPage;