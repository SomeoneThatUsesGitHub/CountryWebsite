import { Country } from "../types";

// Group countries by region for homepage display
export function groupCountriesByRegion(countries: Country[]): Record<string, Country[]> {
  return countries.reduce((acc, country) => {
    const region = country.region;
    if (!region) return acc;
    
    if (!acc[region]) {
      acc[region] = [];
    }
    
    acc[region].push(country);
    return acc;
  }, {} as Record<string, Country[]>);
}

// Format large numbers with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date to readable string
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Get event badge color based on event type
export function getEventBadgeColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    'election': 'bg-blue-100 text-blue-800',
    'protest': 'bg-red-100 text-red-800',
    'agreement': 'bg-green-100 text-green-800',
    'conflict': 'bg-amber-100 text-amber-800',
    'legislation': 'bg-purple-100 text-purple-800',
    'referendum': 'bg-indigo-100 text-indigo-800',
    'scandal': 'bg-pink-100 text-pink-800',
    'default': 'bg-gray-100 text-gray-800'
  };
  
  return colorMap[eventType.toLowerCase()] || colorMap.default;
}

// Get event icon color based on event type
export function getEventDotColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    'election': 'bg-primary',
    'protest': 'bg-red-500',
    'agreement': 'bg-green-500',
    'conflict': 'bg-amber-500',
    'legislation': 'bg-purple-500',
    'referendum': 'bg-indigo-500',
    'scandal': 'bg-pink-500',
    'default': 'bg-gray-500'
  };
  
  return colorMap[eventType.toLowerCase()] || colorMap.default;
}

// Get event icon based on event type
export function getEventIcon(eventType: string): string {
  const iconMap: Record<string, string> = {
    'election': 'fa-landmark',
    'protest': 'fa-exclamation-triangle',
    'agreement': 'fa-file-signature',
    'conflict': 'fa-fire',
    'legislation': 'fa-gavel',
    'referendum': 'fa-vote-yea',
    'scandal': 'fa-newspaper',
    'default': 'fa-calendar-day'
  };
  
  return iconMap[eventType.toLowerCase()] || iconMap.default;
}

// Get chart colors for consistent styling
export function getChartColors(index: number): string {
  const colors = [
    '#3B82F6', // primary blue
    '#10B981', // green
    '#F59E0B', // amber
    '#EF4444', // red
    '#8B5CF6', // purple
    '#EC4899', // pink
    '#6366F1', // indigo
    '#14B8A6', // teal
    '#F97316', // orange
    '#8D99AE'  // slate
  ];
  
  return colors[index % colors.length];
}
