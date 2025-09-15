/** @format */
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Container from "./Container";
import Image from "next/image";

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
  };
  forecast: {
    forecastday: {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }[];
  };
}

export default function WeatherAPITest() {
  const [location, setLocation] = useState("London");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);

    try {
      // Make sure we get all 7 days of forecast data
      const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${location}&days=7&aqi=no&alerts=no`,
      );
      setWeather(response.data);
      console.log("WeatherAPI data:", response.data);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeather();
  };

  if (loading) {
    return (
      <Container className="p-6 max-w-2xl mx-auto">
        <div className="animate-pulse text-center p-4">
          Loading weather data...
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="p-6 max-w-2xl mx-auto">
        <div className="text-red-500 p-4 text-center">{error}</div>
        <button
          onClick={fetchWeather}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Try Again
        </button>
      </Container>
    );
  }

  return (
    <Container className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">7-Day Weather Forecast</h2>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location"
            className="flex-1 px-4 py-2 border rounded-md"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      {weather && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold">
              {weather.location.name}, {weather.location.country}
            </h3>
            <p className="text-sm text-gray-500">
              Local time: {weather.location.localtime}
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 p-4 bg-blue-50 rounded-lg mb-4">
            <Image
              src={weather.current.condition.icon}
              alt={weather.current.condition.text}
              width={64}
              height={64}
            />
            <div>
              <p className="text-3xl font-bold">{weather.current.temp_c}°C</p>
              <p className="text-gray-700">{weather.current.condition.text}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Feels Like</p>
              <p className="font-medium">{weather.current.feelslike_c}°C</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Humidity</p>
              <p className="font-medium">{weather.current.humidity}%</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-500">Wind</p>
              <p className="font-medium">{weather.current.wind_kph} km/h</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">7-Day Forecast</h4>
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2 min-w-max">
                {weather.forecast.forecastday.map((day) => (
                  <div
                    key={day.date}
                    className="p-3 bg-gray-50 rounded text-center w-28"
                  >
                    <p className="font-medium">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mb-1">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <Image
                      src={day.day.condition.icon}
                      alt={day.day.condition.text}
                      width={40}
                      height={40}
                      className="mx-auto my-1"
                    />
                    <div className="text-xs flex justify-center gap-1 mt-1">
                      <span>{day.day.mintemp_c}°</span>
                      <span>-</span>
                      <span className="font-medium">{day.day.maxtemp_c}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
