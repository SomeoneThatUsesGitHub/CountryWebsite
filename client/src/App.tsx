import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home";
import CountryPage from "@/pages/country";
import Header from "@/components/layout/Header";
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";
import { Country } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/country">
        {(params) => <CountryPage />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize country data on app load
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("Initializing country data...");
        const result = await apiRequest('GET', '/api/initialize', undefined);
        console.log("Data initialization completed:", result);
        
        // Verify we have countries loaded by fetching all countries
        const countries = await apiRequest<Country[]>('GET', '/api/countries', undefined);
        console.log(`Loaded ${countries.length} countries`);
        
        // Log some debug information about the current URL
        console.log("Current URL:", window.location.href);
        console.log("URL Search Params:", window.location.search);
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        console.log("Country code from URL params:", code);
        
        if (code) {
          // Try to verify this code exists in our data
          try {
            const country = await apiRequest<Country>('GET', `/api/countries/code/${code}`, undefined);
            console.log("Found country for code:", country.name);
          } catch (err) {
            console.error("Could not find country for code:", code, err);
          }
        }
      } catch (error) {
        console.error("Failed to initialize data:", error);
      }
    };

    initializeData();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
