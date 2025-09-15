/** @format */
"use client";

import React from "react";
import { MdOutlineLocationOn, MdWbSunny } from "react-icons/md";
import { MdMyLocation } from "react-icons/md";
import SearchBox from "../components/searchBox";
import { useState } from "react";
import axios from "axios";
import { loadingCityAtom, placeAtom } from "@/app/atom";
import { useAtom } from "jotai";

type Props = { location?: string };

const API_KEY = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

export default function Navbar({ location }: Props) {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  //
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);

  async function handleInputChange(value: string) {
    setCity(value);
    if (value.length >= 3) {
      setLoadingSuggestions(true);
      setError("");
      try {
        const response = await axios.get(
          `http://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${value}`,
        );

        if (response.data && response.data.length > 0) {
          const suggestions = response.data.map(
            (item: any) => `${item.name}, ${item.region}, ${item.country}`,
          );
          setSuggestions(suggestions);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
          setError("No locations found");
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            setError("Invalid API key. Please check your configuration.");
          } else if (error.response?.status === 400) {
            setError("Invalid search query. Please try again.");
          } else {
            setError(
              `Search failed: ${error.response?.status || "Network error"}`,
            );
          }
        } else {
          setError("Search service unavailable. Please try again.");
        }
        setSuggestions([]);
        setShowSuggestions(true);
      } finally {
        setLoadingSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      setError("");
    }
  }

  function handleSuggestionClick(value: string) {
    // Extract just the city name from the formatted suggestion "City, Region, Country"
    const cityName = value.split(",")[0].trim();
    setCity(cityName);
    setShowSuggestions(false);
  }

  function handleSubmiSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true);
    e.preventDefault();
    if (city.length < 3) {
      setError("Please enter at least 3 characters");
      setLoadingCity(false);
      return;
    }

    // If no suggestions but user typed something, try to search anyway
    setError("");
    setTimeout(() => {
      setLoadingCity(false);
      setPlace(city);
      setShowSuggestions(false);
      setCity(""); // Clear search box after submission
    }, 500);
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            setLoadingCity(true);
            const response = await axios.get(
              `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${latitude},${longitude}&aqi=no`,
            );
            setTimeout(() => {
              setLoadingCity(false);
              setPlace(response.data.location.name);
            }, 500);
          } catch (error) {
            console.error("Error getting current location weather:", error);
            setLoadingCity(false);
            setError("Could not get current location weather");
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError(
            "Could not access location. Please enable location services.",
          );
        },
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }
  return (
    <>
      <nav className="shadow-sm  sticky top-0 left-0 z-50 bg-white">
        <div className="h-[80px]     w-full    flex   justify-between items-center  max-w-7xl px-3 mx-auto">
          <div className="flex items-center justify-center gap-2  ">
            <h2 className="text-gray-500 text-3xl">Weather</h2>
            <MdWbSunny className="text-3xl mt-1 text-yellow-300" />
          </div>
          {/*  */}
          <section className="flex gap-2 items-center">
            <MdMyLocation
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-2xl  text-gray-400 hover:opacity-80 cursor-pointer"
            />
            <MdOutlineLocationOn className="text-3xl" />
            <p className="text-slate-900/80 text-sm"> {location} </p>
            <div className="relative hidden md:flex">
              {/* SearchBox */}

              <SearchBox
                value={city}
                onSubmit={handleSubmiSearch}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Search for a city..."
              />
              <SuggetionBox
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error,
                  loadingSuggestions,
                }}
              />
            </div>
          </section>
        </div>
      </nav>
      <section className="flex   max-w-7xl px-3 md:hidden ">
        <div className="relative ">
          {/* SearchBox */}

          <SearchBox
            value={city}
            onSubmit={handleSubmiSearch}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search for a city..."
          />
          <SuggetionBox
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionClick,
              error,
              loadingSuggestions,
            }}
          />
        </div>
      </section>
    </>
  );
}

function SuggetionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error,
  loadingSuggestions,
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
  loadingSuggestions: boolean;
}) {
  return (
    <>
      {(showSuggestions || error || loadingSuggestions) && (
        <ul className="mb-4 bg-white absolute border top-[44px] left-0 border-gray-300 rounded-md min-w-[200px] max-h-[200px] overflow-y-auto flex flex-col gap-1 py-2 px-2 shadow-lg z-50">
          {loadingSuggestions && (
            <li className="text-gray-500 p-2 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </div>
            </li>
          )}
          {error && !loadingSuggestions && (
            <li className="text-red-500 p-2 text-sm">{error}</li>
          )}
          {!loadingSuggestions &&
            suggestions.length > 0 &&
            suggestions.map((item, i) => (
              <li
                key={i}
                onClick={() => handleSuggestionClick(item)}
                className="cursor-pointer p-2 rounded hover:bg-gray-200 transition-colors text-sm"
              >
                {item}
              </li>
            ))}
          {!loadingSuggestions &&
            suggestions.length === 0 &&
            !error &&
            showSuggestions && (
              <li className="text-gray-500 p-2 text-sm text-center">
                Type at least 3 characters to search
              </li>
            )}
        </ul>
      )}
    </>
  );
}
