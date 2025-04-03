// Script to manually initialize countries data
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple country data for initialization
const countries = [
  {
    name: "United States",
    alpha2Code: "US",
    alpha3Code: "USA",
    capital: "Washington, D.C.",
    region: "Americas",
    subregion: "North America",
    population: 331002651,
    area: 9629091,
    flagUrl: "https://flagcdn.com/us.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Germany",
    alpha2Code: "DE",
    alpha3Code: "DEU",
    capital: "Berlin",
    region: "Europe",
    subregion: "Western Europe",
    population: 83783942,
    area: 357114,
    flagUrl: "https://flagcdn.com/de.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Japan",
    alpha2Code: "JP",
    alpha3Code: "JPN",
    capital: "Tokyo",
    region: "Asia",
    subregion: "Eastern Asia",
    population: 126476461,
    area: 377930,
    flagUrl: "https://flagcdn.com/jp.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Australia",
    alpha2Code: "AU",
    alpha3Code: "AUS",
    capital: "Canberra",
    region: "Oceania",
    subregion: "Australia and New Zealand",
    population: 25499884,
    area: 7692024,
    flagUrl: "https://flagcdn.com/au.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Brazil",
    alpha2Code: "BR",
    alpha3Code: "BRA",
    capital: "Brasília",
    region: "Americas",
    subregion: "South America",
    population: 212559417,
    area: 8515767,
    flagUrl: "https://flagcdn.com/br.svg",
    independent: true,
    unMember: true
  },
  {
    name: "South Africa",
    alpha2Code: "ZA",
    alpha3Code: "ZAF",
    capital: "Pretoria",
    region: "Africa",
    subregion: "Southern Africa",
    population: 59308690,
    area: 1221037,
    flagUrl: "https://flagcdn.com/za.svg",
    independent: true,
    unMember: true
  },
  {
    name: "India",
    alpha2Code: "IN",
    alpha3Code: "IND",
    capital: "New Delhi",
    region: "Asia",
    subregion: "Southern Asia",
    population: 1380004385,
    area: 3287590,
    flagUrl: "https://flagcdn.com/in.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Russia",
    alpha2Code: "RU",
    alpha3Code: "RUS",
    capital: "Moscow",
    region: "Europe",
    subregion: "Eastern Europe",
    population: 144104080,
    area: 17098246,
    flagUrl: "https://flagcdn.com/ru.svg",
    independent: true,
    unMember: true
  },
  {
    name: "United Kingdom",
    alpha2Code: "GB",
    alpha3Code: "GBR",
    capital: "London",
    region: "Europe",
    subregion: "Northern Europe",
    population: 67215293,
    area: 242900,
    flagUrl: "https://flagcdn.com/gb.svg",
    independent: true,
    unMember: true
  },
  {
    name: "France",
    alpha2Code: "FR",
    alpha3Code: "FRA",
    capital: "Paris",
    region: "Europe",
    subregion: "Western Europe",
    population: 67391582,
    area: 551695,
    flagUrl: "https://flagcdn.com/fr.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Canada",
    alpha2Code: "CA",
    alpha3Code: "CAN",
    capital: "Ottawa",
    region: "Americas",
    subregion: "North America",
    population: 38005238,
    area: 9984670,
    flagUrl: "https://flagcdn.com/ca.svg",
    independent: true,
    unMember: true
  },
  {
    name: "China",
    alpha2Code: "CN",
    alpha3Code: "CHN",
    capital: "Beijing",
    region: "Asia",
    subregion: "Eastern Asia",
    population: 1402112000,
    area: 9640011,
    flagUrl: "https://flagcdn.com/cn.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Italy",
    alpha2Code: "IT",
    alpha3Code: "ITA",
    capital: "Rome",
    region: "Europe",
    subregion: "Southern Europe",
    population: 59554023,
    area: 301336,
    flagUrl: "https://flagcdn.com/it.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Spain",
    alpha2Code: "ES",
    alpha3Code: "ESP",
    capital: "Madrid",
    region: "Europe",
    subregion: "Southern Europe",
    population: 47351567,
    area: 505992,
    flagUrl: "https://flagcdn.com/es.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Mexico",
    alpha2Code: "MX",
    alpha3Code: "MEX",
    capital: "Mexico City",
    region: "Americas",
    subregion: "North America",
    population: 128932753,
    area: 1964375,
    flagUrl: "https://flagcdn.com/mx.svg",
    independent: true,
    unMember: true
  },
  {
    name: "South Korea",
    alpha2Code: "KR",
    alpha3Code: "KOR",
    capital: "Seoul",
    region: "Asia",
    subregion: "Eastern Asia",
    population: 51780579,
    area: 100210,
    flagUrl: "https://flagcdn.com/kr.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Egypt",
    alpha2Code: "EG",
    alpha3Code: "EGY",
    capital: "Cairo",
    region: "Africa",
    subregion: "Northern Africa",
    population: 102334404,
    area: 1002450,
    flagUrl: "https://flagcdn.com/eg.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Sweden",
    alpha2Code: "SE",
    alpha3Code: "SWE",
    capital: "Stockholm",
    region: "Europe",
    subregion: "Northern Europe",
    population: 10353442,
    area: 450295,
    flagUrl: "https://flagcdn.com/se.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Switzerland",
    alpha2Code: "CH",
    alpha3Code: "CHE",
    capital: "Bern",
    region: "Europe",
    subregion: "Western Europe",
    population: 8654622,
    area: 41284,
    flagUrl: "https://flagcdn.com/ch.svg",
    independent: true,
    unMember: true
  },
  {
    name: "Argentina",
    alpha2Code: "AR",
    alpha3Code: "ARG",
    capital: "Buenos Aires",
    region: "Americas",
    subregion: "South America",
    population: 45376763,
    area: 2780400,
    flagUrl: "https://flagcdn.com/ar.svg",
    independent: true,
    unMember: true
  }
];

// Write the data to a JSON file
fs.writeFileSync(
  path.join(__dirname, 'countries-data.json'),
  JSON.stringify(countries, null, 2)
);

console.log(`Saved ${countries.length} countries to countries-data.json`);