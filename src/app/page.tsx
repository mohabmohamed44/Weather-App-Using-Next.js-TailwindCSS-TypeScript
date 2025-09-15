/** @format */
"use client";

import Container from "@/components/Container";
import ForecastWeatherDetail from "@/components/ForeCastWeatherDetails";
import Navbar from "@/components/navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import { metersToKilometers } from "@/utils/metersToKilometers";
import axios from "axios";
import { format, fromUnixTime, parseISO } from "date-fns";
import Image from "next/image";
import { useQuery } from "react-query";
import { loadingCityAtom, placeAtom } from "./atom";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import DebugInfo from "@/components/DebugInfo";
// import { format as dateFromate } from "date-format";

// var format = require('date-format');
// format('hh:mm:ss.SSS', new Date()); // just the time
interface ForecastDay {
  date: string;
  date_epoch: number;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    avgtemp_c: number;
    maxwind_kph: number;
    totalprecip_mm: number;
    totalsnow_cm: number;
    avgvis_km: number;
    avghumidity: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    uv: number;
  };
  astro: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moon_phase: string;
    moon_illumination: string;
  };
  hour: {
    time_epoch: number;
    time: string;
    temp_c: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    windchill_c: number;
    heatindex_c: number;
    dewpoint_c: number;
    will_it_rain: number;
    chance_of_rain: number;
    will_it_snow: number;
    chance_of_snow: number;
    vis_km: number;
    gust_kph: number;
    uv: number;
  }[];
}

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated_epoch: number;
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    pressure_in: number;
    precip_mm: number;
    precip_in: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    feelslike_f: number;
    vis_km: number;
    vis_miles: number;
    uv: number;
    gust_mph: number;
    gust_kph: number;
  };
  forecast: {
    forecastday: ForecastDay[];
  };
}

export default function Home() {
  const [place, setPlace] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);
  const [showApiHelper, setShowApiHelper] = useState<boolean>(true);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>(
    "repoData",
    async () => {
      // Check if API key is available
      if (!process.env.NEXT_PUBLIC_WEATHER_API_KEY) {
        throw new Error(
          "Weather API key is missing. Please check your .env.local file.",
        );
      }

      try {
        const { data } = await axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=${place}&days=7&aqi=no&alerts=no`,
        );
        console.log(
          `Fetched ${data?.forecast?.forecastday?.length || 0} days of forecast data`,
        );
        return data;
      } catch (error: any) {
        console.error(
          "Weather API Error:",
          error.response?.status,
          error.response?.data,
        );
        if (error.response?.status === 401) {
          throw new Error(
            "Invalid API key. Please check your WeatherAPI.com credentials.",
          );
        }
        throw error;
      }
    },
  );

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const currentData = data?.current;

  // console.log("error", error);

  // Log API response data only when it exists
  if (data) {
    console.log("Weather data received:", data.location?.name);
  } else {
    console.log("No weather data available");
  }

  // Get forecast days data - ensure we have all 7 days
  const forecastDays = data?.forecast.forecastday || [];
  // Log how many days we received for debugging
  console.log(`Received ${forecastDays.length} days of forecast data`);

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center">
        <p className="animate-bounce text-xl font-medium">Loading...</p>
      </div>
    );
  if (error) {
    const isApiKeyError =
      (error as Error).message.includes("API key") ||
      (error as Error).message.includes("401") ||
      (error as Error).message.includes("unauthorized");

    return (
      <div className="flex flex-col items-center min-h-screen justify-center p-4">
        <p className="text-sm text-center mb-2">
          WeatherAPI.com 3-Day Forecast
        </p>

        <p className="text-red-500 text-xl mb-2">Error</p>
        <p className="text-red-400 mb-4">{(error as Error).message}</p>
        <div className="text-sm text-gray-600 max-w-md text-center mb-4">
          <p>If you are seeing an unauthorized error, please check:</p>
          <ul className="list-disc pl-6 text-left mt-2">
            <li>Your WeatherAPI.com API key is correct in .env.local</li>
            <li>Your WeatherAPI.com account is active</li>
            <li>You have enough API calls available in your plan</li>
          </ul>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
          {isApiKeyError && (
            <button
              onClick={() => (window.location.href = "/api-test")}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              API Key Troubleshooter
            </button>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen ">
      <DebugInfo />
      <Navbar location={data?.location.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9  w-full  pb-10 pt-4 ">
        {/* today data  */}
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            <section className="space-y-4 ">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl  items-end ">
                  <p>
                    {format(parseISO(data?.location.localtime ?? ""), "EEEE")}
                  </p>
                  <p className="text-lg">
                    (
                    {format(
                      parseISO(data?.location.localtime ?? ""),
                      "dd.MM.yyyy",
                    )}
                    )
                  </p>
                </h2>
                <Container className=" gap-10 px-6 items-center">
                  {/* temprature */}
                  <div className=" flex flex-col px-4 ">
                    <span className="text-5xl">
                      {currentData?.temp_c ?? 0}°
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span> Feels like</span>
                      <span>{currentData?.feelslike_c ?? 0}°</span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>{forecastDays[0]?.day.mintemp_c ?? 0}°↓ </span>
                      <span> {forecastDays[0]?.day.maxtemp_c ?? 0}°↑</span>
                    </p>
                  </div>
                  {/* time  and weather  icon */}
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {forecastDays[0]?.hour
                      .filter((_, index) => index % 3 === 0) // Get data every 3 hours
                      .map((hour, i) => (
                        <div
                          key={i}
                          className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                        >
                          <p className="whitespace-nowrap">
                            {format(parseISO(hour.time), "h:mm a")}
                          </p>

                          <WeatherIcon
                            iconName={
                              hour.condition.icon
                                .split("/")
                                .pop()
                                ?.replace(".png", "") || "113"
                            }
                          />
                          <p>{hour.temp_c}°</p>
                        </div>
                      ))}
                  </div>
                </Container>
              </div>
              <div className=" flex gap-4">
                {/* left  */}
                <Container className="w-fit  justify-center flex-col px-4 items-center ">
                  <p className=" capitalize text-center">
                    {currentData?.condition.text}{" "}
                  </p>
                  <WeatherIcon
                    iconName={
                      currentData?.condition.icon
                        .split("/")
                        .pop()
                        ?.replace(".png", "") || "113"
                    }
                  />
                </Container>
                <Container className="bg-yellow-300/80  px-6 gap-4 justify-between overflow-x-auto">
                  <WeatherDetails
                    visability={`${currentData?.vis_km ?? 10} km`}
                    airPressure={`${currentData?.pressure_mb ?? 1000} hPa`}
                    humidity={`${currentData?.humidity ?? 0}%`}
                    sunrise={forecastDays[0]?.astro.sunrise ?? "06:00 AM"}
                    sunset={forecastDays[0]?.astro.sunset ?? "06:00 PM"}
                    windSpeed={`${currentData?.wind_kph ?? 0} km/h`}
                  />
                </Container>
                {/* right  */}
              </div>
            </section>

            {/* 3-day forecast data  */}
            <section className="flex w-full flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">3-Day Weather Forecast</h2>
                <p className="text-sm text-gray-500">
                  {forecastDays.length} days available
                </p>
              </div>

              {/* Desktop view - full details */}
              <div className="hidden md:block">
                {forecastDays.map((day, i) => (
                  <ForecastWeatherDetail
                    key={i}
                    description={day.day.condition.text}
                    weatehrIcon={
                      day.day.condition.icon
                        .split("/")
                        .pop()
                        ?.replace(".png", "") || "113"
                    }
                    date={format(parseISO(day.date), "dd.MM")}
                    day={format(parseISO(day.date), "EEEE")}
                    feels_like={day.hour[12]?.feelslike_c ?? 0}
                    temp={day.day.avgtemp_c}
                    temp_max={day.day.maxtemp_c}
                    temp_min={day.day.mintemp_c}
                    airPressure={`${day.hour[12]?.pressure_mb ?? 1000} hPa `}
                    humidity={`${day.day.avghumidity}% `}
                    sunrise={day.astro.sunrise}
                    sunset={day.astro.sunset}
                    visability={`${day.day.avgvis_km} km `}
                    windSpeed={`${day.day.maxwind_kph} km/h `}
                  />
                ))}
              </div>

              {/* Mobile view - compact cards */}
              <div className="md:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {forecastDays.map((day, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-bold">
                            {format(parseISO(day.date), "EEEE")}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {format(parseISO(day.date), "dd MMM yyyy")}
                          </p>
                        </div>
                        <WeatherIcon
                          iconName={
                            day.day.condition.icon
                              .split("/")
                              .pop()
                              ?.replace(".png", "") || "113"
                          }
                          className="h-14 w-14"
                        />
                      </div>

                      <p className="text-sm mb-2">{day.day.condition.text}</p>

                      <div className="flex justify-between text-sm">
                        <div>
                          <p className="font-medium">
                            {day.day.mintemp_c}° - {day.day.maxtemp_c}°
                          </p>
                          <p className="text-xs text-gray-500">Min - Max</p>
                        </div>
                        <div>
                          <p className="font-medium">{day.day.avgtemp_c}°</p>
                          <p className="text-xs text-gray-500">Avg</p>
                        </div>
                        <div>
                          <p className="font-medium">
                            {day.day.maxwind_kph} km/h
                          </p>
                          <p className="text-xs text-gray-500">Wind</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      {/* Today's data skeleton */}
      <div className="space-y-2 animate-pulse">
        {/* Date skeleton */}
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 rounded"></div>
        </div>

        {/* Time wise temperature skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      {/* 7 days forecast skeleton */}
      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 rounded"></p>

        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
