import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { 
  insertTimelineEventSchema, 
  insertPoliticalLeaderSchema, 
  insertPoliticalSystemSchema,
  insertPoliticalPartySchema,
  insertInternationalRelationSchema,
  insertHistoricalLawSchema,
  insertStatisticSchema,
  insertEconomicDataSchema,
  insertCountrySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize data fetching for countries
  app.get("/api/initialize", async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      
      // Only fetch if we don't have countries already
      if (countries.length === 0) {
        const response = await axios.get("https://restcountries.com/v3.1/all");
        const countriesData = response.data;
        
        for (const countryData of countriesData) {
          const country = {
            name: countryData.name.common,
            alpha2Code: countryData.cca2,
            alpha3Code: countryData.cca3,
            capital: countryData.capital?.[0] || null,
            region: countryData.region || null,
            subregion: countryData.subregion || null,
            population: countryData.population || null,
            area: countryData.area || null,
            flagUrl: countryData.flags?.svg || null,
            coatOfArmsUrl: countryData.coatOfArms?.svg || null,
            mapUrl: countryData.maps?.googleMaps || null,
            independent: countryData.independent || false,
            unMember: countryData.unMember || false,
            currencies: countryData.currencies || null,
            languages: countryData.languages || null,
            borders: countryData.borders || null,
            timezones: countryData.timezones || null,
            startOfWeek: countryData.startOfWeek || null,
            capitalInfo: countryData.capitalInfo || null,
            postalCode: countryData.postalCode || null,
            flag: countryData.flag || null, // emoji
            countryInfo: {
              capital: countryData.capital?.[0] || null,
              region: countryData.region || null,
              subregion: countryData.subregion || null,
              population: countryData.population || null,
              governmentForm: null, // To be added manually or from another source
            }
          };
          
          await storage.createCountry(country);
        }
      }
      
      res.json({ success: true, message: "Countries data initialized successfully" });
    } catch (error) {
      console.error("Error initializing countries data:", error);
      res.status(500).json({ success: false, message: "Failed to initialize countries data" });
    }
  });

  // Get all countries
  app.get("/api/countries", async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      res.json(countries);
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ message: "Failed to fetch countries" });
    }
  });
  
  // Debug route to get all available country codes
  app.get("/api/countries/debug/codes", async (req, res) => {
    try {
      const countries = await storage.getAllCountries();
      const codes = countries.map(c => ({ 
        name: c.name, 
        alpha2Code: c.alpha2Code, 
        alpha3Code: c.alpha3Code 
      }));
      res.json(codes);
    } catch (error) {
      console.error("Error fetching country codes:", error);
      res.status(500).json({ message: "Failed to fetch country codes" });
    }
  });

  // Get countries by region
  app.get("/api/countries/region/:region", async (req, res) => {
    try {
      const { region } = req.params;
      const countries = await storage.getCountriesByRegion(region);
      res.json(countries);
    } catch (error) {
      console.error(`Error fetching countries for region ${req.params.region}:`, error);
      res.status(500).json({ message: "Failed to fetch countries by region" });
    }
  });

  // Get country by code
  app.get("/api/countries/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      console.log("Finding country with code:", code);
      const country = await storage.getCountryByCode(code);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      console.log("Found country:", country.name);
      res.json(country);
    } catch (error) {
      console.error(`Error fetching country with code ${req.params.code}:`, error);
      res.status(500).json({ message: "Failed to fetch country by code" });
    }
  });

  // Get country by ID
  app.get("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const country = await storage.getCountryById(id);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      res.json(country);
    } catch (error) {
      console.error(`Error fetching country with id ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch country by id" });
    }
  });

  // Update country by ID
  app.patch("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const country = await storage.getCountryById(id);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Update the country
      const updatedCountry = await storage.updateCountry(id, req.body);
      if (!updatedCountry) {
        return res.status(500).json({ message: "Failed to update country" });
      }
      
      res.json(updatedCountry);
    } catch (error: any) {
      console.error(`Error updating country with id ${req.params.id}:`, error);
      res.status(400).json({ message: error.message || "Failed to update country" });
    }
  });

  // Timeline events routes
  app.get("/api/countries/:countryId/timeline", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const events = await storage.getTimelineEventsByCountryId(countryId);
      res.json(events);
    } catch (error) {
      console.error(`Error fetching timeline events for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch timeline events" });
    }
  });

  app.post("/api/countries/:countryId/timeline", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Use date as a string without conversion
      const data = {
        ...req.body,
        countryId,
        date: req.body.date || null,
      };
      
      const validatedData = insertTimelineEventSchema.parse(data);
      
      const event = await storage.createTimelineEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      console.error(`Error creating timeline event:`, error);
      res.status(400).json({ message: error.message || "Failed to create timeline event" });
    }
  });

  // Statistics routes
  app.get("/api/countries/:countryId/statistics", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const statistics = await storage.getStatisticsByCountryId(countryId);
      res.json(statistics);
    } catch (error) {
      console.error(`Error fetching statistics for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.post("/api/countries/:countryId/statistics", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      const data = {
        ...req.body,
        countryId,
      };
      
      const validatedData = insertStatisticSchema.parse(data);
      
      const statistic = await storage.createStatistic(validatedData);
      res.status(201).json(statistic);
    } catch (error: any) {
      console.error(`Error creating statistic:`, error);
      res.status(400).json({ message: error.message || "Failed to create statistic" });
    }
  });

  app.patch("/api/statistics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedStatistic = await storage.updateStatistic(id, req.body);
      
      if (!updatedStatistic) {
        return res.status(404).json({ message: "Statistic not found" });
      }
      
      res.json(updatedStatistic);
    } catch (error: any) {
      console.error(`Error updating statistic with id ${req.params.id}:`, error);
      res.status(400).json({ message: error.message || "Failed to update statistic" });
    }
  });

  app.delete("/api/statistics/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStatistic(id);
      
      if (!success) {
        return res.status(404).json({ message: "Statistic not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting statistic with id ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete statistic" });
    }
  });
  
  // Political leaders routes
  app.get("/api/countries/:countryId/leaders", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const leaders = await storage.getPoliticalLeadersByCountryId(countryId);
      res.json(leaders);
    } catch (error) {
      console.error(`Error fetching political leaders for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch political leaders" });
    }
  });

  app.post("/api/countries/:countryId/leaders", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Format the data
      const data = {
        ...req.body,
        countryId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
        ideologies: req.body.ideologies || [],
      };
      
      const validatedData = insertPoliticalLeaderSchema.parse(data);
      
      const leader = await storage.createPoliticalLeader(validatedData);
      res.status(201).json(leader);
    } catch (error: any) {
      console.error(`Error creating political leader:`, error);
      res.status(400).json({ message: error.message || "Failed to create political leader" });
    }
  });

  // Political system routes
  app.get("/api/countries/:countryId/political-system", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const system = await storage.getPoliticalSystemByCountryId(countryId);
      
      if (!system) {
        return res.status(404).json({ message: "Political system not found" });
      }
      
      res.json(system);
    } catch (error) {
      console.error(`Error fetching political system for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch political system" });
    }
  });

  app.post("/api/countries/:countryId/political-system", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Check if political system already exists
      const existingSystem = await storage.getPoliticalSystemByCountryId(countryId);
      
      if (existingSystem) {
        return res.status(400).json({ message: "Political system already exists for this country. Use PUT to update." });
      }
      
      // Prepare data
      const data = {
        ...req.body,
        countryId,
        freedomIndex: req.body.freedomIndex ? parseInt(req.body.freedomIndex) : null,
        governmentBranches: req.body.governmentBranches || [],
        democraticPrinciples: req.body.democraticPrinciples || [],
        internationalRelations: req.body.internationalRelations || [],
        laws: req.body.laws || [],
        organizations: req.body.organizations || [],
      };
      
      const validatedData = insertPoliticalSystemSchema.parse(data);
      
      const system = await storage.createPoliticalSystem(validatedData);
      res.status(201).json(system);
    } catch (error: any) {
      console.error(`Error creating political system:`, error);
      res.status(400).json({ message: error.message || "Failed to create political system" });
    }
  });

  app.patch("/api/countries/:countryId/timeline/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const eventId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing event to verify ownership
      const existingEvent = await storage.getTimelineEventsByCountryId(countryId);
      const event = existingEvent.find(e => e.id === eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Timeline event not found for this country" });
      }
      
      // Format the data for update
      const data = {
        ...req.body,
        countryId,
        // Use date as a string without conversion
        date: req.body.date || undefined,
      };
      
      // Update the timeline event
      const updatedEvent = await storage.updateTimelineEvent(eventId, data);
      if (!updatedEvent) {
        return res.status(500).json({ message: "Failed to update timeline event" });
      }
      
      res.json(updatedEvent);
    } catch (error: any) {
      console.error(`Error updating timeline event:`, error);
      res.status(400).json({ message: error.message || "Failed to update timeline event" });
    }
  });

  app.delete("/api/countries/:countryId/timeline/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const eventId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing event to verify ownership
      const existingEvent = await storage.getTimelineEventsByCountryId(countryId);
      const event = existingEvent.find(e => e.id === eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Timeline event not found for this country" });
      }
      
      // Delete the timeline event
      const deleted = await storage.deleteTimelineEvent(eventId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete timeline event" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting timeline event:`, error);
      res.status(500).json({ message: "Failed to delete timeline event" });
    }
  });

  // PATCH for updating political leaders
  app.patch("/api/countries/:countryId/leaders/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const leaderId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing leader to verify ownership
      const existingLeaders = await storage.getPoliticalLeadersByCountryId(countryId);
      const leader = existingLeaders.find(l => l.id === leaderId);
      
      if (!leader) {
        return res.status(404).json({ message: "Political leader not found for this country" });
      }
      
      // Format the data for update
      const data = {
        ...req.body,
        countryId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        ideologies: req.body.ideologies || undefined,
      };
      
      // Update the political leader
      const updatedLeader = await storage.updatePoliticalLeader(leaderId, data);
      if (!updatedLeader) {
        return res.status(500).json({ message: "Failed to update political leader" });
      }
      
      res.json(updatedLeader);
    } catch (error: any) {
      console.error(`Error updating political leader:`, error);
      res.status(400).json({ message: error.message || "Failed to update political leader" });
    }
  });

  // DELETE for political leaders
  app.delete("/api/countries/:countryId/leaders/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const leaderId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing leader to verify ownership
      const existingLeaders = await storage.getPoliticalLeadersByCountryId(countryId);
      const leader = existingLeaders.find(l => l.id === leaderId);
      
      if (!leader) {
        return res.status(404).json({ message: "Political leader not found for this country" });
      }
      
      // Delete the political leader
      const deleted = await storage.deletePoliticalLeader(leaderId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete political leader" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting political leader:`, error);
      res.status(500).json({ message: "Failed to delete political leader" });
    }
  });

  // PATCH for updating political system
  app.patch("/api/countries/:countryId/political-system", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing system
      const existingSystem = await storage.getPoliticalSystemByCountryId(countryId);
      
      if (!existingSystem) {
        return res.status(404).json({ message: "Political system not found for this country" });
      }
      
      // Format the data for update
      const data = {
        ...req.body,
        countryId,
        freedomIndex: req.body.freedomIndex ? parseInt(req.body.freedomIndex) : undefined,
        governmentBranches: req.body.governmentBranches || undefined,
        democraticPrinciples: req.body.democraticPrinciples || undefined,
        internationalRelations: req.body.internationalRelations || undefined,
        laws: req.body.laws || undefined,
        organizations: req.body.organizations || undefined,
      };
      
      // Update the political system
      const updatedSystem = await storage.updatePoliticalSystem(existingSystem.id, data);
      if (!updatedSystem) {
        return res.status(500).json({ message: "Failed to update political system" });
      }
      
      res.json(updatedSystem);
    } catch (error: any) {
      console.error(`Error updating political system:`, error);
      res.status(400).json({ message: error.message || "Failed to update political system" });
    }
  });

  // Political system routes
  app.get("/api/countries/:countryId/political-system", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const politicalSystem = await storage.getPoliticalSystemByCountryId(countryId);
      
      if (!politicalSystem) {
        return res.status(404).json({ message: "Political system not found" });
      }
      
      res.json(politicalSystem);
    } catch (error) {
      console.error(`Error fetching political system for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch political system" });
    }
  });
  
  app.post("/api/countries/:countryId/political-system", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      const data = {
        ...req.body,
        countryId,
      };
      
      const validatedData = insertPoliticalSystemSchema.parse(data);
      
      const politicalSystem = await storage.createPoliticalSystem(validatedData);
      res.status(201).json(politicalSystem);
    } catch (error: any) {
      console.error(`Error creating political system:`, error);
      res.status(400).json({ message: error.message || "Failed to create political system" });
    }
  });
  
  app.patch("/api/countries/:countryId/political-system/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const countryId = parseInt(req.params.countryId);
      
      // Check if country exists
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Check if political system exists
      const existingSystem = await storage.getPoliticalSystemByCountryId(countryId);
      if (!existingSystem || existingSystem.id !== id) {
        return res.status(404).json({ message: "Political system not found for this country" });
      }
      
      const updatedSystem = await storage.updatePoliticalSystem(id, req.body);
      if (!updatedSystem) {
        return res.status(500).json({ message: "Failed to update political system" });
      }
      
      res.json(updatedSystem);
    } catch (error: any) {
      console.error(`Error updating political system:`, error);
      res.status(400).json({ message: error.message || "Failed to update political system" });
    }
  });

  // Political parties routes
  app.get("/api/countries/:countryId/parties", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const parties = await storage.getPoliticalPartiesByCountryId(countryId);
      res.json(parties);
    } catch (error) {
      console.error(`Error fetching political parties for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch political parties" });
    }
  });
  
  app.post("/api/countries/:countryId/parties", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      
      // Check if country exists
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      const data = {
        ...req.body,
        countryId
      };
      
      const validatedData = insertPoliticalPartySchema.parse(data);
      
      const party = await storage.createPoliticalParty(validatedData);
      res.status(201).json(party);
    } catch (error: any) {
      console.error(`Error creating political party:`, error);
      res.status(400).json({ message: error.message || "Failed to create political party" });
    }
  });
  
  app.patch("/api/countries/:countryId/parties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const countryId = parseInt(req.params.countryId);
      
      // Check if country exists
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing party
      const parties = await storage.getPoliticalPartiesByCountryId(countryId);
      const existingParty = parties.find(party => party.id === id);
      
      if (!existingParty) {
        return res.status(404).json({ message: "Political party not found for this country" });
      }
      
      // Update the party
      const updatedParty = await storage.updatePoliticalParty(id, req.body);
      if (!updatedParty) {
        return res.status(500).json({ message: "Failed to update political party" });
      }
      
      res.json(updatedParty);
    } catch (error: any) {
      console.error(`Error updating political party:`, error);
      res.status(400).json({ message: error.message || "Failed to update political party" });
    }
  });
  
  app.delete("/api/countries/:countryId/parties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const countryId = parseInt(req.params.countryId);
      
      // Check if country exists
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing party
      const parties = await storage.getPoliticalPartiesByCountryId(countryId);
      const existingParty = parties.find(party => party.id === id);
      
      if (!existingParty) {
        return res.status(404).json({ message: "Political party not found for this country" });
      }
      
      // Delete the party
      const success = await storage.deletePoliticalParty(id);
      if (!success) {
        return res.status(500).json({ message: "Failed to delete political party" });
      }
      
      res.status(204).end();
    } catch (error: any) {
      console.error(`Error deleting political party:`, error);
      res.status(400).json({ message: error.message || "Failed to delete political party" });
    }
  });

  // Economy routes
  app.get("/api/countries/:countryId/economy", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const economicData = await storage.getEconomicDataByCountryId(countryId);
      
      if (!economicData) {
        return res.status(404).json({ message: "Economic data not found" });
      }
      
      res.json(economicData);
    } catch (error) {
      console.error(`Error fetching economic data for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch economic data" });
    }
  });
  
  app.post("/api/countries/:countryId/economy", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      const data = {
        ...req.body,
        countryId,
      };
      
      const validatedData = insertEconomicDataSchema.parse(data);
      
      const economicData = await storage.createEconomicData(validatedData);
      res.status(201).json(economicData);
    } catch (error: any) {
      console.error(`Error creating economic data:`, error);
      res.status(400).json({ message: error.message || "Failed to create economic data" });
    }
  });
  
  app.patch("/api/countries/:countryId/economy/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const countryId = parseInt(req.params.countryId);
      
      // Check if country exists
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Check if economic data exists
      const existingData = await storage.getEconomicDataByCountryId(countryId);
      if (!existingData || existingData.id !== id) {
        return res.status(404).json({ message: "Economic data not found for this country" });
      }
      
      const updatedData = await storage.updateEconomicData(id, req.body);
      if (!updatedData) {
        return res.status(500).json({ message: "Failed to update economic data" });
      }
      
      res.json(updatedData);
    } catch (error: any) {
      console.error(`Error updating economic data:`, error);
      res.status(400).json({ message: error.message || "Failed to update economic data" });
    }
  });

  // International relations routes
  app.get("/api/countries/:countryId/relations", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const relations = await storage.getInternationalRelationsByCountryId(countryId);
      res.json(relations);
    } catch (error) {
      console.error(`Error fetching international relations for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch international relations" });
    }
  });

  app.post("/api/countries/:countryId/relations", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Format the data
      const data = {
        ...req.body,
        countryId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : null,
      };
      
      const validatedData = insertInternationalRelationSchema.parse(data);
      
      const relation = await storage.createInternationalRelation(validatedData);
      res.status(201).json(relation);
    } catch (error: any) {
      console.error(`Error creating international relation:`, error);
      res.status(400).json({ message: error.message || "Failed to create international relation" });
    }
  });

  // PATCH for updating international relations
  app.patch("/api/countries/:countryId/relations/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const relationId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing relation to verify ownership
      const existingRelations = await storage.getInternationalRelationsByCountryId(countryId);
      const relation = existingRelations.find(r => r.id === relationId);
      
      if (!relation) {
        return res.status(404).json({ message: "International relation not found for this country" });
      }
      
      // Format the data for update
      const data = {
        ...req.body,
        countryId,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
      };
      
      // Update the international relation
      const updatedRelation = await storage.updateInternationalRelation(relationId, data);
      if (!updatedRelation) {
        return res.status(500).json({ message: "Failed to update international relation" });
      }
      
      res.json(updatedRelation);
    } catch (error: any) {
      console.error(`Error updating international relation:`, error);
      res.status(400).json({ message: error.message || "Failed to update international relation" });
    }
  });

  // DELETE for international relations
  app.delete("/api/countries/:countryId/relations/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const relationId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing relation to verify ownership
      const existingRelations = await storage.getInternationalRelationsByCountryId(countryId);
      const relation = existingRelations.find(r => r.id === relationId);
      
      if (!relation) {
        return res.status(404).json({ message: "International relation not found for this country" });
      }
      
      // Delete the international relation
      const deleted = await storage.deleteInternationalRelation(relationId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete international relation" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting international relation:`, error);
      res.status(500).json({ message: "Failed to delete international relation" });
    }
  });

  // Historical laws routes
  app.get("/api/countries/:countryId/laws", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const laws = await storage.getHistoricalLawsByCountryId(countryId);
      res.json(laws);
    } catch (error) {
      console.error(`Error fetching historical laws for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch historical laws" });
    }
  });

  app.post("/api/countries/:countryId/laws", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Format the data
      const data = {
        ...req.body,
        countryId,
        // Use date as a string without conversion
        date: req.body.date || null,
      };
      
      const validatedData = insertHistoricalLawSchema.parse(data);
      
      const law = await storage.createHistoricalLaw(validatedData);
      res.status(201).json(law);
    } catch (error: any) {
      console.error(`Error creating historical law:`, error);
      res.status(400).json({ message: error.message || "Failed to create historical law" });
    }
  });

  // PATCH for updating historical laws
  app.patch("/api/countries/:countryId/laws/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const lawId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing law to verify ownership
      const existingLaws = await storage.getHistoricalLawsByCountryId(countryId);
      const law = existingLaws.find(l => l.id === lawId);
      
      if (!law) {
        return res.status(404).json({ message: "Historical law not found for this country" });
      }
      
      // Format the data for update
      const data = {
        ...req.body,
        countryId,
        // Use date as a string without conversion
        date: req.body.date || undefined,
      };
      
      // Update the historical law
      const updatedLaw = await storage.updateHistoricalLaw(lawId, data);
      if (!updatedLaw) {
        return res.status(500).json({ message: "Failed to update historical law" });
      }
      
      res.json(updatedLaw);
    } catch (error: any) {
      console.error(`Error updating historical law:`, error);
      res.status(400).json({ message: error.message || "Failed to update historical law" });
    }
  });

  // DELETE for historical laws
  app.delete("/api/countries/:countryId/laws/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const lawId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing law to verify ownership
      const existingLaws = await storage.getHistoricalLawsByCountryId(countryId);
      const law = existingLaws.find(l => l.id === lawId);
      
      if (!law) {
        return res.status(404).json({ message: "Historical law not found for this country" });
      }
      
      // Delete the historical law
      const deleted = await storage.deleteHistoricalLaw(lawId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete historical law" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting historical law:`, error);
      res.status(500).json({ message: "Failed to delete historical law" });
    }
  });

  // Statistics routes
  app.get("/api/countries/:countryId/statistics", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const statistics = await storage.getStatisticsByCountryId(countryId);
      res.json(statistics);
    } catch (error) {
      console.error(`Error fetching statistics for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.post("/api/countries/:countryId/statistics", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Format the data
      const data = {
        ...req.body,
        countryId,
        year: req.body.year ? parseInt(req.body.year) : null,
        data: req.body.data || [],
      };
      
      const validatedData = insertStatisticSchema.parse(data);
      
      const statistic = await storage.createStatistic(validatedData);
      res.status(201).json(statistic);
    } catch (error: any) {
      console.error(`Error creating statistic:`, error);
      res.status(400).json({ message: error.message || "Failed to create statistic" });
    }
  });

  // PATCH for updating statistics
  app.patch("/api/countries/:countryId/statistics/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const statisticId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing statistic to verify ownership
      const existingStatistics = await storage.getStatisticsByCountryId(countryId);
      const statistic = existingStatistics.find(s => s.id === statisticId);
      
      if (!statistic) {
        return res.status(404).json({ message: "Statistic not found for this country" });
      }
      
      // Format the data for update
      const data = {
        ...req.body,
        countryId,
        year: req.body.year ? parseInt(req.body.year) : undefined,
        data: req.body.data || undefined,
      };
      
      // Update the statistic
      const updatedStatistic = await storage.updateStatistic(statisticId, data);
      if (!updatedStatistic) {
        return res.status(500).json({ message: "Failed to update statistic" });
      }
      
      res.json(updatedStatistic);
    } catch (error: any) {
      console.error(`Error updating statistic:`, error);
      res.status(400).json({ message: error.message || "Failed to update statistic" });
    }
  });

  // DELETE for statistics
  app.delete("/api/countries/:countryId/statistics/:id", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const statisticId = parseInt(req.params.id);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing statistic to verify ownership
      const existingStatistics = await storage.getStatisticsByCountryId(countryId);
      const statistic = existingStatistics.find(s => s.id === statisticId);
      
      if (!statistic) {
        return res.status(404).json({ message: "Statistic not found for this country" });
      }
      
      // Delete the statistic
      const deleted = await storage.deleteStatistic(statisticId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete statistic" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error(`Error deleting statistic:`, error);
      res.status(500).json({ message: "Failed to delete statistic" });
    }
  });

  // Economic data routes
  app.get("/api/countries/:countryId/economy", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const economy = await storage.getEconomicDataByCountryId(countryId);
      
      if (!economy) {
        return res.status(404).json({ message: "Economic data not found" });
      }
      
      res.json(economy);
    } catch (error) {
      console.error(`Error fetching economic data for country ${req.params.countryId}:`, error);
      res.status(500).json({ message: "Failed to fetch economic data" });
    }
  });

  app.post("/api/countries/:countryId/economy", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const country = await storage.getCountryById(countryId);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Check if economic data already exists
      const existingEconomy = await storage.getEconomicDataByCountryId(countryId);
      
      if (existingEconomy) {
        return res.status(400).json({ message: "Economic data already exists for this country. Use PATCH to update." });
      }
      
      // Format the data
      const data = {
        ...req.body,
        countryId,
        gdp: req.body.gdp ? parseInt(req.body.gdp) : null,
        gdpPerCapita: req.body.gdpPerCapita ? parseInt(req.body.gdpPerCapita) : null,
        mainIndustries: req.body.mainIndustries || [],
        tradingPartners: req.body.tradingPartners || [],
        challenges: req.body.challenges || [],
        reforms: req.body.reforms || [],
        initiatives: req.body.initiatives || [],
      };
      
      const validatedData = insertEconomicDataSchema.parse(data);
      
      const economy = await storage.createEconomicData(validatedData);
      res.status(201).json(economy);
    } catch (error: any) {
      console.error(`Error creating economic data:`, error);
      res.status(400).json({ message: error.message || "Failed to create economic data" });
    }
  });

  // PATCH for updating economic data
  app.patch("/api/countries/:countryId/economy", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      
      // Fetch the country
      const country = await storage.getCountryById(countryId);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Get existing economic data
      const existingEconomy = await storage.getEconomicDataByCountryId(countryId);
      
      if (!existingEconomy) {
        return res.status(404).json({ message: "Economic data not found for this country" });
      }
      
      // Format the data for update
      const data = {
        ...req.body,
        countryId,
        gdp: req.body.gdp ? parseInt(req.body.gdp) : undefined,
        gdpPerCapita: req.body.gdpPerCapita ? parseInt(req.body.gdpPerCapita) : undefined,
        mainIndustries: req.body.mainIndustries || undefined,
        tradingPartners: req.body.tradingPartners || undefined,
        challenges: req.body.challenges || undefined,
        reforms: req.body.reforms || undefined,
        initiatives: req.body.initiatives || undefined,
      };
      
      // Update the economic data
      const updatedEconomy = await storage.updateEconomicData(existingEconomy.id, data);
      if (!updatedEconomy) {
        return res.status(500).json({ message: "Failed to update economic data" });
      }
      
      res.json(updatedEconomy);
    } catch (error: any) {
      console.error(`Error updating economic data:`, error);
      res.status(400).json({ message: error.message || "Failed to update economic data" });
    }
  });

  return createServer(app);
}