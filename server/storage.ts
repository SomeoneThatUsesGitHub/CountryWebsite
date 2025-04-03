import {
  User,
  InsertUser,
  Country,
  InsertCountry,
  TimelineEvent,
  InsertTimelineEvent,
  PoliticalLeader,
  InsertPoliticalLeader,
  PoliticalSystem,
  InsertPoliticalSystem,
  PoliticalParty,
  InsertPoliticalParty,
  InternationalRelation,
  InsertInternationalRelation,
  HistoricalLaw,
  InsertHistoricalLaw,
  Statistic,
  InsertStatistic,
  EconomicData,
  InsertEconomicData,
} from "@shared/schema";

export interface IStorage {
  // Reset method (for development)
  resetAllData(): void;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Country methods
  getAllCountries(): Promise<Country[]>;
  getCountriesByRegion(region: string): Promise<Country[]>;
  getCountryByCode(code: string): Promise<Country | undefined>;
  getCountryById(id: number): Promise<Country | undefined>;
  createCountry(country: InsertCountry): Promise<Country>;
  updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country | undefined>;

  // Timeline events methods
  getTimelineEventsByCountryId(countryId: number): Promise<TimelineEvent[]>;
  createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent>;
  updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined>;
  deleteTimelineEvent(id: number): Promise<boolean>;

  // Political leaders methods
  getPoliticalLeadersByCountryId(countryId: number): Promise<PoliticalLeader[]>;
  createPoliticalLeader(leader: InsertPoliticalLeader): Promise<PoliticalLeader>;
  updatePoliticalLeader(id: number, leader: Partial<InsertPoliticalLeader>): Promise<PoliticalLeader | undefined>;
  deletePoliticalLeader(id: number): Promise<boolean>;

  // Political system methods
  getPoliticalSystemByCountryId(countryId: number): Promise<PoliticalSystem | undefined>;
  createPoliticalSystem(system: InsertPoliticalSystem): Promise<PoliticalSystem>;
  updatePoliticalSystem(id: number, system: Partial<InsertPoliticalSystem>): Promise<PoliticalSystem | undefined>;

  // Political parties methods
  getPoliticalPartiesByCountryId(countryId: number): Promise<PoliticalParty[]>;
  createPoliticalParty(party: InsertPoliticalParty): Promise<PoliticalParty>;
  updatePoliticalParty(id: number, party: Partial<InsertPoliticalParty>): Promise<PoliticalParty | undefined>;
  deletePoliticalParty(id: number): Promise<boolean>;

  // International relations methods
  getInternationalRelationsByCountryId(countryId: number): Promise<InternationalRelation[]>;
  createInternationalRelation(relation: InsertInternationalRelation): Promise<InternationalRelation>;
  updateInternationalRelation(id: number, relation: Partial<InsertInternationalRelation>): Promise<InternationalRelation | undefined>;
  deleteInternationalRelation(id: number): Promise<boolean>;

  // Historical laws methods
  getHistoricalLawsByCountryId(countryId: number): Promise<HistoricalLaw[]>;
  createHistoricalLaw(law: InsertHistoricalLaw): Promise<HistoricalLaw>;
  updateHistoricalLaw(id: number, law: Partial<InsertHistoricalLaw>): Promise<HistoricalLaw | undefined>;
  deleteHistoricalLaw(id: number): Promise<boolean>;

  // Statistics methods
  getStatisticsByCountryId(countryId: number): Promise<Statistic[]>;
  createStatistic(statistic: InsertStatistic): Promise<Statistic>;
  updateStatistic(id: number, statistic: Partial<InsertStatistic>): Promise<Statistic | undefined>;
  deleteStatistic(id: number): Promise<boolean>;

  // Economic data methods
  getEconomicDataByCountryId(countryId: number): Promise<EconomicData | undefined>;
  createEconomicData(data: InsertEconomicData): Promise<EconomicData>;
  updateEconomicData(id: number, data: Partial<InsertEconomicData>): Promise<EconomicData | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private countries: Map<number, Country>;
  private timelineEvents: Map<number, TimelineEvent>;
  private politicalLeaders: Map<number, PoliticalLeader>;
  private politicalSystems: Map<number, PoliticalSystem>;
  private politicalParties: Map<number, PoliticalParty>;
  private internationalRelations: Map<number, InternationalRelation>;
  private historicalLaws: Map<number, HistoricalLaw>;
  private statistics: Map<number, Statistic>;
  private economicData: Map<number, EconomicData>;
  
  // Méthode pour réinitialiser toutes les données (utile pour le développement)
  resetAllData(): void {
    this.users.clear();
    this.countries.clear();
    this.timelineEvents.clear();
    this.politicalLeaders.clear();
    this.politicalSystems.clear();
    this.politicalParties.clear();
    this.internationalRelations.clear();
    this.historicalLaws.clear();
    this.statistics.clear();
    this.economicData.clear();
    this.userId = 0;
    this.countryId = 0;
    this.timelineEventId = 0;
    this.politicalLeaderId = 0;
    this.politicalSystemId = 0;
    this.politicalPartyId = 0;
    this.internationalRelationId = 0;
    this.historicalLawId = 0;
    this.statisticId = 0;
    this.economicDataId = 0;
    console.log("Storage reset completed. All data has been cleared.");
  };

  private userId: number;
  private countryId: number;
  private timelineEventId: number;
  private politicalLeaderId: number;
  private politicalSystemId: number;
  private politicalPartyId: number;
  private internationalRelationId: number;
  private historicalLawId: number;
  private statisticId: number;
  private economicDataId: number;

  constructor() {
    this.users = new Map();
    this.countries = new Map();
    this.timelineEvents = new Map();
    this.politicalLeaders = new Map();
    this.politicalSystems = new Map();
    this.politicalParties = new Map();
    this.internationalRelations = new Map();
    this.historicalLaws = new Map();
    this.statistics = new Map();
    this.economicData = new Map();

    this.userId = 1;
    this.countryId = 1;
    this.timelineEventId = 1;
    this.politicalLeaderId = 1;
    this.politicalSystemId = 1;
    this.politicalPartyId = 1;
    this.internationalRelationId = 1;
    this.historicalLawId = 1;
    this.statisticId = 1;
    this.economicDataId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // Country methods
  async getAllCountries(): Promise<Country[]> {
    return Array.from(this.countries.values());
  }

  async getCountriesByRegion(region: string): Promise<Country[]> {
    return Array.from(this.countries.values()).filter(
      (country) => country.region === region
    );
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    if (!code) {
      console.log(`Storage: No code provided for country lookup`);
      return undefined;
    }
    
    console.log(`Storage: Searching for country with code ${code}`);
    console.log(`Storage: Number of countries in storage: ${this.countries.size}`);
    
    // Make case-insensitive comparison for better matching
    const upperCode = code.toUpperCase();
    
    const country = Array.from(this.countries.values()).find(
      (country) => 
        (country.alpha2Code && country.alpha2Code.toUpperCase() === upperCode) || 
        (country.alpha3Code && country.alpha3Code.toUpperCase() === upperCode)
    );
    
    if (country) {
      console.log(`Storage: Found country ${country.name} with code ${code}`);
    } else {
      console.log(`Storage: No country found with code ${code}`);
      
      // Only log a sample of available country codes to avoid overflow
      const sampleCodes = Array.from(this.countries.values())
        .slice(0, 10)
        .map(c => `${c.name}: ${c.alpha2Code}, ${c.alpha3Code}`);
      
      console.log(`Storage: Sample of available country codes: ${sampleCodes.join('; ')}`);
      console.log(`Storage: Total countries available: ${this.countries.size}`);
    }
    
    return country;
  }

  async getCountryById(id: number): Promise<Country | undefined> {
    return this.countries.get(id);
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const id = this.countryId++;
    const newCountry: Country = { ...country, id };
    this.countries.set(id, newCountry);
    return newCountry;
  }

  async updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country | undefined> {
    const existingCountry = this.countries.get(id);
    if (!existingCountry) return undefined;

    const updatedCountry = { ...existingCountry, ...country };
    this.countries.set(id, updatedCountry);
    return updatedCountry;
  }

  // Timeline events methods
  async getTimelineEventsByCountryId(countryId: number): Promise<TimelineEvent[]> {
    return Array.from(this.timelineEvents.values()).filter(
      (event) => event.countryId === countryId
    );
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const id = this.timelineEventId++;
    const newEvent: TimelineEvent = { ...event, id };
    this.timelineEvents.set(id, newEvent);
    return newEvent;
  }

  async updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const existingEvent = this.timelineEvents.get(id);
    if (!existingEvent) return undefined;

    const updatedEvent = { ...existingEvent, ...event };
    this.timelineEvents.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    return this.timelineEvents.delete(id);
  }

  // Political leaders methods
  async getPoliticalLeadersByCountryId(countryId: number): Promise<PoliticalLeader[]> {
    return Array.from(this.politicalLeaders.values()).filter(
      (leader) => leader.countryId === countryId
    );
  }

  async createPoliticalLeader(leader: InsertPoliticalLeader): Promise<PoliticalLeader> {
    const id = this.politicalLeaderId++;
    const newLeader: PoliticalLeader = { ...leader, id };
    this.politicalLeaders.set(id, newLeader);
    return newLeader;
  }

  async updatePoliticalLeader(id: number, leader: Partial<InsertPoliticalLeader>): Promise<PoliticalLeader | undefined> {
    const existingLeader = this.politicalLeaders.get(id);
    if (!existingLeader) return undefined;

    const updatedLeader = { ...existingLeader, ...leader };
    this.politicalLeaders.set(id, updatedLeader);
    return updatedLeader;
  }

  async deletePoliticalLeader(id: number): Promise<boolean> {
    return this.politicalLeaders.delete(id);
  }

  // Political system methods
  async getPoliticalSystemByCountryId(countryId: number): Promise<PoliticalSystem | undefined> {
    return Array.from(this.politicalSystems.values()).find(
      (system) => system.countryId === countryId
    );
  }

  async createPoliticalSystem(system: InsertPoliticalSystem): Promise<PoliticalSystem> {
    const id = this.politicalSystemId++;
    const newSystem: PoliticalSystem = { ...system, id };
    this.politicalSystems.set(id, newSystem);
    return newSystem;
  }

  async updatePoliticalSystem(id: number, system: Partial<InsertPoliticalSystem>): Promise<PoliticalSystem | undefined> {
    const existingSystem = this.politicalSystems.get(id);
    if (!existingSystem) return undefined;

    const updatedSystem = { ...existingSystem, ...system };
    this.politicalSystems.set(id, updatedSystem);
    return updatedSystem;
  }

  // Political parties methods
  async getPoliticalPartiesByCountryId(countryId: number): Promise<PoliticalParty[]> {
    return Array.from(this.politicalParties.values()).filter(
      (party) => party.countryId === countryId
    );
  }

  async createPoliticalParty(party: InsertPoliticalParty): Promise<PoliticalParty> {
    const id = this.politicalPartyId++;
    const newParty: PoliticalParty = { ...party, id };
    this.politicalParties.set(id, newParty);
    return newParty;
  }

  async updatePoliticalParty(id: number, party: Partial<InsertPoliticalParty>): Promise<PoliticalParty | undefined> {
    const existingParty = this.politicalParties.get(id);
    if (!existingParty) return undefined;

    const updatedParty = { ...existingParty, ...party };
    this.politicalParties.set(id, updatedParty);
    return updatedParty;
  }

  async deletePoliticalParty(id: number): Promise<boolean> {
    return this.politicalParties.delete(id);
  }

  // International relations methods
  async getInternationalRelationsByCountryId(countryId: number): Promise<InternationalRelation[]> {
    return Array.from(this.internationalRelations.values()).filter(
      (relation) => relation.countryId === countryId
    );
  }

  async createInternationalRelation(relation: InsertInternationalRelation): Promise<InternationalRelation> {
    const id = this.internationalRelationId++;
    const newRelation: InternationalRelation = { ...relation, id };
    this.internationalRelations.set(id, newRelation);
    return newRelation;
  }

  async updateInternationalRelation(id: number, relation: Partial<InsertInternationalRelation>): Promise<InternationalRelation | undefined> {
    const existingRelation = this.internationalRelations.get(id);
    if (!existingRelation) return undefined;

    const updatedRelation = { ...existingRelation, ...relation };
    this.internationalRelations.set(id, updatedRelation);
    return updatedRelation;
  }

  async deleteInternationalRelation(id: number): Promise<boolean> {
    return this.internationalRelations.delete(id);
  }

  // Historical laws methods
  async getHistoricalLawsByCountryId(countryId: number): Promise<HistoricalLaw[]> {
    return Array.from(this.historicalLaws.values()).filter(
      (law) => law.countryId === countryId
    );
  }

  async createHistoricalLaw(law: InsertHistoricalLaw): Promise<HistoricalLaw> {
    const id = this.historicalLawId++;
    const newLaw: HistoricalLaw = { ...law, id };
    this.historicalLaws.set(id, newLaw);
    return newLaw;
  }

  async updateHistoricalLaw(id: number, law: Partial<InsertHistoricalLaw>): Promise<HistoricalLaw | undefined> {
    const existingLaw = this.historicalLaws.get(id);
    if (!existingLaw) return undefined;

    const updatedLaw = { ...existingLaw, ...law };
    this.historicalLaws.set(id, updatedLaw);
    return updatedLaw;
  }

  async deleteHistoricalLaw(id: number): Promise<boolean> {
    return this.historicalLaws.delete(id);
  }

  // Statistics methods
  async getStatisticsByCountryId(countryId: number): Promise<Statistic[]> {
    return Array.from(this.statistics.values()).filter(
      (statistic) => statistic.countryId === countryId
    );
  }

  async createStatistic(statistic: InsertStatistic): Promise<Statistic> {
    const id = this.statisticId++;
    const newStatistic: Statistic = { ...statistic, id };
    this.statistics.set(id, newStatistic);
    return newStatistic;
  }

  async updateStatistic(id: number, statistic: Partial<InsertStatistic>): Promise<Statistic | undefined> {
    const existingStatistic = this.statistics.get(id);
    if (!existingStatistic) return undefined;

    const updatedStatistic = { ...existingStatistic, ...statistic };
    this.statistics.set(id, updatedStatistic);
    return updatedStatistic;
  }

  async deleteStatistic(id: number): Promise<boolean> {
    return this.statistics.delete(id);
  }

  // Economic data methods
  async getEconomicDataByCountryId(countryId: number): Promise<EconomicData | undefined> {
    return Array.from(this.economicData.values()).find(
      (data) => data.countryId === countryId
    );
  }

  async createEconomicData(data: InsertEconomicData): Promise<EconomicData> {
    const id = this.economicDataId++;
    const newData: EconomicData = { ...data, id };
    this.economicData.set(id, newData);
    return newData;
  }

  async updateEconomicData(id: number, data: Partial<InsertEconomicData>): Promise<EconomicData | undefined> {
    const existingData = this.economicData.get(id);
    if (!existingData) return undefined;

    const updatedData = { ...existingData, ...data };
    this.economicData.set(id, updatedData);
    return updatedData;
  }
}

export const storage = new MemStorage();
