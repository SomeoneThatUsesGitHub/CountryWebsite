import {
  User,
  InsertUser,
  Country,
  InsertCountry,
  TimelineEvent,
  InsertTimelineEvent,
  PoliticalLeader,
  InsertPoliticalLeader,
  EconomicData,
  InsertEconomicData,
} from "@shared/schema";

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

  // Political leaders methods
  getPoliticalLeadersByCountryId(countryId: number): Promise<PoliticalLeader[]>;
  createPoliticalLeader(leader: InsertPoliticalLeader): Promise<PoliticalLeader>;

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
  private economicData: Map<number, EconomicData>;

  private userId: number;
  private countryId: number;
  private timelineEventId: number;
  private politicalLeaderId: number;
  private economicDataId: number;

  constructor() {
    this.users = new Map();
    this.countries = new Map();
    this.timelineEvents = new Map();
    this.politicalLeaders = new Map();
    this.economicData = new Map();

    this.userId = 1;
    this.countryId = 1;
    this.timelineEventId = 1;
    this.politicalLeaderId = 1;
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
    return Array.from(this.countries.values()).find(
      (country) => country.alpha2Code === code || country.alpha3Code === code
    );
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
