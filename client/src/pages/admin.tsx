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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Country, 
  TimelineEvent, 
  PoliticalLeader, 
  PoliticalSystem,
  InternationalRelation,
  HistoricalLaw,
  Statistic
} from '@shared/schema';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import StatisticsEditor from '@/components/admin/StatisticsEditor';
import LeadersEditor from '@/components/admin/LeadersEditor';
import PartiesEditor from '@/components/admin/PartiesEditor';
import RelationsEditor from '@/components/admin/RelationsEditor';
import FreedomIndexEditor from '@/components/admin/FreedomIndexEditor';
import ConflictsEditor from '@/components/admin/ConflictsEditor';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate, getEventBadgeColor, getEventDotColor } from '@/lib/helpers';
import { toast } from '@/hooks/use-toast';
import { Pencil, AlertTriangle, Check, Ban, AlertCircle } from 'lucide-react';

// Helper function to strip HTML tags from text
function stripHtmlTags(html: string) {
  if (!html) return '';
  // Create a temporary div element
  const tempDiv = document.createElement('div');
  // Set the HTML content
  tempDiv.innerHTML = html;
  // Return the text content
  return tempDiv.textContent || tempDiv.innerText || '';
}

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
        governmentForm: selectedCountry.countryInfo ? (selectedCountry.countryInfo as any).governmentForm || null : null,
      });
    }
  }, [selectedCountry, form]);
  
  // Handle form submission
  const onSubmit = async (data: CountryFormValues) => {
    try {
      // Update the country with the form data
      await apiRequest('PATCH', `/api/countries/${data.id}`, {
        name: data.name,
        alpha2Code: data.alpha2Code,
        alpha3Code: data.alpha3Code,
        capital: data.capital,
        region: data.region,
        subregion: data.subregion,
        population: data.population,
        area: data.area,
        flagUrl: data.flagUrl,
        countryInfo: {
          governmentForm: data.governmentForm,
        },
      });
      
      // Invalidate the query to refetch the updated data
      queryClient.invalidateQueries({ queryKey: [`/api/countries/${data.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/countries'] });
      
      toast({
        title: 'Success',
        description: 'Country information updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update country:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the country information.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      
      {/* Country Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Country</CardTitle>
          <CardDescription>Choose a country to edit its information</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            disabled={countriesLoading}
            value={selectedCountryId ? String(selectedCountryId) : ''}
            onValueChange={(value) => setSelectedCountryId(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries?.map((country) => (
                <SelectItem key={country.id} value={String(country.id)}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      
      {/* Country Editor */}
      {selectedCountry && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Country: {selectedCountry.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="political">Political System</TabsTrigger>
                <TabsTrigger value="relations">International Relations</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="basic">
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
              </TabsContent>
              
              {/* Timeline Tab */}
              <TabsContent value="timeline">
                {/* TimelineEditor is defined later in this file */}
                <TimelineEditor countryId={selectedCountry.id} />
              </TabsContent>
              
              {/* Political System Tab */}
              <TabsContent value="political">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Political Stability</CardTitle>
                      <CardDescription>Indicate the current political stability of this country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PoliticalStabilityEditor countryId={selectedCountry.id} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Freedom Index</CardTitle>
                      <CardDescription>Manage freedom index data for this country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FreedomIndexEditor countryId={selectedCountry.id} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Political Leaders</CardTitle>
                      <CardDescription>Manage political leaders for this country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <LeadersEditor countryId={selectedCountry.id} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Political Parties</CardTitle>
                      <CardDescription>Manage political parties for this country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PartiesEditor countryId={selectedCountry.id} />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Ongoing Conflicts</CardTitle>
                      <CardDescription>Manage ongoing conflicts and disputes for this country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ConflictsEditor countryId={selectedCountry.id} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* International Relations Tab */}
              <TabsContent value="relations">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>International Relations</CardTitle>
                      <CardDescription>Manage international relations for this country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RelationsEditor countryId={selectedCountry.id} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Statistics Tab */}
              <TabsContent value="statistics">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Statistics Editor</CardTitle>
                      <CardDescription>Manage statistical data for this country</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <StatisticsEditor countryId={selectedCountry.id} />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Timeline Editor Component
interface TimelineEventFormValues {
  id?: number;
  title: string;
  description: string;
  date: string;
  eventType: string;
  icon: string | null;
}

const timelineEventSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Event title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  eventType: z.string().min(1, 'Event type is required'),
  icon: z.string().nullable(),
});

const TimelineEditor: React.FC<{ countryId: number }> = ({ countryId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  
  // Fetch timeline events for the selected country
  const { data: timelineEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery<TimelineEvent[]>({
    queryKey: [`/api/countries/${countryId}/timeline`],
    enabled: countryId !== null,
  });
  
  // Setup the form
  const form = useForm<TimelineEventFormValues>({
    resolver: zodResolver(timelineEventSchema),
    defaultValues: {
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0], // Today's date
      eventType: 'Political',
      icon: null,
    },
  });
  
  // Update events when data is fetched
  React.useEffect(() => {
    if (timelineEvents) {
      setEvents(timelineEvents);
    }
  }, [timelineEvents]);
  
  // Handle form submission
  const onSubmit = async (data: TimelineEventFormValues) => {
    try {
      // Create new event with the date as a string (no conversion needed)
      await apiRequest('POST', `/api/countries/${countryId}/timeline`, {
        ...data,
        countryId,
        // Keep date as string to allow free-form date entry
        date: data.date,
      });
      
      // Refetch timeline events
      refetchEvents();
      
      toast({
        title: 'Event Added',
        description: 'The timeline event has been successfully added.',
      });
      
      // Reset form
      form.reset({
        title: '',
        description: '',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        eventType: 'Political',
        icon: null,
      });
      
    } catch (error) {
      console.error('Failed to save timeline event:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the timeline event.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete button click
  const handleDeleteEvent = async (eventId: number) => {
    if (confirm("Are you sure you want to delete this timeline event?")) {
      try {
        // Send delete request to the API
        await apiRequest('DELETE', `/api/countries/${countryId}/timeline/${eventId}`);
        
        // Refetch timeline events
        refetchEvents();
        
        toast({
          title: 'Event Deleted',
          description: 'The timeline event has been successfully deleted.',
        });
      } catch (error) {
        console.error('Failed to delete timeline event:', error);
        toast({
          title: 'Error',
          description: 'There was an error deleting the timeline event.',
          variant: 'destructive',
        });
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Timeline Events</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter event title" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., January 1, 2022" 
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the date in any format (e.g., "January 1, 2022", "1945", "Mid 15th century")
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Political">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-blue-500"></span>
                            Political
                          </div>
                        </SelectItem>
                        <SelectItem value="Economic">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-emerald-500"></span>
                            Economic
                          </div>
                        </SelectItem>
                        <SelectItem value="Social">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-violet-500"></span>
                            Social
                          </div>
                        </SelectItem>
                        <SelectItem value="Cultural">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-fuchsia-500"></span>
                            Cultural
                          </div>
                        </SelectItem>
                        <SelectItem value="Military">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-red-500"></span>
                            Military
                          </div>
                        </SelectItem>
                        <SelectItem value="Diplomatic">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-cyan-500"></span>
                            Diplomatic
                          </div>
                        </SelectItem>
                        <SelectItem value="Legal">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-purple-500"></span>
                            Legal
                          </div>
                        </SelectItem>
                        <SelectItem value="Religious">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-amber-500"></span>
                            Religious
                          </div>
                        </SelectItem>
                        <SelectItem value="Scientific">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-teal-500"></span>
                            Scientific
                          </div>
                        </SelectItem>
                        <SelectItem value="Environmental">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-green-500"></span>
                            Environmental
                          </div>
                        </SelectItem>
                        <SelectItem value="Technological">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-indigo-500"></span>
                            Technological
                          </div>
                        </SelectItem>
                        <SelectItem value="Other">
                          <div className="flex items-center">
                            <span className="w-3 h-3 mr-2 rounded-full bg-gray-500"></span>
                            Other
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Select the type of historical event - this determines how it will be displayed in the timeline
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Choose an Icon</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Select
                      value={field.value || 'none'}
                      onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="grid grid-cols-3 gap-2 p-2">
                          <SelectItem value="none" className="flex items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            None
                          </SelectItem>
                          <SelectItem value="star" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">⭐</div>
                            <div className="text-xs">Star</div>
                          </SelectItem>
                          <SelectItem value="flag" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">🚩</div>
                            <div className="text-xs">Flag</div>
                          </SelectItem>
                          <SelectItem value="landmark" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">🏛️</div>
                            <div className="text-xs">Landmark</div>
                          </SelectItem>
                          <SelectItem value="crown" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">👑</div>
                            <div className="text-xs">Crown</div>
                          </SelectItem>
                          <SelectItem value="building" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">🏢</div>
                            <div className="text-xs">Building</div>
                          </SelectItem>
                          <SelectItem value="coins" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">💰</div>
                            <div className="text-xs">Coins</div>
                          </SelectItem>
                          <SelectItem value="scale" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">⚖️</div>
                            <div className="text-xs">Scale</div>
                          </SelectItem>
                          <SelectItem value="scroll" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">📜</div>
                            <div className="text-xs">Scroll</div>
                          </SelectItem>
                          <SelectItem value="sword" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">⚔️</div>
                            <div className="text-xs">Sword</div>
                          </SelectItem>
                          <SelectItem value="shield" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">🛡️</div>
                            <div className="text-xs">Shield</div>
                          </SelectItem>
                          <SelectItem value="book" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">📚</div>
                            <div className="text-xs">Book</div>
                          </SelectItem>
                          <SelectItem value="users" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">👥</div>
                            <div className="text-xs">Users</div>
                          </SelectItem>
                          <SelectItem value="globe" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">🌐</div>
                            <div className="text-xs">Globe</div>
                          </SelectItem>
                          <SelectItem value="map" className="flex flex-col items-center justify-center p-2 border rounded-md hover:bg-gray-100">
                            <div className="text-xl mb-1">🗺️</div>
                            <div className="text-xs">Map</div>
                          </SelectItem>
                        </div>
                      </SelectContent>
                    </Select>
                    
                    {field.value && (
                      <div className="flex items-center p-2 bg-gray-50 rounded-md">
                        <div className="mr-2 text-2xl">
                          {field.value === 'star' && '⭐'}
                          {field.value === 'flag' && '🚩'}
                          {field.value === 'landmark' && '🏛️'}
                          {field.value === 'crown' && '👑'}
                          {field.value === 'building' && '🏢'}
                          {field.value === 'coins' && '💰'}
                          {field.value === 'scale' && '⚖️'}
                          {field.value === 'scroll' && '📜'}
                          {field.value === 'sword' && '⚔️'}
                          {field.value === 'shield' && '🛡️'}
                          {field.value === 'book' && '📚'}
                          {field.value === 'users' && '👥'}
                          {field.value === 'globe' && '🌐'}
                          {field.value === 'map' && '🗺️'}
                        </div>
                        <div className="text-sm">Selected icon: <span className="font-semibold">{field.value}</span></div>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Choose an icon that best represents this event
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
                  <ReactQuill 
                    theme="snow" 
                    value={field.value} 
                    onChange={field.onChange} 
                    placeholder="Enter event description"
                    modules={{
                      toolbar: [
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link'],
                        ['clean']
                      ]
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button type="submit">
              Add Event
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Existing Events</h3>
        
        {eventsLoading ? (
          <p>Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No timeline events yet. Add one using the form above.</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <CardTitle>{event.title}</CardTitle>
                    <div className="flex gap-2">

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  <CardDescription>
                    <span className="font-medium">{typeof event.date === 'string' ? event.date : formatDate(event.date as Date)}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getEventBadgeColor(event.eventType)}`}>{event.eventType}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: event.description }}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Political Stability Editor Component
const PoliticalStabilityEditor: React.FC<{ countryId: number }> = ({ countryId }) => {
  const [isUnstable, setIsUnstable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch the political system data
  const { data: politicalSystem, isLoading: systemLoading, refetch } = useQuery<PoliticalSystem>({
    queryKey: [`/api/countries/${countryId}/political-system`],
    enabled: countryId !== null,
  });

  // Update local state when data is loaded
  React.useEffect(() => {
    if (politicalSystem) {
      setIsUnstable(politicalSystem.hasUnstablePoliticalSituation || false);
    }
  }, [politicalSystem]);
  
  const handleToggleStability = async () => {
    setIsLoading(true);
    try {
      if (politicalSystem) {
        // Update existing political system
        await apiRequest('PATCH', `/api/countries/${countryId}/political-system`, {
          hasUnstablePoliticalSituation: !isUnstable
        });
        
        toast({
          title: 'Success',
          description: `Political stability status updated successfully.`,
        });
      } else {
        // Create new political system
        await apiRequest('POST', `/api/countries/${countryId}/political-system`, {
          countryId,
          type: 'Unknown', // Provide a default type
          hasUnstablePoliticalSituation: !isUnstable
        });
        
        toast({
          title: 'Success',
          description: `Political system created with stability status.`,
        });
      }
      
      // Update local state and refetch
      setIsUnstable(!isUnstable);
      refetch();
      
    } catch (error) {
      console.error('Failed to update political stability:', error);
      toast({
        title: 'Error',
        description: 'There was an error updating the political stability status.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border p-4 rounded-lg bg-background">
        <div className="flex items-start space-x-3">
          {isUnstable ? (
            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          ) : (
            <Check className="h-6 w-6 text-green-600 flex-shrink-0" />
          )}
          <div>
            <h3 className="font-medium">Political Stability Status</h3>
            <p className="text-sm text-muted-foreground">
              {isUnstable 
                ? "This country is currently marked as politically unstable" 
                : "This country is currently marked as politically stable"}
            </p>
          </div>
        </div>
        
        <Button 
          variant={isUnstable ? "outline" : "default"}
          className={isUnstable ? "border-red-300 hover:bg-red-50 text-red-700" : ""}
          onClick={handleToggleStability}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <span className="mr-2">Processing...</span>
            </span>
          ) : isUnstable ? (
            <span className="flex items-center">
              <Check className="mr-2 h-4 w-4" /> 
              Mark as Stable
            </span>
          ) : (
            <span className="flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" /> 
              Mark as Unstable
            </span>
          )}
        </Button>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Important Note</p>
            <p>
              Marking a country as politically unstable will display a warning message to users on the 
              country page. This should be used for countries experiencing significant political unrest, 
              civil conflict, or governmental instability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;