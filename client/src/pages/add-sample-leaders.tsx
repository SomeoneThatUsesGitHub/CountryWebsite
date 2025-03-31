import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const SampleLeaders = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const sampleLeaders = [
    {
      countryId: 1, // South Georgia
      name: "Caroline Kingston",
      title: "Chief Commissioner",
      party: "Independent",
      imageUrl: "https://randomuser.me/api/portraits/women/41.jpg",
      startDate: "2022-01-15",
      ideologies: ["Environmentalism", "Conservation"]
    },
    {
      countryId: 2, // Bouvet Island
      name: "Magnus Olsen",
      title: "Territory Administrator",
      party: "Norwegian Conservative Party",
      imageUrl: "https://randomuser.me/api/portraits/men/22.jpg",
      startDate: "2021-06-10",
      ideologies: ["Conservatism", "Environmentalism"]
    },
    {
      countryId: 3, // Switzerland
      name: "Alain Berset",
      title: "President of the Swiss Confederation",
      party: "Social Democratic Party",
      imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
      startDate: "2023-01-01",
      ideologies: ["Social Democracy", "Liberalism"]
    },
    {
      countryId: 3, // Switzerland
      name: "Viola Amherd",
      title: "Vice President of the Federal Council",
      party: "The Centre",
      imageUrl: "https://randomuser.me/api/portraits/women/12.jpg",
      startDate: "2023-01-01",
      ideologies: ["Centrism", "Christian Democracy"]
    },
    {
      countryId: 4, // United States
      name: "Joe Biden",
      title: "President",
      party: "Democratic Party",
      imageUrl: "https://randomuser.me/api/portraits/men/33.jpg",
      startDate: "2021-01-20",
      ideologies: ["Liberalism", "Centrism"]
    },
    {
      countryId: 4, // United States
      name: "Kamala Harris",
      title: "Vice President",
      party: "Democratic Party",
      imageUrl: "https://randomuser.me/api/portraits/women/13.jpg",
      startDate: "2021-01-20",
      ideologies: ["Liberalism", "Progressivism"]
    },
    {
      countryId: 5, // Canada
      name: "Justin Trudeau",
      title: "Prime Minister",
      party: "Liberal Party",
      imageUrl: "https://randomuser.me/api/portraits/men/24.jpg",
      startDate: "2015-11-04",
      ideologies: ["Liberalism", "Progressivism"]
    },
    {
      countryId: 6, // Australia
      name: "Anthony Albanese",
      title: "Prime Minister",
      party: "Labor Party",
      imageUrl: "https://randomuser.me/api/portraits/men/25.jpg",
      startDate: "2022-05-23",
      ideologies: ["Social Democracy", "Labor Rights"]
    }
  ];

  const addSampleLeaders = async () => {
    setLoading(true);
    setStatus('Adding sample leaders...');
    
    try {
      for (const leader of sampleLeaders) {
        try {
          await apiRequest('POST', `/api/countries/${leader.countryId}/leaders`, leader);
          setStatus(prev => prev + `\nAdded ${leader.name} (${leader.title}) to country ID ${leader.countryId}`);
        } catch (error: any) {
          console.error(`Failed to add leader ${leader.name}:`, error);
          setStatus(prev => prev + `\nFailed to add ${leader.name}: ${error.message || 'Unknown error'}`);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Sample leaders added successfully',
      });
    } catch (error: any) {
      console.error('Error adding sample leaders:', error);
      toast({
        title: 'Error',
        description: 'Failed to add sample leaders: ' + (error.message || 'Unknown error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add Sample Political Leaders</h1>
      <p className="mb-4 text-gray-600">
        This page will add sample political leaders data to various countries in the database.
        This is for testing purposes only.
      </p>
      
      <Button 
        onClick={addSampleLeaders} 
        disabled={loading}
        className="mb-6"
      >
        {loading ? 'Adding...' : 'Add Sample Leaders'}
      </Button>
      
      {status && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-medium mb-2">Status:</h3>
          <pre className="whitespace-pre-wrap">{status}</pre>
        </div>
      )}
    </div>
  );
};

export default SampleLeaders;