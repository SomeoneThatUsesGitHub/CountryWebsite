import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { z } from "zod";
import { 
  insertTimelineEventSchema, 
  insertPoliticalLeaderSchema, 
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

  // Get a specific country by code
  app.get("/api/countries/code/:code", async (req, res) => {
    try {
      const { code } = req.params;
      console.log(`Finding country with code: ${code}`);
      
      const country = await storage.getCountryByCode(code);
      
      if (!country) {
        console.log(`Country with code ${code} not found`);
        return res.status(404).json({ message: "Country not found" });
      }
      
      console.log(`Found country: ${country.name}`);
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

  // Get a specific country by ID
  app.get("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const country = await storage.getCountryById(id);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      res.json(country);
    } catch (error) {
      console.error(`Error fetching country with ID ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to fetch country" });
    }
  });

  // Update a country
  app.patch("/api/countries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const country = await storage.getCountryById(id);
      
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      
      // Create a validation schema that allows partial updates
      const updateCountrySchema = insertCountrySchema.partial();
      
      // Validate the request body
      const validatedData = updateCountrySchema.parse(req.body);
      
      // Handle the countryInfo object separately if it exists
      let countryInfoUpdate = undefined;
      if (req.body.countryInfo) {
        countryInfoUpdate = req.body.countryInfo;
        delete validatedData.countryInfo; // Remove from validatedData to avoid double updating
      }
      
      // If countryInfo exists in the data but isn't in the update, preserve it
      if (country.countryInfo && !countryInfoUpdate) {
        countryInfoUpdate = country.countryInfo;
      }
      
      // Include countryInfo in the update if we have it
      const updateData = countryInfoUpdate 
        ? { ...validatedData, countryInfo: countryInfoUpdate } 
        : validatedData;
      
      // Update the country
      const updatedCountry = await storage.updateCountry(id, updateData);
      
      if (!updatedCountry) {
        return res.status(500).json({ message: "Failed to update country" });
      }
      
      res.json(updatedCountry);
    } catch (error: any) {
      console.error(`Error updating country:`, error);
      res.status(400).json({ message: error.message || "Failed to update country" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
