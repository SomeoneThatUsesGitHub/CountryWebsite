export interface Country {
  id: number;
  name: string;
  alpha2Code: string;
  alpha3Code: string;
  capital?: string | null;
  region?: string | null;
  subregion?: string | null;
  population?: number | null;
  area?: number | null;
  flagUrl?: string | null;
  coatOfArmsUrl?: string | null;
  mapUrl?: string | null;
  independent?: boolean;
  unMember?: boolean;
  currencies?: any;
  languages?: any;
  borders?: string[] | null;
  timezones?: string[] | null;
  startOfWeek?: string | null;
  capitalInfo?: any;
  postalCode?: any;
  flag?: string | null;
  countryInfo?: CountryInfo | null;
}

export interface CountryInfo {
  capital?: string | null;
  region?: string | null;
  subregion?: string | null;
  population?: number | null;
  governmentForm?: string | null;
}

export interface TimelineEvent {
  id: number;
  countryId: number;
  title: string;
  description: string;
  date: string | Date;
  eventType: string;
  icon?: string | null;
  tags?: any;
}

export interface PoliticalLeader {
  id: number;
  countryId: number;
  name: string;
  title: string;
  party?: string;
  imageUrl?: string;
  startDate?: string;
  ideologies?: string[];
}

export interface EconomicData {
  id: number;
  countryId: number;
  gdp?: number;
  gdpPerCapita?: number;
  gdpGrowth?: string;
  inflation?: string;
  mainIndustries?: Industry[];
  tradingPartners?: string[];
  challenges?: EconomicChallenge[];
  reforms?: string[];
}

export interface Industry {
  name: string;
  percentage: number;
}

export interface EconomicChallenge {
  title: string;
  description: string;
  icon: string;
}

export interface PopulationData {
  year: string;
  population: number;
}

export interface GdpData {
  year: string;
  gdp: number;
}

export interface TabOption {
  id: string;
  label: string;
}
