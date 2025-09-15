/** @format */
"use client";
// 7-day forecast test page

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function APITestPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState<string>("");
  const [maskedKey, setMaskedKey] = useState<string>("Not found");
  const [testLocation, setTestLocation] = useState<string>("London");
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFullKey, setShowFullKey] = useState<boolean>(false);

  useEffect(() => {
    // Get the API key from environment variable
    const key = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";
    setApiKey(key);

    // Create a masked version for display
    if (key) {
      setMaskedKey(
        showFullKey
          ? key
          : `${key.substring(0, 4)}...${key.substring(key.length - 4)}`,
      );
    } else {
      setMaskedKey("Not found");
    }
  }, [showFullKey]);

  const testAPIKey = async () => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    try {
      if (!apiKey) {
        throw new Error("API key is not set in environment variables");
      }

      // Make a request to test the API key with 7-day forecast
      const response = await axios.get(
        `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${testLocation}&days=3&aqi=no&alerts=no`,
      );

      setTestResult(response.data);
    } catch (err: any) {
      console.error("API test error:", err);

      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (err.response.status === 401) {
          setError("401 Unauthorized: Your API key is invalid or missing");
        } else if (err.response.status === 403) {
          setError(
            "403 Forbidden: Your account may have exceeded its request limit",
          );
        } else {
          setError(
            `Error ${err.response.status}: ${JSON.stringify(err.response.data)}`,
          );
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError(
          "No response received from the server. Check your internet connection.",
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Error: ${err.message}`);
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">
          WeatherAPI.com Key Troubleshooter
        </h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Your API Key</h2>
          <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-md">
            <div className="flex-1">
              <span className="font-medium">Current API Key: </span>
              <code
                className={`px-2 py-1 rounded ${apiKey ? "bg-blue-100" : "bg-red-100"}`}
              >
                {maskedKey}
              </code>
            </div>
            <button
              onClick={() => setShowFullKey(!showFullKey)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showFullKey ? "Hide" : "Show"}
            </button>
          </div>

          {!apiKey && (
            <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-md">
              <p className="font-semibold">No API key found!</p>
              <p className="text-sm mt-1">
                You need to set up your API key in the .env.local file.
              </p>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Test Your API Key</h2>
          <div className="flex items-end gap-3 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Location
              </label>
              <input
                type="text"
                value={testLocation}
                onChange={(e) => setTestLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter city name"
              />
            </div>
            <button
              onClick={testAPIKey}
              disabled={testing || !apiKey}
              className={`px-4 py-2 rounded-md ${
                testing || !apiKey
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {testing ? "Testing..." : "Test Connection"}
            </button>
          </div>

          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-bold text-red-700 mb-1">Error</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {testResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-bold text-green-700 mb-2">
                Success! API is working
              </h3>
              <div className="text-sm">
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {testResult.location.name}, {testResult.location.country}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Current temperature:</span>{" "}
                  {testResult.current.temp_c}°C
                </p>
                <p className="mt-1">
                  <span className="font-medium">Condition:</span>{" "}
                  {testResult.current.condition.text}
                </p>
                <p className="mt-1">
                  <span className="font-medium">Forecast days:</span>{" "}
                  {testResult.forecast?.forecastday?.length || 0} days
                </p>
                {testResult.forecast?.forecastday && (
                  <div className="mt-2">
                    <span className="font-medium">Days:</span>{" "}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {testResult.forecast.forecastday.map(
                        (day: any, index: number) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 px-2 py-1 rounded"
                          >
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}{" "}
                            ({day.day.avgtemp_c}°C)
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">
            How to Fix API Key Issues
          </h2>
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <strong>Create or update your .env.local file</strong>
              <p className="text-sm mt-1">
                Create a file named .env.local in the root of your project with
                the following content:
              </p>
              <pre className="bg-gray-100 p-3 mt-1 rounded-md text-sm">
                NEXT_PUBLIC_WEATHER_API_KEY=your_api_key_here
              </pre>
              <p className="text-sm mt-1">
                Replace `your_api_key_here` with your actual WeatherAPI.com API
                key.
              </p>
            </li>
            <li>
              <strong>Check your WeatherAPI.com account</strong>
              <p className="text-sm mt-1">
                Make sure your account is active and your API key is valid. You
                can check this on the{" "}
                <a
                  href="https://www.weatherapi.com/my/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  WeatherAPI.com dashboard
                </a>
                .
              </p>
            </li>
            <li>
              <strong>Restart your development server</strong>
              <p className="text-sm mt-1">
                After updating your .env.local file, restart your Next.js
                development server:
              </p>
              <pre className="bg-gray-100 p-2 mt-1 rounded-md text-sm">
                npm run dev
              </pre>
            </li>
            <li>
              <strong>Check for request limits</strong>
              <p className="text-sm mt-1">
                Free plans have a limited number of API calls per day or month.
                Check if you have exceeded your limit.
              </p>
            </li>
          </ol>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Back to Home
          </button>
          {testResult && (
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              View Full 3-Day Weather Forecast
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
