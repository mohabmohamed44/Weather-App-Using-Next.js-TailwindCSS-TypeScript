/** @format */
"use client";

import React, { useState } from "react";
import axios from "axios";
import Container from "./Container";

/**
 * Component to test and troubleshoot WeatherAPI.com API key issues
 */
export default function APIKeyTester() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  // Get API key from env and mask part of it for display
  const apiKey = process.env.NEXT_WEATHER_API_KEY || "";
  const maskedKey = apiKey
    ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
    : "Not found";

  const testAPIKey = async () => {
    setTesting(true);
    setResult(null);

    try {
      if (!apiKey) {
        throw new Error("API key is not set in environment variables");
      }

      // Make a simple request to test the API key
      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=London&aqi=no`,
      );

      setResult({
        success: true,
        message: "API key is valid!",
        details: `Successfully connected to WeatherAPI.com and retrieved data for ${response.data.location.name}, ${response.data.location.country}`,
      });
    } catch (error: any) {
      console.error("API Key test error:", error);

      let message = "Unknown error occurred";
      let details = "";

      if (error.response) {
        // Server responded with an error status
        if (error.response.status === 401) {
          message = "API key is invalid or unauthorized";
          details =
            "Your API key was rejected by WeatherAPI.com. Please check that you're using the correct key.";
        } else if (error.response.status === 403) {
          message = "API key is valid but access is forbidden";
          details =
            "Your account might have exceeded its daily limit or has been suspended.";
        } else {
          message = `Server error: ${error.response.status}`;
          details =
            error.response.data?.error?.message ||
            JSON.stringify(error.response.data);
        }
      } else if (error.request) {
        // No response received
        message = "No response from WeatherAPI.com";
        details = "Check your internet connection or if the service is down.";
      } else {
        // Error setting up the request
        message = error.message || "Error setting up the request";
      }

      setResult({
        success: false,
        message,
        details,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Container className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        WeatherAPI.com Key Troubleshooter
      </h2>

      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Your API Key:</span>
          <span
            className={`px-3 py-1 rounded ${
              apiKey ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
            }`}
          >
            {maskedKey}
          </span>
        </div>

        {!apiKey && (
          <div className="text-red-600 text-sm mt-2">
            No API key found. Please check your .env.local file.
          </div>
        )}

        <button
          onClick={testAPIKey}
          disabled={testing}
          className={`mt-4 px-4 py-2 rounded-md w-full ${
            testing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {testing ? "Testing..." : "Test API Key"}
        </button>
      </div>

      {result && (
        <div
          className={`p-4 rounded-md mb-6 ${
            result.success
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <h3
            className={`font-bold ${
              result.success ? "text-green-700" : "text-red-700"
            }`}
          >
            {result.message}
          </h3>
          {result.details && <p className="mt-2 text-sm">{result.details}</p>}
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-2">
          Troubleshooting Steps
        </h3>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>
            <strong>Check your .env.local file</strong> - Make sure it contains:
            <pre className="bg-gray-100 p-2 mt-1 rounded">
              NEXT_WEATHER_API_KEY=your_actual_api_key
            </pre>
          </li>
          <li>
            <strong>Verify your API key</strong> - Log into your{" "}
            <a
              href="https://www.weatherapi.com/my/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              WeatherAPI.com account
            </a>{" "}
            and check your API key.
          </li>
          <li>
            <strong>Check account limits</strong> - Free plans have limited
            daily requests.
          </li>
          <li>
            <strong>Restart your dev server</strong> - After updating
            .env.local, restart with{" "}
            <code className="bg-gray-100 px-1">npm run dev</code>
          </li>
          <li>
            <strong>No spaces or quotes</strong> - Ensure your API key does not
            have extra spaces or quotes.
          </li>
        </ol>
      </div>
    </Container>
  );
}
