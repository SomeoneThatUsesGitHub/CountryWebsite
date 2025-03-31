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
import { 
  Country, 
  TimelineEvent, 
  PoliticalLeader, 
  PoliticalSystem,
  InternationalRelation,
  HistoricalLaw,
  Statistic,
  EconomicData
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      const countryInfo = selectedCountry.countryInfo || {};
      const governmentForm = typeof countryInfo === 'object' && 'governmentForm' in countryInfo 
        ? countryInfo.governmentForm as string | null
        : null;
      
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
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
                <TabsTrigger value="politics">Political System</TabsTrigger>
                <TabsTrigger value="economy">Economy</TabsTrigger>
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
                      <CardTitle>Statistics Editor Options</CardTitle>
                      <CardDescription>Choose which statistics editor you'd like to use</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="new">
                        <TabsList className="grid grid-cols-2 mb-4">
                          <TabsTrigger value="new">New Editor (Recommended)</TabsTrigger>
                          <TabsTrigger value="old">Old Editor</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="new">
                          <StatisticsEditor countryId={selectedCountry.id} />
                        </TabsContent>
                        
                        <TabsContent value="old">
                          <OldStatisticsEditor countryId={selectedCountry.id} />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Political System Tab */}
              <TabsContent value="politics">
                <PoliticalSystemEditor countryId={selectedCountry.id} />
              </TabsContent>
              
              {/* Economy Tab */}
              <TabsContent value="economy">
                <EconomyEditor countryId={selectedCountry.id} />
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
          <h3 className="text-lg font-medium">{editingEvent?.id ? 'Edit Event' : 'Add Event'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., May 1991, Jan 5 2020, 1776, etc."
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the date in any format you prefer (year, month/year, or full date)
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
                        <SelectItem value="Disaster">Disaster</SelectItem>
                        <SelectItem value="War">War</SelectItem>
                        <SelectItem value="Treaty">Treaty</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="none">No icon</SelectItem>
                        <SelectItem value="crown">👑 Crown</SelectItem>
                        <SelectItem value="landmark">🏛️ Landmark</SelectItem>
                        <SelectItem value="gavel">⚖️ Gavel</SelectItem>
                        <SelectItem value="university">🏫 University</SelectItem>
                        <SelectItem value="handshake">🤝 Handshake</SelectItem>
                        <SelectItem value="file-signature">📝 File Signature</SelectItem>
                        <SelectItem value="users">👥 Users</SelectItem>
                        <SelectItem value="flag">🚩 Flag</SelectItem>
                        <SelectItem value="calendar-day">📅 Calendar</SelectItem>
                        <SelectItem value="chart-line">📈 Chart</SelectItem>
                        <SelectItem value="balance-scale">⚖️ Balance Scale</SelectItem>
                        <SelectItem value="newspaper">📰 Newspaper</SelectItem>
                        <SelectItem value="vote-yea">🗳️ Vote</SelectItem>
                        <SelectItem value="coins">💰 Coins</SelectItem>
                        <SelectItem value="building">🏢 Building</SelectItem>
                        <SelectItem value="exclamation-triangle">⚠️ Warning</SelectItem>
                        <SelectItem value="user-shield">🛡️ User Shield</SelectItem>
                        <SelectItem value="theater-masks">🎭 Theater Masks</SelectItem>
                        <SelectItem value="dove">🕊️ Dove</SelectItem>
                        <SelectItem value="fighter-jet">✈️ Fighter Jet</SelectItem>
                        <SelectItem value="bolt">⚡ Lightning</SelectItem>
                        <SelectItem value="fire">🔥 Fire</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Choose an icon that represents this event
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <div className="min-h-[200px]">
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline', 'strike'],
                          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                          ['blockquote', 'link'],
                          [{ 'header': 1 }, { 'header': 2 }],
                          [{ 'color': [] }, { 'background': [] }]
                        ]
                      }}
                      className="h-40"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Use formatting tools to make the content more engaging. You can add bold, italic, lists, and more.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            {editingEvent?.id && (
              <Button type="button" variant="outline" onClick={() => {
                setEditingEvent(null);
                form.reset({
                  title: '',
                  description: '',
                  date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                  eventType: 'Political',
                  icon: 'none',
                });
              }}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {editingEvent?.id ? 'Update Event' : 'Add Event'}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b font-medium">
          Timeline Events
        </div>
        {eventsLoading ? (
          <div className="p-4 text-center">Loading events...</div>
        ) : events && events.length > 0 ? (
          <div className="divide-y">
            {events.map((event) => (
              <div key={event.id} className="p-4 flex flex-col md:flex-row md:justify-between gap-2">
                <div>
                  <p className="font-semibold">{event.title}</p>
                  <p className="text-sm text-gray-500">{formatDate(event.date)} - {event.eventType}</p>
                  <div className="mt-1 line-clamp-3">
                    {/* Show plain text in the admin list view */}
                    <div className="text-sm">
                      {stripHtmlTags(event.description).substring(0, 150)}
                      {event.description.length > 150 && '...'}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 md:self-center">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No timeline events found. Add your first event above.
          </div>
        )}
      </div>
    </div>
  );
};

// Political System Editor Component
interface PoliticalLeaderFormValues {
  id?: number;
  name: string;
  title: string;
  party: string | null;
  imageUrl: string | null;
  startDate: string | null;
  ideologies: string[];
}

const politicalLeaderSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Leader name is required'),
  title: z.string().min(1, 'Title is required'),
  party: z.string().nullable(),
  imageUrl: z.string().url('Must be a valid URL').nullable(),
  startDate: z.string().nullable(),
  ideologies: z.array(z.string()).default([]),
});

// Political System Form Values
interface PoliticalSystemFormValues {
  id?: number;
  type: string;
  details: string | null;
  freedomIndex: number | null;
  electionSystem: string | null;
  governmentBranches: any;
  democraticPrinciples: any;
  internationalRelations: any;
  laws: any;
  organizations: any;
}

const politicalSystemSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, 'System type is required'),
  details: z.string().nullable(),
  freedomIndex: z.number().min(0).max(100).nullable(),
  electionSystem: z.string().nullable(),
  governmentBranches: z.any(),
  democraticPrinciples: z.any(),
  internationalRelations: z.any(),
  laws: z.any(),
  organizations: z.any(),
});

// International Relation Form Values
interface RelationFormValues {
  id?: number;
  partnerCountry: string;
  relationType: string;
  startDate: string | null;
  details: string | null;
  relationStrength: string | null;
}

const relationSchema = z.object({
  id: z.number().optional(),
  partnerCountry: z.string().min(1, 'Partner country is required'),
  relationType: z.string().min(1, 'Relation type is required'),
  startDate: z.string().nullable(),
  details: z.string().nullable(),
  relationStrength: z.string().nullable(),
});

// Historical Law Form Values
interface LawFormValues {
  id?: number;
  title: string;
  date: string | null;
  status: string | null;
  description: string | null;
  category: string | null;
}

const lawSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, 'Law title is required'),
  date: z.string().nullable(),
  status: z.string().nullable(),
  description: z.string().nullable(),
  category: z.string().nullable(),
});

const PoliticalSystemEditor: React.FC<{ countryId: number }> = ({ countryId }) => {
  // Political Leaders state
  const [leaders, setLeaders] = useState<PoliticalLeader[]>([]);
  const [editingLeader, setEditingLeader] = useState<PoliticalLeaderFormValues | null>(null);
  const [ideologyInput, setIdeologyInput] = useState('');
  
  // Political System state
  const [politicalSystem, setPoliticalSystem] = useState<PoliticalSystem | null>(null);
  const [democraticPrincipleInput, setDemocraticPrincipleInput] = useState('');
  const [organizationInput, setOrganizationInput] = useState('');
  
  // International Relations state
  const [relations, setRelations] = useState<InternationalRelation[]>([]);
  const [editingRelation, setEditingRelation] = useState<RelationFormValues | null>(null);
  
  // Historical Laws state
  const [laws, setLaws] = useState<HistoricalLaw[]>([]);
  const [editingLaw, setEditingLaw] = useState<LawFormValues | null>(null);
  
  // Fetch political leaders for the selected country
  const { data: politicalLeaders, isLoading: leadersLoading, refetch: refetchLeaders } = useQuery<PoliticalLeader[]>({
    queryKey: [`/api/countries/${countryId}/leaders`],
    enabled: countryId !== null,
  });
  
  // Fetch political system for the selected country
  const { data: fetchedPoliticalSystem, isLoading: politicalSystemLoading, refetch: refetchPoliticalSystem } = useQuery<PoliticalSystem>({
    queryKey: [`/api/countries/${countryId}/political-system`],
    enabled: countryId !== null,
  });
  
  // Fetch international relations for the selected country
  const { data: fetchedRelations, isLoading: relationsLoading, refetch: refetchRelations } = useQuery<InternationalRelation[]>({
    queryKey: [`/api/countries/${countryId}/relations`],
    enabled: countryId !== null,
  });
  
  // Fetch historical laws for the selected country
  const { data: fetchedLaws, isLoading: lawsLoading, refetch: refetchLaws } = useQuery<HistoricalLaw[]>({
    queryKey: [`/api/countries/${countryId}/laws`],
    enabled: countryId !== null,
  });
  
  // Setup the form
  const form = useForm<PoliticalLeaderFormValues>({
    resolver: zodResolver(politicalLeaderSchema),
    defaultValues: {
      name: '',
      title: '',
      party: null,
      imageUrl: null,
      startDate: null,
      ideologies: [],
    },
  });
  
  // Create form for political system
  const systemForm = useForm<PoliticalSystemFormValues>({
    resolver: zodResolver(politicalSystemSchema),
    defaultValues: {
      type: '',
      details: null,
      freedomIndex: null,
      electionSystem: null,
      governmentBranches: {},
      democraticPrinciples: [],
      internationalRelations: {},
      laws: {},
      organizations: [],
    },
  });
  
  // Create form for international relations
  const relationForm = useForm<RelationFormValues>({
    resolver: zodResolver(relationSchema),
    defaultValues: {
      partnerCountry: '',
      relationType: '',
      startDate: null,
      details: null,
      relationStrength: null,
    },
  });
  
  // Create form for historical laws
  const lawForm = useForm<LawFormValues>({
    resolver: zodResolver(lawSchema),
    defaultValues: {
      title: '',
      date: null,
      status: null,
      description: null,
      category: null,
    },
  });

  // Update leaders when data is fetched
  React.useEffect(() => {
    if (politicalLeaders) {
      setLeaders(politicalLeaders);
    }
  }, [politicalLeaders]);
  
  // Update political system when fetched
  React.useEffect(() => {
    if (fetchedPoliticalSystem) {
      setPoliticalSystem(fetchedPoliticalSystem);
      
      // Parse JSON fields
      const governmentBranches = typeof fetchedPoliticalSystem.governmentBranches === 'string' 
        ? JSON.parse(fetchedPoliticalSystem.governmentBranches as string)
        : (fetchedPoliticalSystem.governmentBranches || {});
      
      const democraticPrinciples = typeof fetchedPoliticalSystem.democraticPrinciples === 'string'
        ? JSON.parse(fetchedPoliticalSystem.democraticPrinciples as string)
        : (fetchedPoliticalSystem.democraticPrinciples || []);
      
      const internationalRelations = typeof fetchedPoliticalSystem.internationalRelations === 'string'
        ? JSON.parse(fetchedPoliticalSystem.internationalRelations as string)
        : (fetchedPoliticalSystem.internationalRelations || {});
      
      const laws = typeof fetchedPoliticalSystem.laws === 'string'
        ? JSON.parse(fetchedPoliticalSystem.laws as string)
        : (fetchedPoliticalSystem.laws || {});
        
      const organizations = typeof fetchedPoliticalSystem.organizations === 'string'
        ? JSON.parse(fetchedPoliticalSystem.organizations as string)
        : (fetchedPoliticalSystem.organizations || []);
      
      systemForm.reset({
        id: fetchedPoliticalSystem.id,
        type: fetchedPoliticalSystem.type,
        details: fetchedPoliticalSystem.details,
        freedomIndex: fetchedPoliticalSystem.freedomIndex,
        electionSystem: fetchedPoliticalSystem.electionSystem,
        governmentBranches,
        democraticPrinciples,
        internationalRelations,
        laws,
        organizations,
      });
    }
  }, [fetchedPoliticalSystem, systemForm]);
  
  // Update international relations when fetched
  React.useEffect(() => {
    if (fetchedRelations) {
      setRelations(fetchedRelations);
    }
  }, [fetchedRelations]);
  
  // Update historical laws when fetched
  React.useEffect(() => {
    if (fetchedLaws) {
      setLaws(fetchedLaws);
    }
  }, [fetchedLaws]);
  
  // Handle form submission
  const onSubmit = async (data: PoliticalLeaderFormValues) => {
    try {
      if (editingLeader?.id) {
        // Update existing leader (if we had an API for this)
        // await apiRequest('PATCH', `/api/countries/${countryId}/leaders/${editingLeader.id}`, data);
        toast({
          title: 'Not Implemented',
          description: 'Updating existing political leaders is not yet implemented in the API.',
          variant: 'destructive',
        });
      } else {
        // Create new leader
        await apiRequest('POST', `/api/countries/${countryId}/leaders`, {
          ...data,
          countryId,
          startDate: data.startDate ? new Date(data.startDate) : null, // Convert string to Date object if present
        });
        
        // Refetch political leaders
        refetchLeaders();
        
        toast({
          title: 'Leader Added',
          description: 'The political leader has been successfully added.',
        });
      }
      
      // Reset form
      form.reset({
        name: '',
        title: '',
        party: null,
        imageUrl: null,
        startDate: null,
        ideologies: [],
      });
      setEditingLeader(null);
      
    } catch (error) {
      console.error('Failed to save political leader:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the political leader.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle edit button click
  const handleEdit = (leader: PoliticalLeader) => {
    setEditingLeader({
      id: leader.id,
      name: leader.name,
      title: leader.title,
      party: leader.party,
      imageUrl: leader.imageUrl,
      startDate: leader.startDate ? new Date(leader.startDate).toISOString().split('T')[0] : null,
      ideologies: Array.isArray(leader.ideologies) ? leader.ideologies : [],
    });
    
    form.reset({
      name: leader.name,
      title: leader.title,
      party: leader.party,
      imageUrl: leader.imageUrl,
      startDate: leader.startDate ? new Date(leader.startDate).toISOString().split('T')[0] : null,
      ideologies: Array.isArray(leader.ideologies) ? leader.ideologies : [],
    });
  };
  
  // Add ideology to the list
  const addIdeology = () => {
    if (ideologyInput.trim()) {
      const currentIdeologies = form.getValues('ideologies') || [];
      form.setValue('ideologies', [...currentIdeologies, ideologyInput.trim()]);
      setIdeologyInput('');
    }
  };
  
  // Remove ideology from the list
  const removeIdeology = (index: number) => {
    const currentIdeologies = form.getValues('ideologies') || [];
    form.setValue('ideologies', currentIdeologies.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Political Leaders</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium">{editingLeader?.id ? 'Edit Leader' : 'Add Leader'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
                  <FormLabel>Political Party (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ''} />
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
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormDescription>
                    URL to the leader's portrait or photo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="ideologies"
                render={() => (
                  <FormItem>
                    <FormLabel>Ideologies</FormLabel>
                    <div className="flex gap-2">
                      <Input 
                        value={ideologyInput}
                        onChange={(e) => setIdeologyInput(e.target.value)}
                        placeholder="Enter an ideology"
                      />
                      <Button type="button" onClick={addIdeology}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.watch('ideologies')?.map((ideology, index) => (
                        <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                          <span>{ideology}</span>
                          <button 
                            type="button" 
                            onClick={() => removeIdeology(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            {editingLeader?.id && (
              <Button type="button" variant="outline" onClick={() => {
                setEditingLeader(null);
                form.reset({
                  name: '',
                  title: '',
                  party: null,
                  imageUrl: null,
                  startDate: null,
                  ideologies: [],
                });
              }}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {editingLeader?.id ? 'Update Leader' : 'Add Leader'}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b font-medium">
          Political Leaders
        </div>
        {leadersLoading ? (
          <div className="p-4 text-center">Loading leaders...</div>
        ) : leaders && leaders.length > 0 ? (
          <div className="divide-y">
            {leaders.map((leader) => (
              <div key={leader.id} className="p-4 flex flex-col md:flex-row md:justify-between gap-2">
                <div className="flex gap-4">
                  {leader.imageUrl && (
                    <img src={leader.imageUrl} alt={leader.name} className="w-16 h-16 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-semibold">{leader.name}</p>
                    <p className="text-sm">{leader.title}</p>
                    {leader.party && <p className="text-sm">Party: {leader.party}</p>}
                    {leader.startDate && <p className="text-sm">In office since: {new Date(leader.startDate).toLocaleDateString()}</p>}
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
                <div className="flex gap-2 md:self-center">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(leader)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No political leaders found. Add your first leader above.
          </div>
        )}
      </div>
    </div>
  );
};

// Economy Editor Component
interface EconomicDataFormValues {
  gdp: number | null;
  gdpPerCapita: number | null;
  gdpGrowth: string | null;
  inflation: string | null;
  mainIndustries: {name: string, percentage: number}[];
  tradingPartners: string[];
  challenges: {title: string, description: string, icon: string}[];
  reforms: string[];
}

const economicDataSchema = z.object({
  gdp: z.number().nullable(),
  gdpPerCapita: z.number().nullable(),
  gdpGrowth: z.string().nullable(),
  inflation: z.string().nullable(),
  mainIndustries: z.array(
    z.object({
      name: z.string(),
      percentage: z.number().min(0).max(100),
    })
  ).default([]),
  tradingPartners: z.array(z.string()).default([]),
  challenges: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ).default([]),
  reforms: z.array(z.string()).default([]),
});

const EconomyEditor: React.FC<{ countryId: number }> = ({ countryId }) => {
  const [economicData, setEconomicData] = useState<EconomicData | null>(null);
  const [partnerInput, setPartnerInput] = useState('');
  const [reformInput, setReformInput] = useState('');
  const [industryName, setIndustryName] = useState('');
  const [industryPercentage, setIndustryPercentage] = useState<number>(0);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeIcon, setChallengeIcon] = useState('');
  
  // Fetch economic data for the selected country
  const { data: fetchedEconomicData, isLoading: economicDataLoading, refetch: refetchEconomicData } = useQuery<EconomicData>({
    queryKey: [`/api/countries/${countryId}/economy`],
    enabled: countryId !== null,
  });
  
  // Setup the form
  const form = useForm<EconomicDataFormValues>({
    resolver: zodResolver(economicDataSchema),
    defaultValues: {
      gdp: null,
      gdpPerCapita: null,
      gdpGrowth: null,
      inflation: null,
      mainIndustries: [],
      tradingPartners: [],
      challenges: [],
      reforms: [],
    },
  });
  
  // Update economic data when fetched
  React.useEffect(() => {
    if (fetchedEconomicData) {
      setEconomicData(fetchedEconomicData);
      
      // Parse JSON fields
      const mainIndustries = typeof fetchedEconomicData.mainIndustries === 'string' 
        ? JSON.parse(fetchedEconomicData.mainIndustries as string)
        : (fetchedEconomicData.mainIndustries || []);
      
      const tradingPartners = typeof fetchedEconomicData.tradingPartners === 'string'
        ? JSON.parse(fetchedEconomicData.tradingPartners as string)
        : (fetchedEconomicData.tradingPartners || []);
      
      const challenges = typeof fetchedEconomicData.challenges === 'string'
        ? JSON.parse(fetchedEconomicData.challenges as string)
        : (fetchedEconomicData.challenges || []);
      
      const reforms = typeof fetchedEconomicData.reforms === 'string'
        ? JSON.parse(fetchedEconomicData.reforms as string)
        : (fetchedEconomicData.reforms || []);
      
      form.reset({
        gdp: fetchedEconomicData.gdp,
        gdpPerCapita: fetchedEconomicData.gdpPerCapita,
        gdpGrowth: fetchedEconomicData.gdpGrowth,
        inflation: fetchedEconomicData.inflation,
        mainIndustries,
        tradingPartners,
        challenges,
        reforms,
      });
    }
  }, [fetchedEconomicData, form]);
  
  // Handle form submission
  const onSubmit = async (data: EconomicDataFormValues) => {
    try {
      if (economicData?.id) {
        // Update existing economic data
        await apiRequest('PATCH', `/api/countries/${countryId}/economy/${economicData.id}`, {
          ...data,
          countryId,
        });
        
        toast({
          title: 'Economic Data Updated',
          description: 'The economic data has been successfully updated.',
        });
      } else {
        // Create new economic data
        await apiRequest('POST', `/api/countries/${countryId}/economy`, {
          ...data,
          countryId,
        });
        
        toast({
          title: 'Economic Data Added',
          description: 'The economic data has been successfully added.',
        });
      }
      
      // Refetch economic data
      refetchEconomicData();
      
    } catch (error) {
      console.error('Failed to save economic data:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the economic data.',
        variant: 'destructive',
      });
    }
  };
  
  // Add trading partner
  const addPartner = () => {
    if (partnerInput.trim()) {
      const currentPartners = form.getValues('tradingPartners') || [];
      form.setValue('tradingPartners', [...currentPartners, partnerInput.trim()]);
      setPartnerInput('');
    }
  };
  
  // Remove trading partner
  const removePartner = (index: number) => {
    const currentPartners = form.getValues('tradingPartners') || [];
    form.setValue('tradingPartners', currentPartners.filter((_, i) => i !== index));
  };
  
  // Add reform
  const addReform = () => {
    if (reformInput.trim()) {
      const currentReforms = form.getValues('reforms') || [];
      form.setValue('reforms', [...currentReforms, reformInput.trim()]);
      setReformInput('');
    }
  };
  
  // Remove reform
  const removeReform = (index: number) => {
    const currentReforms = form.getValues('reforms') || [];
    form.setValue('reforms', currentReforms.filter((_, i) => i !== index));
  };
  
  // Add industry
  const addIndustry = () => {
    if (industryName.trim() && industryPercentage > 0) {
      const currentIndustries = form.getValues('mainIndustries') || [];
      form.setValue('mainIndustries', [
        ...currentIndustries, 
        { name: industryName.trim(), percentage: industryPercentage }
      ]);
      setIndustryName('');
      setIndustryPercentage(0);
    }
  };
  
  // Remove industry
  const removeIndustry = (index: number) => {
    const currentIndustries = form.getValues('mainIndustries') || [];
    form.setValue('mainIndustries', currentIndustries.filter((_, i) => i !== index));
  };
  
  // Add challenge
  const addChallenge = () => {
    if (challengeTitle.trim() && challengeDescription.trim()) {
      const currentChallenges = form.getValues('challenges') || [];
      form.setValue('challenges', [
        ...currentChallenges, 
        { 
          title: challengeTitle.trim(), 
          description: challengeDescription.trim(), 
          icon: challengeIcon.trim() || 'alert-triangle' 
        }
      ]);
      setChallengeTitle('');
      setChallengeDescription('');
      setChallengeIcon('');
    }
  };
  
  // Remove challenge
  const removeChallenge = (index: number) => {
    const currentChallenges = form.getValues('challenges') || [];
    form.setValue('challenges', currentChallenges.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Economic Data</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="gdp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GDP (in billions USD)</FormLabel>
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
              name="gdpPerCapita"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GDP Per Capita (USD)</FormLabel>
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
              name="gdpGrowth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GDP Growth Rate (e.g., "2.5%")</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="inflation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inflation Rate (e.g., "3.2%")</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Main Industries</h3>
            <div className="flex gap-2">
              <Input 
                value={industryName}
                onChange={(e) => setIndustryName(e.target.value)}
                placeholder="Industry name"
              />
              <Input 
                type="number"
                value={industryPercentage === 0 ? '' : industryPercentage}
                onChange={(e) => setIndustryPercentage(parseFloat(e.target.value) || 0)}
                placeholder="% of GDP"
                className="w-32"
              />
              <Button type="button" onClick={addIndustry}>Add</Button>
            </div>
            
            <div className="space-y-2">
              {form.watch('mainIndustries')?.map((industry, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                  <div>
                    <span className="font-medium">{industry.name}</span>
                    <span className="ml-2 text-gray-500">{industry.percentage}% of GDP</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeIndustry(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium">Trading Partners</h3>
            <div className="flex gap-2">
              <Input 
                value={partnerInput}
                onChange={(e) => setPartnerInput(e.target.value)}
                placeholder="Enter a trading partner country"
              />
              <Button type="button" onClick={addPartner}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {form.watch('tradingPartners')?.map((partner, index) => (
                <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{partner}</span>
                  <button 
                    type="button" 
                    onClick={() => removePartner(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium">Economic Challenges</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input 
                value={challengeTitle}
                onChange={(e) => setChallengeTitle(e.target.value)}
                placeholder="Challenge title"
              />
              <Input 
                value={challengeDescription}
                onChange={(e) => setChallengeDescription(e.target.value)}
                placeholder="Description"
              />
              <div className="flex gap-2">
                <Input 
                  value={challengeIcon}
                  onChange={(e) => setChallengeIcon(e.target.value)}
                  placeholder="Icon name (optional)"
                />
                <Button type="button" onClick={addChallenge}>Add</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {form.watch('challenges')?.map((challenge, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                  <div>
                    <span className="font-medium">{challenge.title}</span>
                    <span className="ml-2 text-gray-500">{challenge.description}</span>
                    {challenge.icon && <span className="ml-2 text-xs text-gray-400">Icon: {challenge.icon}</span>}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeChallenge(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            
            <h3 className="text-lg font-medium">Economic Reforms</h3>
            <div className="flex gap-2">
              <Input 
                value={reformInput}
                onChange={(e) => setReformInput(e.target.value)}
                placeholder="Enter an economic reform"
              />
              <Button type="button" onClick={addReform}>Add</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {form.watch('reforms')?.map((reform, index) => (
                <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <span>{reform}</span>
                  <button 
                    type="button" 
                    onClick={() => removeReform(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={economicDataLoading}>
              {economicData ? 'Update Economic Data' : 'Save Economic Data'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

// Statistics Editor Component
interface StatisticFormValues {
  id?: number;
  type: string;
  year: number | null;
  data: any; // This should be more specific based on the actual data structure
}

const statisticSchema = z.object({
  id: z.number().optional(),
  type: z.string().min(1, 'Statistic type is required'),
  year: z.number().nullable(),
  data: z.any(), // This should be more specific based on the actual data structure
});

const OldStatisticsEditor: React.FC<{ countryId: number }> = ({ countryId }) => {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [editingStatistic, setEditingStatistic] = useState<StatisticFormValues | null>(null);
  
  // Fetch statistics for the selected country
  const { data: countryStatistics, isLoading: statisticsLoading, refetch: refetchStatistics } = useQuery<Statistic[]>({
    queryKey: [`/api/countries/${countryId}/statistics`],
    enabled: countryId !== null,
  });
  
  // Setup the form
  const form = useForm<StatisticFormValues>({
    resolver: zodResolver(statisticSchema),
    defaultValues: {
      type: 'Population',
      year: new Date().getFullYear(),
      data: { values: [] },
    },
  });
  
  // Update statistics when data is fetched
  React.useEffect(() => {
    if (countryStatistics) {
      setStatistics(countryStatistics);
    }
  }, [countryStatistics]);
  
  // Handle form submission
  const onSubmit = async (data: StatisticFormValues) => {
    try {
      if (editingStatistic?.id) {
        // Update existing statistic
        await apiRequest('PATCH', `/api/countries/${countryId}/statistics/${editingStatistic.id}`, {
          ...data,
          countryId,
        });
        
        // Refetch statistics
        refetchStatistics();
        
        toast({
          title: 'Statistic Updated',
          description: 'The statistic has been successfully updated.',
        });
      } else {
        // Create new statistic
        await apiRequest('POST', `/api/countries/${countryId}/statistics`, {
          ...data,
          countryId,
        });
        
        // Refetch statistics
        refetchStatistics();
        
        toast({
          title: 'Statistic Added',
          description: 'The statistic has been successfully added.',
        });
      }
      
      // Reset form
      form.reset({
        type: 'Population',
        year: new Date().getFullYear(),
        data: { values: [] },
      });
      setEditingStatistic(null);
      
    } catch (error) {
      console.error('Failed to save statistic:', error);
      toast({
        title: 'Error',
        description: 'There was an error saving the statistic.',
        variant: 'destructive',
      });
    }
  };
  
  // Handle edit button click
  const handleEdit = (statistic: Statistic) => {
    setEditingStatistic({
      id: statistic.id,
      type: statistic.type,
      year: statistic.year,
      data: statistic.data || { values: [] },
    });
    
    form.reset({
      type: statistic.type,
      year: statistic.year,
      data: statistic.data || { values: [] },
    });
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Country Statistics</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 border rounded-lg p-4 bg-gray-50">
          <h3 className="text-lg font-medium">{editingStatistic?.id ? 'Edit Statistic' : 'Add Statistic'}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statistic Type</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select statistic type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Population">Population</SelectItem>
                        <SelectItem value="GDP">GDP</SelectItem>
                        <SelectItem value="Inflation">Inflation</SelectItem>
                        <SelectItem value="Unemployment">Unemployment</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Crime">Crime</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
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
          </div>
          
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data (JSON format)</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field}
                    rows={5}
                    value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : field.value}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        field.onChange(parsed);
                      } catch (err) {
                        // If not valid JSON, just store as string
                        field.onChange(e.target.value);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Enter data in JSON format with yearly values
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end gap-2">
            {editingStatistic?.id && (
              <Button type="button" variant="outline" onClick={() => {
                setEditingStatistic(null);
                form.reset({
                  type: 'Population',
                  year: new Date().getFullYear(),
                  data: { values: [] },
                });
              }}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {editingStatistic?.id ? 'Update Statistic' : 'Add Statistic'}
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b font-medium">
          Country Statistics
        </div>
        {statisticsLoading ? (
          <div className="p-4 text-center">Loading statistics...</div>
        ) : statistics && statistics.length > 0 ? (
          <div className="divide-y">
            {statistics.map((statistic) => (
              <div key={statistic.id} className="p-4 flex flex-col md:flex-row md:justify-between gap-2">
                <div>
                  <p className="font-semibold">{statistic.type} {statistic.year ? `(${statistic.year})` : ''}</p>
                  <p className="mt-1 font-mono text-sm bg-gray-100 p-2 rounded">
                    {JSON.stringify(statistic.data, null, 2)}
                  </p>
                </div>
                <div className="flex gap-2 md:self-center">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(statistic)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            No statistics found. Add your first statistic above.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;