"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTemperatureHigh,
  FaTemperatureLow,
  FaTint,
  FaCompressArrowsAlt,
  FaWind,
  FaCloud,
} from "react-icons/fa";

const API_KEY = "4edc04df0c2727cd8d6e8355f37e759e";

interface PageProps {
  params: {
    id: string;
  };
}

interface CityFields {
  name: string;
  coordinates: [number, number];
}

interface GeoResponse {
  records: { fields: CityFields }[];
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
  };
  weather: {
    description: string;
  }[];
}

const Page: React.FC<PageProps> = ({ params }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [cityData, setCityData] = useState<CityFields | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;

    const fetchData = async () => {
      try {
        const geoRes = await axios.get<GeoResponse>(
          `https://public.opendatasoft.com/api/records/1.0/search/`,
          {
            params: {
              dataset: "geonames-all-cities-with-a-population-1000",
              q: params.id,
            },
          }
        );

        const city = geoRes.data.records?.[0];
        if (!city) {
          setError("City not found");
          return;
        }

        setCityData(city.fields);
        const [lat, lon] = city.fields.coordinates;

        const weatherRes = await axios.get<WeatherData>(
          `https://api.openweathermap.org/data/2.5/weather`,
          {
            params: {
              lat,
              lon,
              appid: API_KEY,
              units: "metric",
            },
          }
        );

        setWeatherData(weatherRes.data);
      } catch {
        setError("Error fetching weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;
  if (!cityData || !weatherData) return <div>No data available</div>;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="mb-4 text-primary">🌤️ Weather in {cityData.name}</h2>
        <ul className="list-group list-group-flush fs-5">
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaTemperatureHigh className="text-danger me-2" />
              Temperature
            </span>
            <span>{weatherData.main.temp} °C</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaTemperatureLow className="text-info me-2" />
              Feels Like
            </span>
            <span>{weatherData.main.feels_like} °C</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaTint className="text-primary me-2" />
              Humidity
            </span>
            <span>{weatherData.main.humidity}%</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaCompressArrowsAlt className="text-secondary me-2" />
              Pressure
            </span>
            <span>{weatherData.main.pressure} hPa</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaWind className="text-success me-2" />
              Wind Speed
            </span>
            <span>{weatherData.wind.speed} m/s</span>
          </li>
          <li className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              <FaCloud className="text-warning me-2" />
              Condition
            </span>
            <span>{weatherData.weather[0].description}</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Page;
