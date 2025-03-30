import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { insertTimelineEventSchema, insertPoliticalLeaderSchema, insertEconomicDataSchema } from "@shared/schema";

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

  // Get a specific country by code
  app.get("/api/countries/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const country = await storage.getCountryByCode(code);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      res.json(country);
    } catch (error) {
      console.error(`Error fetching country with code ${req.params.code}:`, error);
      res.status(500).json({ message: "Failed to fetch country" });
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
      
      const validatedData = insertTimelineEventSchema.parse({
        ...req.body,
        countryId,
      });
      
      const event = await storage.createTimelineEvent(validatedData);
      res.status(201).json(event);
    } catch (error: any) {
      console.error(`Error creating timeline event:`, error);
      res.status(400).json({ message: error.message || "Failed to create timeline event" });
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
      
      const validatedData = insertPoliticalLeaderSchema.parse({
        ...req.body,
        countryId,
      });
      
      const leader = await storage.createPoliticalLeader(validatedData);
      res.status(201).json(leader);
    } catch (error: any) {
      console.error(`Error creating political leader:`, error);
      res.status(400).json({ message: error.message || "Failed to create political leader" });
    }
  });

  // Economic data routes
  app.get("/api/countries/:countryId/economy", async (req, res) => {
    try {
      const countryId = parseInt(req.params.countryId);
      const economicData = await storage.getEconomicDataByCountryId(countryId);
      
      if (!economicData) {
        return res.status(404).json({ message: "Economic data not found for this country" });
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
      
      const validatedData = insertEconomicDataSchema.parse({
        ...req.body,
        countryId,
      });
      
      const economicData = await storage.createEconomicData(validatedData);
      res.status(201).json(economicData);
    } catch (error: any) {
      console.error(`Error creating economic data:`, error);
      res.status(400).json({ message: error.message || "Failed to create economic data" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
