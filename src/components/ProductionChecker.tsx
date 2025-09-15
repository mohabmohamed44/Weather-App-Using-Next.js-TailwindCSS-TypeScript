/** @format */
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface ProductionStatus {
  envVariable: boolean;
  apiKeyLength: number;
  httpsEndpoint: boolean;
  apiConnection: boolean;
  forecastData: boolean;
  searchFunction: boolean;
}

interface ApiTestResult {
  status: "loading" | "success" | "error";
  message: string;
  data?: any;
}

export default function ProductionChecker() {
  const [status, setStatus] = useState<ProductionStatus>({
    envVariable: false,
    apiKeyLength: 0,
    httpsEndpoint: false,
    apiConnection: false,
    forecastData: false,
    searchFunction: false,
  });

  const [apiTest, setApiTest] = useState<ApiTestResult>({
    status: "loading",
    message: "Checking...",
  });

  const [isVisible, setIsVisible] = useState(true);
  const [detailedView, setDetailedView] = useState(false);

  useEffect(() => {
    runProductionChecks();
  }, []);

  const runProductionChecks = async () => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";

    // Check environment variable
    const envVariable = !!apiKey;
    const apiKeyLength = apiKey.length;

    setStatus(prev => ({
      ...prev,
      envVariable,
      apiKeyLength,
      httpsEndpoint: true, // We're using HTTPS endpoints
    }));

    if (!apiKey) {
      setApiTest({
        status: "error",
        message: "❌ API key not found in environment variables",
      });
      return;
    }

    // Test API connection
    try {
      setApiTest({
        status: "loading",
        message: "🔄 Testing API connection...",
      });

      const response = await axios.get(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=London&aqi=no`
      );

      if (response.data) {
        setStatus(prev => ({ ...prev, apiConnection: true }));

        // Test forecast data
        try {
          const forecastResponse = await axios.get(
            `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=London&days=7&aqi=no&alerts=no`
          );

          const forecastDays = forecastResponse.data?.forecast?.forecastday?.length || 0;

          setStatus(prev => ({
            ...prev,
            forecastData: forecastDays === 7,
          }));

          // Test search function
          try {
            const searchResponse = await axios.get(
              `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=New York`
            );

            setStatus(prev => ({
              ...prev,
              searchFunction: searchResponse.data?.length > 0,
            }));

            setApiTest({
              status: "success",
              message: `✅ All systems operational! Retrieved ${forecastDays} days of forecast data.`,
              data: {
                location: response.data.location,
                temperature: response.data.current.temp_c,
                condition: response.data.current.condition.text,
                forecastDays,
                searchResults: searchResponse.data?.length || 0,
              },
            });
          } catch (searchError) {
            setStatus(prev => ({ ...prev, searchFunction: false }));
            setApiTest({
              status: "error",
              message: "❌ Search function failed",
            });
          }
        } catch (forecastError) {
          setStatus(prev => ({ ...prev, forecastData: false }));
          setApiTest({
            status: "error",
            message: "❌ 7-day forecast request failed",
          });
        }
      }
    } catch (error: any) {
      console.error("Production check error:", error);

      let errorMessage = "❌ API connection failed";

      if (error.response?.status === 401) {
        errorMessage = "❌ Invalid API key (401 Unauthorized)";
      } else if (error.response?.status === 403) {
        errorMessage = "❌ API key forbidden or rate limited (403)";
      } else if (error.code === "ERR_NETWORK") {
        errorMessage = "❌ Network error - Check HTTPS endpoints";
      } else {
        errorMessage = `❌ API Error: ${error.response?.status || error.message}`;
      }

      setApiTest({
        status: "error",
        message: errorMessage,
        data: error.response?.data,
      });
    }
  };

  if (!isVisible) return null;

  const allChecksPass = Object.values(status).every(check => check === true || typeof check === 'number');
  const checkCount = Object.values(status).filter(check => check === true).length;
  const totalChecks = Object.keys(status).filter(key => key !== 'apiKeyLength').length;

  return (
    <div className="fixed top-4 left-4 bg-white border rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm">
          🔍 Production Status
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-xs"
        >
          ✕
        </button>
      </div>

      {/* Overall Status */}
      <div className={`p-2 rounded mb-3 text-sm ${
        allChecksPass ? 'bg-green-50 text-green-700' :
        apiTest.status === 'loading' ? 'bg-yellow-50 text-yellow-700' :
        'bg-red-50 text-red-700'
      }`}>
        {apiTest.status === 'loading' ? '🔄' :
         allChecksPass ? '✅' : '❌'} {apiTest.message}
      </div>

      {/* Quick Status Summary */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">
          System Checks ({checkCount}/{totalChecks})
        </div>
        <div className="flex flex-wrap gap-1">
          <span className={`px-2 py-1 rounded text-xs ${status.envVariable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            ENV
          </span>
          <span className={`px-2 py-1 rounded text-xs ${status.httpsEndpoint ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            HTTPS
          </span>
          <span className={`px-2 py-1 rounded text-xs ${status.apiConnection ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            API
          </span>
          <span className={`px-2 py-1 rounded text-xs ${status.forecastData ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            7-DAY
          </span>
          <span className={`px-2 py-1 rounded text-xs ${status.searchFunction ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            SEARCH
          </span>
        </div>
      </div>

      {/* Detailed View Toggle */}
      <button
        onClick={() => setDetailedView(!detailedView)}
        className="text-xs text-blue-600 hover:text-blue-800 mb-2"
      >
        {detailedView ? 'Hide Details' : 'Show Details'}
      </button>

      {/* Detailed Information */}
      {detailedView && (
        <div className="space-y-2 text-xs">
          <div className="border-t pt-2">
            <div className="grid grid-cols-2 gap-1">
              <div>API Key Length:</div>
              <div className={status.apiKeyLength > 0 ? 'text-green-600' : 'text-red-600'}>
                {status.apiKeyLength} chars
              </div>

              <div>Environment:</div>
              <div className="text-gray-600">
                {process.env.NODE_ENV || 'unknown'}
              </div>

              {apiTest.data && (
                <>
                  <div>Location:</div>
                  <div className="text-gray-600">
                    {apiTest.data.location?.name}
                  </div>

                  <div>Temperature:</div>
                  <div className="text-gray-600">
                    {apiTest.data.temperature}°C
                  </div>

                  <div>Forecast Days:</div>
                  <div className="text-gray-600">
                    {apiTest.data.forecastDays}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Current URL */}
          <div className="border-t pt-2">
            <div className="text-gray-500">Current URL:</div>
            <div className="text-gray-600 break-all">
              {typeof window !== 'undefined' ? window.location.href : 'SSR'}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={runProductionChecks}
          className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Recheck
        </button>
        {!allChecksPass && (
          <button
            onClick={() => window.open('/api-test', '_blank')}
            className="flex-1 px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
          >
            Debug
          </button>
        )}
      </div>

      {/* Quick Fix Links */}
      {!status.envVariable && (
        <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 text-xs rounded">
          <div className="font-semibold">Quick Fix:</div>
          <div>Add environment variable in Vercel:</div>
          <code className="bg-yellow-100 px-1 rounded">
            NEXT_PUBLIC_WEATHER_API_KEY
          </code>
        </div>
      )}
    </div>
  );
}
