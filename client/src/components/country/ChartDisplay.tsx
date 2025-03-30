import React, { useEffect, useState } from 'react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { getChartColors } from '@/lib/helpers';

// Population chart component
export const PopulationChart = ({ data }: { data: { year: string; population: number }[] }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <h3 className="text-lg font-bold mb-4">Population Growth (in millions)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value) => (Math.round(Number(value) / 1000000 * 10) / 10) + ' million'} />
          <Area 
            type="monotone" 
            dataKey="population" 
            stroke="#3B82F6" 
            fill="rgba(59, 130, 246, 0.1)" 
            activeDot={{ r: 8 }} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// GDP chart component
export const GDPChart = ({ data }: { data: { year: string; gdp: number }[] }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <h3 className="text-lg font-bold mb-4">GDP (in billions USD)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip formatter={(value) => '$' + value + ' billion'} />
          <Bar dataKey="gdp" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Religion chart component
export const ReligionChart = ({ data }: { data: { name: string; value: number }[] }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <h3 className="text-lg font-bold mb-4">Religion Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getChartColors(index)} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Sample data generators for demonstration
export const generateSamplePopulationData = (countryName: string) => {
  // This is just for demonstration - in a real app, this would come from the API
  const basePopulation = Math.floor(Math.random() * 100) + 20; // Random base between 20-120 million
  
  return [
    { year: '2000', population: basePopulation * 1000000 },
    { year: '2005', population: (basePopulation * 1.1) * 1000000 },
    { year: '2010', population: (basePopulation * 1.2) * 1000000 },
    { year: '2015', population: (basePopulation * 1.3) * 1000000 },
    { year: '2020', population: (basePopulation * 1.4) * 1000000 },
    { year: '2023', population: (basePopulation * 1.45) * 1000000 },
  ];
};

export const generateSampleGDPData = (countryName: string) => {
  // This is just for demonstration - in a real app, this would come from the API
  const baseGDP = Math.floor(Math.random() * 500) + 50; // Random base between 50-550 billion
  
  return [
    { year: '2018', gdp: Math.round(baseGDP * 0.8) },
    { year: '2019', gdp: Math.round(baseGDP * 0.9) },
    { year: '2020', gdp: Math.round(baseGDP * 0.85) }, // Simulating COVID impact
    { year: '2021', gdp: Math.round(baseGDP * 0.95) },
    { year: '2022', gdp: baseGDP },
  ];
};

export const generateSampleReligionData = (countryName: string) => {
  // This is just for demonstration - in a real app, this would come from the API
  // These numbers should add up to 100
  return [
    { name: 'Christian', value: 45 },
    { name: 'Muslim', value: 35 },
    { name: 'Indigenous', value: 15 },
    { name: 'Other', value: 5 },
  ];
};
