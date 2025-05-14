"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import {
  FaSearch,
  FaCloudSun,
  FaGlobe,
  FaClock,
  FaTemperatureHigh,
  FaTemperatureLow,
} from "react-icons/fa";

// Define types for City and Weather Data
interface City {
  recordid: string;
  fields: {
    name: string;
    cou_name_en: string;
    timezone: string;
    geoname_id: string;
    coordinates: [number, number];
  };
}

interface WeatherData {
  min: number | null;
  max: number | null;
}

interface Forecast {
  main: {
    temp_min: number;
    temp_max: number;
  };
}

const API_KEY = "4edc04df0c2727cd8d6e8355f37e759e";

const CitiesTable = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const loader = useRef<HTMLDivElement | null>(null);

  // Reset cities when search changes
  useEffect(() => {
    setCities([]);
    setWeatherMap({});
    setPage(0);
  }, [search]);

  // Load cities with weather data
  useEffect(() => {
    const loadCities = async () => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `https://public.opendatasoft.com/api/records/1.0/search/`,
          {
            params: {
              dataset: "geonames-all-cities-with-a-population-1000",
              rows: 50,
              start: page * 50,
              q: search,
            },
          }
        );

        const newCities: City[] = res.data.records;
        const newCityIds = new Set(cities.map((c) => c.fields.geoname_id));
        const uniqueCities = newCities.filter(
          (city) => !newCityIds.has(city.fields.geoname_id)
        );

        setCities((prev) => [...prev, ...uniqueCities]);

        for (const city of uniqueCities) {
          const coords = city.fields.coordinates;
          if (coords?.length === 2) {
            const [lat, lon] = coords;
            try {
              const weatherRes = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast`,
                {
                  params: {
                    lat,
                    lon,
                    appid: API_KEY,
                    units: "metric",
                  },
                }
              );
              const forecasts = weatherRes.data.list;
              let min = Number.POSITIVE_INFINITY;
              let max = Number.NEGATIVE_INFINITY;
              forecasts.forEach((f: Forecast) => {
                min = Math.min(min, f.main.temp_min);
                max = Math.max(max, f.main.temp_max);
              });
              setWeatherMap((prev) => ({
                ...prev,
                [city.fields.geoname_id]: {
                  min: Math.round(min),
                  max: Math.round(max),
                },
              }));
            } catch {
              setWeatherMap((prev) => ({
                ...prev,
                [city.fields.geoname_id]: { min: null, max: null },
              }));
            }
          }
        }
      } catch (err: unknown) {
        console.error("Error loading cities", err);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [page, search, cities, loading]); // Added cities and loading as dependencies

  // Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (loader.current) observer.observe(loader.current);
    return () => {
      if (loader.current) observer.unobserve(loader.current);
    };
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4 text-primary">
        <FaGlobe className="me-2" />
        Explore World Cities
      </h2>

      <div className="input-group mb-4 shadow-sm">
        <span className="input-group-text bg-primary text-white">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control border-primary"
          placeholder="Search by City or Country"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="table table-hover table-bordered shadow-sm rounded">
        <thead className="table-primary text-center">
          <tr>
            <th>City</th>
            <th>Country</th>
            <th>
              <FaClock className="me-1" />
              Timezone
            </th>
            <th>
              <FaTemperatureHigh className="text-danger me-1" />
              High
            </th>
            <th>
              <FaTemperatureLow className="text-info me-1" />
              Low
            </th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city) => {
            const weather = weatherMap[city.fields.geoname_id];
            return (
              <tr
                key={city.fields.geoname_id}
                className="align-middle text-center"
              >
                <td className="text-start ps-3">
                  <Link
                    href={`/weather/${city.fields.geoname_id}`}
                    className="text-decoration-none fw-bold text-primary"
                  >
                    <FaCloudSun className="me-2 text-warning" />
                    {city.fields.name}
                  </Link>
                </td>
                <td>{city.fields.cou_name_en}</td>
                <td>{city.fields.timezone}</td>
                <td>
                  {weather?.max != null
                    ? `${weather.max} °C`
                    : loading
                    ? "... "
                    : "N/A"}
                </td>
                <td>
                  {weather?.min != null
                    ? `${weather.min} °C`
                    : loading
                    ? "... "
                    : "N/A"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {loading && <div className="text-center text-secondary">Loading...</div>}
      <div ref={loader} style={{ height: "100px" }} />
    </div>
  );
};

export default CitiesTable;
