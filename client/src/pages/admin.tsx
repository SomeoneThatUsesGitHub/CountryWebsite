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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { formatDate } from '@/lib/helpers';
import { toast } from '@/hooks/use-toast';
import { Pencil, AlertTriangle, Check, Ban } from 'lucide-react';

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
        governmentForm: selectedCountry.countryInfo?.governmentForm || null,
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
                <TimelineEditor countryId={selectedCountry.id} />
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
  const [editingEvent, setEditingEvent] = useState<TimelineEventFormValues | null>(null);
  
  // Helper function to strip HTML tags from text
  const stripHtmlTags = (html: string) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };
  
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
      if (editingEvent?.id) {
        // Update existing event (if we had an API for this)
        // await apiRequest('PATCH', `/api/countries/${countryId}/timeline/${editingEvent.id}`, data);
        toast({
          title: 'Not Implemented',
          description: 'Updating existing timeline events is not yet implemented in the API.',
          variant: 'destructive',
        });
      } else {
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
      }
      
      // Reset form
      form.reset({
        title: '',
        description: '',
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        eventType: 'Political',
        icon: 'none',
      });
      setEditingEvent(null);
      
    } catch (error) {
      console.error('Failed to save timeline event:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the timeline event.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle edit button click
  const handleEdit = (event: TimelineEvent) => {
    // Process the date properly regardless of format
    const dateStr = (() => {
      if (!event.date) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Convert date to string if it's not already
      const dateString = typeof event.date === 'string' 
        ? event.date 
        : new Date(event.date as Date).toISOString();
        
      // If it's a formatted string without time part, use as is
      if (!dateString.includes('T') && !dateString.includes(':')) {
        return dateString;
      }
      
      // Otherwise try to parse it into a date and format
      try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      } catch (e) {
        return dateString;
      }
    })();
    
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: event.description,
      date: dateStr, 
      eventType: event.eventType,
      icon: event.icon,
    });
    
    form.reset({
      title: event.title,
      description: event.description,
      date: dateStr,
      eventType: event.eventType,
      icon: event.icon,
    });
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Political">Political</SelectItem>
                        <SelectItem value="Economic">Economic</SelectItem>
                        <SelectItem value="Social">Social</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Military">Military</SelectItem>
                        <SelectItem value="Diplomatic">Diplomatic</SelectItem>
                        <SelectItem value="Legal">Legal</SelectItem>
                        <SelectItem value="Religious">Religious</SelectItem>
                        <SelectItem value="Scientific">Scientific</SelectItem>
                        <SelectItem value="Environmental">Environmental</SelectItem>
                        <SelectItem value="Technological">Technological</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="star">Star</SelectItem>
                      <SelectItem value="flag">Flag</SelectItem>
                      <SelectItem value="landmark">Landmark</SelectItem>
                      <SelectItem value="crown">Crown</SelectItem>
                      <SelectItem value="building">Building</SelectItem>
                      <SelectItem value="coins">Coins</SelectItem>
                      <SelectItem value="scale">Scale</SelectItem>
                      <SelectItem value="scroll">Scroll</SelectItem>
                      <SelectItem value="sword">Sword</SelectItem>
                      <SelectItem value="shield">Shield</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="globe">Globe</SelectItem>
                      <SelectItem value="map">Map</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
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
              {editingEvent ? 'Update Event' : 'Add Event'}
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
                        onClick={() => handleEdit(event)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Pencil size={18} />
                      </button>
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
                    <span className="ml-2 text-xs px-2 py-1 rounded-full bg-primary/10">{event.eventType}</span>
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

export default AdminPage;