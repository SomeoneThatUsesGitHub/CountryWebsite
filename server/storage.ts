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
  users,
  countries,
  timelineEvents,
  politicalLeaders,
  politicalSystems,
  politicalParties,
  internationalRelations,
  historicalLaws,
  statistics,
  economicData
} from "@shared/schema";
import { db } from "./db";
import { eq, or, desc, sql } from "drizzle-orm";

export interface IStorage {
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

// DatabaseStorage implementation using Drizzle ORM
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Country methods
  async getAllCountries(): Promise<Country[]> {
    const allCountries = await db.select().from(countries);
    return allCountries;
  }

  async getCountriesByRegion(region: string): Promise<Country[]> {
    const regionCountries = await db.select().from(countries).where(eq(countries.region, region));
    return regionCountries;
  }

  async getCountryByCode(code: string): Promise<Country | undefined> {
    console.log('Storage: Searching for country with code', code);
    try {
      // Try to match on alpha2Code or alpha3Code
      const [country] = await db.select().from(countries).where(
        or(
          eq(countries.alpha2Code, code),
          eq(countries.alpha3Code, code)
        )
      );
      
      // Get count differently
      const result = await db.select({ count: sql`count(*)` }).from(countries);
      const countValue = Number(result[0].count);
      console.log('Storage: Number of countries in storage:', countValue);
      
      if (country) {
        console.log(`Storage: Found country ${country.name} with code ${code}`);
      } else {
        console.log(`Storage: No country found with code ${code}`);
      }
      
      return country;
    } catch (error) {
      console.error('Error in getCountryByCode:', error);
      return undefined;
    }
  }

  async getCountryById(id: number): Promise<Country | undefined> {
    const [country] = await db.select().from(countries).where(eq(countries.id, id));
    return country;
  }

  async createCountry(country: InsertCountry): Promise<Country> {
    const [newCountry] = await db.insert(countries).values(country).returning();
    return newCountry;
  }

  async updateCountry(id: number, country: Partial<InsertCountry>): Promise<Country | undefined> {
    const [updatedCountry] = await db.update(countries)
      .set(country)
      .where(eq(countries.id, id))
      .returning();
    return updatedCountry;
  }

  // Timeline events methods
  async getTimelineEventsByCountryId(countryId: number): Promise<TimelineEvent[]> {
    const events = await db.select()
      .from(timelineEvents)
      .where(eq(timelineEvents.countryId, countryId))
      .orderBy(desc(timelineEvents.date));
    return events;
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    const [newEvent] = await db.insert(timelineEvents).values(event).returning();
    return newEvent;
  }

  async updateTimelineEvent(id: number, event: Partial<InsertTimelineEvent>): Promise<TimelineEvent | undefined> {
    const [updatedEvent] = await db.update(timelineEvents)
      .set(event)
      .where(eq(timelineEvents.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    const result = await db.delete(timelineEvents).where(eq(timelineEvents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Political leaders methods
  async getPoliticalLeadersByCountryId(countryId: number): Promise<PoliticalLeader[]> {
    const leaders = await db.select()
      .from(politicalLeaders)
      .where(eq(politicalLeaders.countryId, countryId));
    return leaders;
  }

  async createPoliticalLeader(leader: InsertPoliticalLeader): Promise<PoliticalLeader> {
    const [newLeader] = await db.insert(politicalLeaders).values(leader).returning();
    return newLeader;
  }

  async updatePoliticalLeader(id: number, leader: Partial<InsertPoliticalLeader>): Promise<PoliticalLeader | undefined> {
    const [updatedLeader] = await db.update(politicalLeaders)
      .set(leader)
      .where(eq(politicalLeaders.id, id))
      .returning();
    return updatedLeader;
  }

  async deletePoliticalLeader(id: number): Promise<boolean> {
    const result = await db.delete(politicalLeaders).where(eq(politicalLeaders.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Political system methods
  async getPoliticalSystemByCountryId(countryId: number): Promise<PoliticalSystem | undefined> {
    const [system] = await db.select()
      .from(politicalSystems)
      .where(eq(politicalSystems.countryId, countryId));
    return system;
  }

  async createPoliticalSystem(system: InsertPoliticalSystem): Promise<PoliticalSystem> {
    const [newSystem] = await db.insert(politicalSystems).values(system).returning();
    return newSystem;
  }

  async updatePoliticalSystem(id: number, system: Partial<InsertPoliticalSystem>): Promise<PoliticalSystem | undefined> {
    const [updatedSystem] = await db.update(politicalSystems)
      .set(system)
      .where(eq(politicalSystems.id, id))
      .returning();
    return updatedSystem;
  }

  // Political parties methods
  async getPoliticalPartiesByCountryId(countryId: number): Promise<PoliticalParty[]> {
    const parties = await db.select()
      .from(politicalParties)
      .where(eq(politicalParties.countryId, countryId));
    return parties;
  }

  async createPoliticalParty(party: InsertPoliticalParty): Promise<PoliticalParty> {
    const [newParty] = await db.insert(politicalParties).values(party).returning();
    return newParty;
  }

  async updatePoliticalParty(id: number, party: Partial<InsertPoliticalParty>): Promise<PoliticalParty | undefined> {
    const [updatedParty] = await db.update(politicalParties)
      .set(party)
      .where(eq(politicalParties.id, id))
      .returning();
    return updatedParty;
  }

  async deletePoliticalParty(id: number): Promise<boolean> {
    const result = await db.delete(politicalParties).where(eq(politicalParties.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // International relations methods
  async getInternationalRelationsByCountryId(countryId: number): Promise<InternationalRelation[]> {
    const relations = await db.select()
      .from(internationalRelations)
      .where(eq(internationalRelations.countryId, countryId));
    return relations;
  }

  async createInternationalRelation(relation: InsertInternationalRelation): Promise<InternationalRelation> {
    const [newRelation] = await db.insert(internationalRelations).values(relation).returning();
    return newRelation;
  }

  async updateInternationalRelation(id: number, relation: Partial<InsertInternationalRelation>): Promise<InternationalRelation | undefined> {
    const [updatedRelation] = await db.update(internationalRelations)
      .set(relation)
      .where(eq(internationalRelations.id, id))
      .returning();
    return updatedRelation;
  }

  async deleteInternationalRelation(id: number): Promise<boolean> {
    const result = await db.delete(internationalRelations).where(eq(internationalRelations.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Historical laws methods
  async getHistoricalLawsByCountryId(countryId: number): Promise<HistoricalLaw[]> {
    const laws = await db.select()
      .from(historicalLaws)
      .where(eq(historicalLaws.countryId, countryId));
    return laws;
  }

  async createHistoricalLaw(law: InsertHistoricalLaw): Promise<HistoricalLaw> {
    const [newLaw] = await db.insert(historicalLaws).values(law).returning();
    return newLaw;
  }

  async updateHistoricalLaw(id: number, law: Partial<InsertHistoricalLaw>): Promise<HistoricalLaw | undefined> {
    const [updatedLaw] = await db.update(historicalLaws)
      .set(law)
      .where(eq(historicalLaws.id, id))
      .returning();
    return updatedLaw;
  }

  async deleteHistoricalLaw(id: number): Promise<boolean> {
    const result = await db.delete(historicalLaws).where(eq(historicalLaws.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Statistics methods
  async getStatisticsByCountryId(countryId: number): Promise<Statistic[]> {
    const stats = await db.select()
      .from(statistics)
      .where(eq(statistics.countryId, countryId));
    return stats;
  }

  async createStatistic(statistic: InsertStatistic): Promise<Statistic> {
    const [newStat] = await db.insert(statistics).values(statistic).returning();
    return newStat;
  }

  async updateStatistic(id: number, statistic: Partial<InsertStatistic>): Promise<Statistic | undefined> {
    const [updatedStat] = await db.update(statistics)
      .set(statistic)
      .where(eq(statistics.id, id))
      .returning();
    return updatedStat;
  }

  async deleteStatistic(id: number): Promise<boolean> {
    const result = await db.delete(statistics).where(eq(statistics.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Economic data methods
  async getEconomicDataByCountryId(countryId: number): Promise<EconomicData | undefined> {
    const [data] = await db.select()
      .from(economicData)
      .where(eq(economicData.countryId, countryId));
    return data;
  }

  async createEconomicData(data: InsertEconomicData): Promise<EconomicData> {
    const [newData] = await db.insert(economicData).values(data).returning();
    return newData;
  }

  async updateEconomicData(id: number, data: Partial<InsertEconomicData>): Promise<EconomicData | undefined> {
    const [updatedData] = await db.update(economicData)
      .set(data)
      .where(eq(economicData.id, id))
      .returning();
    return updatedData;
  }
}

export const storage = new DatabaseStorage();
