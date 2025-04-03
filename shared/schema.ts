import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - keep for authentication if needed later
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Country schema
export const countries = pgTable("countries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  alpha2Code: text("alpha2Code").notNull().unique(),
  alpha3Code: text("alpha3Code").notNull().unique(),
  capital: text("capital"),
  region: text("region").notNull(),
  subregion: text("subregion"),
  population: integer("population"),
  area: integer("area"),
  flagUrl: text("flagUrl"),
  coatOfArmsUrl: text("coatOfArmsUrl"),
  mapUrl: text("mapUrl"),
  independent: boolean("independent"),
  unMember: boolean("unMember"),
  currencies: jsonb("currencies"),
  languages: jsonb("languages"),
  borders: jsonb("borders"),
  timezones: jsonb("timezones"),
  startOfWeek: text("startOfWeek"),
  capitalInfo: jsonb("capitalInfo"),
  postalCode: jsonb("postalCode"),
  flag: text("flag"), // emoji flag
  countryInfo: jsonb("countryInfo"), // For additional country data
});

// Timeline Events schema
export const timelineEvents = pgTable("timelineEvents", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(), // Using text to allow any date format
  eventType: text("eventType").notNull(), // e.g., "election", "protest", "agreement"
  icon: text("icon"), // Font Awesome icon name
  tags: jsonb("tags"), // array of tags
});

// Political Leaders schema
export const politicalLeaders = pgTable("politicalLeaders", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  name: text("name").notNull(),
  title: text("title").notNull(), // e.g., "President", "Prime Minister"
  party: text("party"),
  imageUrl: text("imageUrl"),
  startDate: timestamp("startDate"),
  ideologies: jsonb("ideologies"), // array of ideologies
});

// Political System schema
export const politicalSystems = pgTable("politicalSystems", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  type: text("type").notNull(), // "Democracy", "Republic", "Monarchy", etc.
  details: text("details"),
  freedomIndex: integer("freedomIndex"), // 0-100 scale
  electionSystem: text("electionSystem"),
  governmentBranches: jsonb("governmentBranches"), // array of branches
  democraticPrinciples: jsonb("democraticPrinciples"), // array of principles
  internationalRelations: jsonb("internationalRelations"), // array of relations
  laws: jsonb("laws"), // array of laws
  organizations: jsonb("organizations"), // array of international organizations
  hasUnstablePoliticalSituation: boolean("hasUnstablePoliticalSituation").default(false),
  ongoingConflicts: jsonb("ongoingConflicts"), // array of ongoing conflicts the country is involved in
});

// International Relations schema
export const internationalRelations = pgTable("internationalRelations", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  partnerCountry: text("partnerCountry").notNull(),
  relationType: text("relationType").notNull(), // Economic, Military, Cultural, etc.
  relationStrength: text("relationStrength"), // Strong, Moderate, Weak
  details: text("details"),
  startDate: timestamp("startDate"),
  isoCode: text("isoCode"), // ISO 3166-1 alpha-2 country code for the flag
});

// Historical Laws schema
export const historicalLaws = pgTable("historicalLaws", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date"),
  category: text("category"), // Economic, Social, Environmental, etc.
  status: text("status"), // Enacted, Proposed, Repealed
});

// Statistics schema
export const statistics = pgTable("statistics", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  type: text("type").notNull(), // Population, GDP, Religion, Ethnicity
  data: jsonb("data"), // array of data points with labels and values
  year: integer("year"),
});

// Economic Data schema
export const economicData = pgTable("economicData", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  gdp: integer("gdp"), // in billions USD
  gdpPerCapita: integer("gdpPerCapita"),
  gdpGrowth: text("gdpGrowth"),
  inflation: text("inflation"),
  mainIndustries: jsonb("mainIndustries"), // array of industries with percentages
  tradingPartners: jsonb("tradingPartners"), // array of countries
  challenges: jsonb("challenges"), // array of economic challenges
  reforms: jsonb("reforms"), // array of economic reforms
  outlook: text("outlook"), // Economic outlook description
  initiatives: jsonb("initiatives"), // array of economic initiatives
});

// Political Party schema
export const politicalParties = pgTable("politicalParties", {
  id: serial("id").primaryKey(),
  countryId: integer("countryId").notNull().references(() => countries.id),
  name: text("name").notNull(),
  acronym: text("acronym"),
  color: text("color"), // Hex color or name for visualization
  ideology: text("ideology"),
  logoUrl: text("logoUrl"),
  foundedYear: integer("foundedYear"),
  isRuling: boolean("isRuling").default(false), // Whether this party is currently in power
  seats: integer("seats"), // Number of seats in parliament
  totalSeats: integer("totalSeats"), // Total number of seats in parliament
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCountrySchema = createInsertSchema(countries);
export const insertTimelineEventSchema = createInsertSchema(timelineEvents);
export const insertPoliticalLeaderSchema = createInsertSchema(politicalLeaders);
export const insertPoliticalSystemSchema = createInsertSchema(politicalSystems);
export const insertInternationalRelationSchema = createInsertSchema(internationalRelations);
export const insertHistoricalLawSchema = createInsertSchema(historicalLaws);
export const insertStatisticSchema = createInsertSchema(statistics);
export const insertEconomicDataSchema = createInsertSchema(economicData);
export const insertPoliticalPartySchema = createInsertSchema(politicalParties);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type Country = typeof countries.$inferSelect & {
  countryInfo?: {
    governmentForm?: string | null;
    [key: string]: any;
  } | null;
};

export type InsertTimelineEvent = z.infer<typeof insertTimelineEventSchema>;
export type TimelineEvent = typeof timelineEvents.$inferSelect;

export type InsertPoliticalLeader = z.infer<typeof insertPoliticalLeaderSchema>;
export type PoliticalLeader = typeof politicalLeaders.$inferSelect;

export type InsertPoliticalSystem = z.infer<typeof insertPoliticalSystemSchema>;
export type PoliticalSystem = typeof politicalSystems.$inferSelect;

export type InsertInternationalRelation = z.infer<typeof insertInternationalRelationSchema>;
export type InternationalRelation = typeof internationalRelations.$inferSelect;

export type InsertHistoricalLaw = z.infer<typeof insertHistoricalLawSchema>;
export type HistoricalLaw = typeof historicalLaws.$inferSelect;

export type InsertStatistic = z.infer<typeof insertStatisticSchema>;
export type Statistic = typeof statistics.$inferSelect;

export type InsertEconomicData = z.infer<typeof insertEconomicDataSchema>;
export type EconomicData = typeof economicData.$inferSelect;

export type InsertPoliticalParty = z.infer<typeof insertPoliticalPartySchema>;
export type PoliticalParty = typeof politicalParties.$inferSelect;
