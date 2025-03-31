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

// Format date to readable string - handles any type of date input format
export function formatDate(date: string | Date): string {
  // If it's null or undefined, return empty string
  if (!date) return '';
  
  // If it's already a string without time components and doesn't look like an ISO date, just return it as-is
  if (typeof date === 'string' && 
      !date.includes('T') && 
      !date.includes(':') && 
      !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return date;
  }
  
  try {
    // If it looks like a valid date, format it nicely
    const dateObj = new Date(date);
    // Check if the date is valid before formatting
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // If it's not a valid date, return the original string
    return typeof date === 'string' ? date : String(date);
  } catch (error) {
    // If any parsing error occurs, return the original string
    return typeof date === 'string' ? date : String(date);
  }
}

// Get event badge color based on event type
export function getEventBadgeColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    // Basic types with enhanced colors
    'political': 'bg-blue-100 text-blue-800 border border-blue-300',
    'economic': 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    'social': 'bg-violet-100 text-violet-800 border border-violet-300',
    'cultural': 'bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300',
    'military': 'bg-red-100 text-red-800 border border-red-300',
    'diplomatic': 'bg-cyan-100 text-cyan-800 border border-cyan-300',
    'legal': 'bg-purple-100 text-purple-800 border border-purple-300',
    'religious': 'bg-amber-100 text-amber-800 border border-amber-300',
    'scientific': 'bg-teal-100 text-teal-800 border border-teal-300',
    'environmental': 'bg-green-100 text-green-800 border border-green-300',
    'technological': 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    'other': 'bg-gray-100 text-gray-800 border border-gray-300',
    
    // Specific event types
    'election': 'bg-blue-100 text-blue-800 border border-blue-300',
    'protest': 'bg-red-100 text-red-800 border border-red-300',
    'agreement': 'bg-green-100 text-green-800 border border-green-300',
    'conflict': 'bg-amber-100 text-amber-800 border border-amber-300',
    'legislation': 'bg-purple-100 text-purple-800 border border-purple-300',
    'referendum': 'bg-indigo-100 text-indigo-800 border border-indigo-300',
    'scandal': 'bg-pink-100 text-pink-800 border border-pink-300',
    'disaster': 'bg-orange-100 text-orange-800 border border-orange-300',
    'war': 'bg-rose-100 text-rose-800 border border-rose-300',
    'treaty': 'bg-cyan-100 text-cyan-800 border border-cyan-300',
    'default': 'bg-gray-100 text-gray-800 border border-gray-300'
  };
  
  return colorMap[eventType.toLowerCase()] || colorMap.default;
}

// Get event dot color based on event type with enhanced low-poly visual style
export function getEventDotColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    // Basic types with enhanced colors
    'political': 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-md',
    'economic': 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md',
    'social': 'bg-gradient-to-br from-violet-400 to-violet-600 shadow-md',
    'cultural': 'bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 shadow-md',
    'military': 'bg-gradient-to-br from-red-400 to-red-600 shadow-md',
    'diplomatic': 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md',
    'legal': 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-md',
    'religious': 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-md',
    'scientific': 'bg-gradient-to-br from-teal-400 to-teal-600 shadow-md',
    'environmental': 'bg-gradient-to-br from-green-400 to-green-600 shadow-md',
    'technological': 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md',
    'other': 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-md',
    
    // Specific event types
    'election': 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-md',
    'protest': 'bg-gradient-to-br from-red-400 to-red-600 shadow-md',
    'agreement': 'bg-gradient-to-br from-green-400 to-green-600 shadow-md',
    'conflict': 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-md',
    'legislation': 'bg-gradient-to-br from-purple-400 to-purple-600 shadow-md',
    'referendum': 'bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-md',
    'scandal': 'bg-gradient-to-br from-pink-400 to-pink-600 shadow-md',
    'disaster': 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-md',
    'war': 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-md',
    'treaty': 'bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-md',
    'default': 'bg-gradient-to-br from-gray-400 to-gray-600 shadow-md'
  };
  
  return colorMap[eventType.toLowerCase()] || colorMap.default;
}

// Get event icon based on event type or custom icon
export function getEventIcon(eventType: string, customIcon?: string | null): string {
  // If a custom icon is provided and it's not "none", use it directly with fontawesome prefix
  if (customIcon && customIcon !== "none") {
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

// Extract up to 3 meaningful tags from the event description
export function extractKeyword(description: string): string[] {
  // Skip if description is too short
  if (!description || description.length < 5) {
    return [];
  }
  
  // Tags array to hold our results (max 3 tags)
  const tags: string[] = [];
  
  // Convert to lowercase for comparison
  const lowerDesc = description.toLowerCase();
  
  // Multi-word political phrases to detect (these take precedence as they're more specific)
  const politicalPhrases = [
    'constitutional reform', 'presidential election', 'parliamentary election', 'civil war',
    'peace treaty', 'economic crisis', 'military coup', 'political scandal', 'diplomatic relations',
    'civil rights', 'human rights', 'democratic transition', 'independence referendum',
    'coalition government', 'political uprising', 'foreign intervention', 'trade agreement', 
    'political assassination', 'government collapse', 'constitutional crisis', 'military rule', 
    'political protest', 'economic sanctions', 'foreign policy', 'national security', 
    'territorial dispute', 'government formation', 'peaceful transition', 'economic reform',
    'military conflict', 'policy change', 'social reform', 'international agreement'
  ];
  
  // Check for multi-word phrases first (add up to 2 phrases if found)
  const foundPhrases = politicalPhrases.filter(phrase => lowerDesc.includes(phrase));
  if (foundPhrases.length > 0) {
    // Sort by length to get most specific phrases first
    const sortedPhrases = foundPhrases.sort((a, b) => b.length - a.length);
    tags.push(sortedPhrases[0]);
    
    // Add second phrase if it's different enough (not a subset of the first)
    if (sortedPhrases.length > 1 && !sortedPhrases[0].includes(sortedPhrases[1]) && !sortedPhrases[1].includes(sortedPhrases[0])) {
      tags.push(sortedPhrases[1]);
    }
  }
  
  // Context patterns to identify the type of event
  const contextPatterns = [
    { pattern: /(democracy|democratic).*(establish|introduc|implement|creat|form)/, tag: 'democratic formation' },
    { pattern: /(parliament|congress).*(dissolv|disband)/, tag: 'parliament dissolved' },
    { pattern: /(president|prime minister|chancellor).*(elected|appointed|became)/, tag: 'leader elected' },
    { pattern: /(president|prime minister|chancellor).*(resign|step down|ousted)/, tag: 'leader resigned' },
    { pattern: /(war|conflict).*(start|begin|broke out|launched)/, tag: 'conflict began' },
    { pattern: /(war|conflict|hostilities).*(end|cease|concluded|armistice)/, tag: 'conflict ended' },
    { pattern: /(treaty|agreement|accord).*(sign|ratif|conclude)/, tag: 'treaty signed' },
    { pattern: /(independence|sovereign).*(gain|declar|achiev)/, tag: 'independence gained' },
    { pattern: /(revolt|rebellion|uprising).*(suppress|crush|defeat)/, tag: 'uprising suppressed' },
    { pattern: /(constitution|constitutional).*(adopt|ratif|approv)/, tag: 'constitution adopted' },
    { pattern: /(economic|economy).*(reform|overhaul|transform)/, tag: 'economic reform' },
    { pattern: /(crisis|recession|depression).*(financial|economic)/, tag: 'economic crisis' },
    { pattern: /(join|accession).*(alliance|union|treaty|organization)/, tag: 'alliance joined' },
    { pattern: /(law|bill|legislation).*(pass|approv|enact)/, tag: 'law passed' },
    { pattern: /(vote|referendum).*(held|conduct|took place)/, tag: 'vote held' },
    { pattern: /(military).*(coup|takeover|overthrow)/, tag: 'military coup' },
    { pattern: /(assassinate|killed|murdered).*(leader|president|minister)/, tag: 'leader assassinated' },
    { pattern: /(protest|demonstration|rally).*(against|oppose)/, tag: 'public protest' },
    { pattern: /(disaster|catastrophe|calamity).*(natural|environmental)/, tag: 'natural disaster' },
    { pattern: /(establish|form|create).*(government|administration)/, tag: 'government formed' }
  ];
  
  // Test each context pattern against the description
  for (const { pattern, tag } of contextPatterns) {
    if (pattern.test(lowerDesc) && !tags.includes(tag)) {
      tags.push(tag);
      // Stop if we have 3 tags
      if (tags.length >= 3) break;
    }
  }
  
  // List of common political keywords to look for (single words, as backup)
  const politicalKeywords = [
    'democracy', 'constitution', 'parliament', 'election', 'referendum',
    'treaty', 'legislation', 'reform', 'protest', 'opposition', 
    'revolution', 'war', 'conflict', 'peace', 'rights', 'freedom', 
    'independence', 'sovereignty', 'monarchy', 'republic', 'sanction', 
    'diplomatic', 'alliance', 'trade', 'economy', 'crisis', 'scandal',
    'corruption', 'impeachment', 'military', 'authoritarian', 'liberal',
    'conservative', 'socialist', 'nationalist', 'populist', 'bilateral'
  ];
  
  // Only proceed if we need more tags
  if (tags.length < 3) {
    // Find keywords that appear in the description
    const foundKeywords = politicalKeywords.filter(keyword => 
      lowerDesc.includes(keyword) && 
      // Ensure the keyword isn't already part of existing tags
      !tags.some(tag => tag.includes(keyword))
    );
    
    if (foundKeywords.length > 0) {
      // Find descriptors that might enhance the keywords
      const descriptors = [
        'major', 'significant', 'historic', 'controversial', 'peaceful', 'violent',
        'gradual', 'sudden', 'successful', 'failed', 'disputed', 'unanimous',
        'international', 'domestic', 'radical', 'moderate', 'unprecedented'
      ];
      
      // Find descriptors in the text
      const foundDescriptors = descriptors.filter(d => lowerDesc.includes(d));
      
      // Get the most relevant keyword
      const primaryKeyword = foundKeywords[0];
      
      // If we have a descriptor, combine it with the keyword
      if (foundDescriptors.length > 0) {
        tags.push(`${foundDescriptors[0]} ${primaryKeyword}`);
      } else {
        tags.push(primaryKeyword);
      }
      
      // Add a second keyword if available and we still need tags
      if (foundKeywords.length > 1 && tags.length < 3) {
        tags.push(foundKeywords[1]);
      }
    }
  }
  
  // If we still need tags, try to extract key topics from significant words
  if (tags.length < 3) {
    const words = lowerDesc.split(/\s+/);
    
    // Skip common words and find significant words
    const commonWords = ['the', 'a', 'an', 'and', 'but', 'or', 'in', 'on', 'at', 'to', 'for', 
      'with', 'by', 'of', 'that', 'this', 'is', 'are', 'was', 'were', 'had', 'has', 'have', 
      'been', 'would', 'could', 'should', 'will', 'shall', 'may', 'might', 'must'];
    
    const significantWords = words.filter(word => 
      word.length > 3 && !commonWords.includes(word) &&
      // Ensure word isn't already part of existing tags
      !tags.some(tag => tag.includes(word))
    );
    
    if (significantWords.length >= 2 && tags.length < 3) {
      // Try to find a meaningful two-word combination
      const firstWord = significantWords[0];
      const secondWord = significantWords[1];
      const twoWordTag = `${firstWord} ${secondWord}`;
      
      // Only add if it's not too similar to existing tags
      if (!tags.some(tag => tag.includes(firstWord) || tag.includes(secondWord))) {
        tags.push(twoWordTag);
      }
    } else if (significantWords.length > 0 && tags.length < 3) {
      // Add a significant word if we still need tags
      tags.push(significantWords[0]);
    }
  }
  
  // If we somehow have no tags, add a default one
  if (tags.length === 0) {
    tags.push('historical event');
  }
  
  // Return unique tags (up to 3)
  return Array.from(new Set(tags)).slice(0, 3);
}
