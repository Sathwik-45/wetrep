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

// Updated WeatherPage component to correctly handle params
const WeatherPage = ({ params }: { params: { id: string } }) => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [cityData, setCityData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure params.id exists before proceeding
    if (!params.id) return;

    const fetchData = async () => {
      try {
        // Fetch city data from GeoNames
        const geoRes = await axios.get(
          `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=${params.id}`
        );

        const city = geoRes.data.records?.[0];
        if (!city) {
          setError("City not found");
          return;
        }

        setCityData(city.fields);
        const { name, coordinates } = city.fields;
        const [lat, lon] = coordinates;

        // Fetch weather data from OpenWeatherMap
        const weatherRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        setWeatherData(weatherRes.data);
      } catch (err) {
        setError("Error fetching weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]); // Dependency on params.id to refetch when it's available

  if (loading) return <div>Loading...</div>;

  if (error) return <div className="text-danger">{error}</div>;

  if (!cityData || !weatherData) return <div>No data available</div>;

  const { name } = cityData;

  return (
    <div className="container mt-5">
      <div className="card shadow-lg p-4">
        <h2 className="mb-4 text-primary">🌤️ Weather in {name}</h2>
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

export default WeatherPage;
