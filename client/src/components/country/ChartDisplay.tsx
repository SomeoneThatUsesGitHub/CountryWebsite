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

// Get chart data from statistics
export const getPopulationData = (statistics: any[] = []) => {
  const populationStat = statistics.find(s => s.type === 'Population');
  
  if (populationStat && populationStat.data && Array.isArray(populationStat.data.values)) {
    return populationStat.data.values;
  }
  
  // Default data if no statistics found
  return [
    { year: '2000', population: 20000000 },
    { year: '2005', population: 22000000 },
    { year: '2010', population: 24000000 },
    { year: '2015', population: 26000000 },
    { year: '2020', population: 28000000 },
    { year: '2023', population: 29000000 },
  ];
};

export const getGDPData = (statistics: any[] = []) => {
  const gdpStat = statistics.find(s => s.type === 'GDP');
  
  if (gdpStat && gdpStat.data && Array.isArray(gdpStat.data.values)) {
    return gdpStat.data.values;
  }
  
  // Default data if no statistics found
  return [
    { year: '2018', gdp: 100 },
    { year: '2019', gdp: 120 },
    { year: '2020', gdp: 110 },
    { year: '2021', gdp: 130 },
    { year: '2022', gdp: 150 },
  ];
};

export const getReligionData = (statistics: any[] = []) => {
  const religionStat = statistics.find(s => s.type === 'Religion');
  
  if (religionStat && religionStat.data && Array.isArray(religionStat.data.values)) {
    return religionStat.data.values;
  }
  
  // Default data if no statistics found
  return [
    { name: 'Christian', value: 45 },
    { name: 'Muslim', value: 35 },
    { name: 'Indigenous', value: 15 },
    { name: 'Other', value: 5 },
  ];
};

// These are kept for backward compatibility
export const generateSamplePopulationData = (countryName: string) => {
  return [
    { year: '2000', population: 20000000 },
    { year: '2005', population: 22000000 },
    { year: '2010', population: 24000000 },
    { year: '2015', population: 26000000 },
    { year: '2020', population: 28000000 },
    { year: '2023', population: 29000000 },
  ];
};

export const generateSampleGDPData = (countryName: string) => {
  return [
    { year: '2018', gdp: 100 },
    { year: '2019', gdp: 120 },
    { year: '2020', gdp: 110 },
    { year: '2021', gdp: 130 },
    { year: '2022', gdp: 150 },
  ];
};

export const generateSampleReligionData = (countryName: string) => {
  return [
    { name: 'Christian', value: 45 },
    { name: 'Muslim', value: 35 },
    { name: 'Indigenous', value: 15 },
    { name: 'Other', value: 5 },
  ];
};
