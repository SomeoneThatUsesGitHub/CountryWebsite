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
    'political': 'bg-blue-100 text-blue-800',
    'election': 'bg-blue-100 text-blue-800',
    'protest': 'bg-red-100 text-red-800',
    'agreement': 'bg-green-100 text-green-800',
    'conflict': 'bg-amber-100 text-amber-800',
    'legislation': 'bg-purple-100 text-purple-800',
    'referendum': 'bg-indigo-100 text-indigo-800',
    'scandal': 'bg-pink-100 text-pink-800',
    'economic': 'bg-emerald-100 text-emerald-800',
    'social': 'bg-violet-100 text-violet-800',
    'cultural': 'bg-fuchsia-100 text-fuchsia-800',
    'disaster': 'bg-orange-100 text-orange-800',
    'war': 'bg-rose-100 text-rose-800',
    'treaty': 'bg-cyan-100 text-cyan-800',
    'default': 'bg-gray-100 text-gray-800'
  };
  
  return colorMap[eventType.toLowerCase()] || colorMap.default;
}

// Get event dot color based on event type with enhanced low-poly visual style
export function getEventDotColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    'political': 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-md',
    'election': 'bg-gradient-to-br from-blue-500 to-blue-700 shadow-md',
    'protest': 'bg-gradient-to-br from-red-500 to-red-700 shadow-md',
    'agreement': 'bg-gradient-to-br from-green-500 to-green-700 shadow-md',
    'conflict': 'bg-gradient-to-br from-amber-500 to-amber-700 shadow-md',
    'legislation': 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-md',
    'referendum': 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-md',
    'scandal': 'bg-gradient-to-br from-pink-500 to-pink-700 shadow-md',
    'economic': 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md',
    'social': 'bg-gradient-to-br from-violet-500 to-violet-700 shadow-md',
    'cultural': 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 shadow-md',
    'disaster': 'bg-gradient-to-br from-orange-500 to-orange-700 shadow-md',
    'war': 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-md',
    'treaty': 'bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-md',
    'default': 'bg-gradient-to-br from-gray-500 to-gray-700 shadow-md'
  };
  
  return colorMap[eventType.toLowerCase()] || colorMap.default;
}

// Get event icon based on event type or custom icon
export function getEventIcon(eventType: string, customIcon?: string | null): string {
  // If a custom icon is provided, use it directly with fontawesome prefix
  if (customIcon) {
    return `fa-${customIcon}`;
  }
  
  // Otherwise, use the event type map
  const iconMap: Record<string, string> = {
    'political': 'fa-landmark',
    'election': 'fa-landmark',
    'protest': 'fa-exclamation-triangle',
    'agreement': 'fa-file-signature',
    'conflict': 'fa-fire',
    'legislation': 'fa-gavel',
    'referendum': 'fa-vote-yea',
    'scandal': 'fa-newspaper',
    'economic': 'fa-chart-line',
    'social': 'fa-users',
    'cultural': 'fa-theater-masks',
    'disaster': 'fa-bolt',
    'war': 'fa-fighter-jet',
    'treaty': 'fa-handshake',
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
