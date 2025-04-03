import React from "react";
import { useLocation } from "wouter";
import { Country } from "@/types";
import { formatNumber } from "@/lib/helpers";

interface CountryBannerProps {
  country: Country;
}

const CountryBanner: React.FC<CountryBannerProps> = ({ country }) => {
  const [_, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/");
  };

  return (
    <div
      className="relative bg-cover bg-center h-64 md:h-72 flex flex-col justify-between"
      style={{ backgroundImage: `url(${country.flagUrl})` }}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 z-0"></div>

      {/* Top Navigation */}
      <div className="container mx-auto px-4 pt-5 relative z-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={handleBack}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white"
          >
            <i className="fas fa-arrow-left text-base sm:text-lg"></i>
          </button>
          <div className="bg-primary/80 backdrop-blur-sm text-white px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-sm sm:text-base font-medium">
            {country.region || "Unknown Region"}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pb-6 md:pb-8">
        <div className="w-full">
          <h1 className="text-3xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
            {country.name}
          </h1>

          <div className="grid grid-cols-2 xxs:flex xxs:flex-wrap gap-2 sm:gap-3 mt-3 mb-3">
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center gap-2 sm:gap-3 text-xs xs:text-sm sm:text-base">
              <i className="fas fa-users"></i>
              <span>{formatNumber(country.population || 0)}</span>
            </div>

            <div className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center gap-2 sm:gap-3 text-xs xs:text-sm sm:text-base">
              <i className="fas fa-map-marker-alt"></i>
              <span>
                {country.capital
                  ? country.capital.length > 15
                    ? `${country.capital.substring(0, 13)}...`
                    : country.capital
                  : "No capital"}
              </span>
            </div>

            <div className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center gap-2 sm:gap-3 text-xs xs:text-sm sm:text-base">
              <i className="fas fa-flag"></i>
              <span>
                {country.countryInfo?.governmentForm &&
                country.countryInfo.governmentForm.length > 15
                  ? `${country.countryInfo.governmentForm.substring(0, 13)}...`
                  : country.countryInfo?.governmentForm || "Republic"}
              </span>
            </div>

            <div className="bg-white/20 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center gap-2 sm:gap-3 text-xs xs:text-sm sm:text-base">
              <i className="fas fa-map"></i>
              <span>
                {country.area ? `${formatNumber(country.area)} km²` : "No size"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountryBanner;
