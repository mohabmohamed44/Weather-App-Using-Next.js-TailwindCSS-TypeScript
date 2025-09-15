/** @format */
"use client";

import React, { useState, useEffect } from "react";

export default function DebugInfo() {
  const [envInfo, setEnvInfo] = useState<{
    hasApiKey: boolean;
    keyLength: number;
    maskedKey: string;
    allEnvKeys: string[];
  }>({
    hasApiKey: false,
    keyLength: 0,
    maskedKey: "Not found",
    allEnvKeys: [],
  });

  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // Check environment variables
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY || "";

    // Get all environment variables starting with NEXT_
    const allEnvKeys = Object.keys(process.env).filter((key) =>
      key.startsWith("NEXT_"),
    );

    setEnvInfo({
      hasApiKey: !!apiKey,
      keyLength: apiKey.length,
      maskedKey: apiKey
        ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`
        : "Not found",
      allEnvKeys,
    });
  }, []);

  const testApiKey = async () => {
    const apiKey = process.env.NEXT_PUBLIC_WEATHER_API_KEY;

    if (!apiKey) {
      setTestResult("❌ No API key found in environment variables");
      return;
    }

    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=London&aqi=no`,
      );

      if (response.ok) {
        const data = await response.json();
        setTestResult(
          `✅ API working! Temperature in ${data.location.name}: ${data.current.temp_c}°C`,
        );
      } else {
        const errorData = await response.json();
        setTestResult(
          `❌ API Error ${response.status}: ${JSON.stringify(errorData)}`,
        );
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error}`);
    }
  };

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <h3 className="font-bold mb-3 text-sm">🔧 Debug Info</h3>

      <div className="space-y-2 text-xs">
        <div>
          <strong>API Key Status:</strong>{" "}
          {envInfo.hasApiKey ? "✅ Found" : "❌ Missing"}
        </div>

        <div>
          <strong>Key Length:</strong> {envInfo.keyLength} characters
        </div>

        <div>
          <strong>Masked Key:</strong>
          <code className="bg-gray-100 px-1 rounded ml-1">
            {envInfo.maskedKey}
          </code>
        </div>

        <div>
          <strong>Environment Variables:</strong>
          <div className="bg-gray-100 p-1 rounded mt-1 max-h-20 overflow-y-auto">
            {envInfo.allEnvKeys.map((key) => (
              <div key={key} className="text-xs">
                {key}: {process.env[key] ? "✅" : "❌"}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={testApiKey}
        className="mt-3 w-full px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
      >
        Test API Key
      </button>

      {testResult && (
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs break-words">
          {testResult}
        </div>
      )}

      <div className="mt-2 text-xs text-gray-500">
        Current URL:{" "}
        {typeof window !== "undefined" ? window.location.href : "SSR"}
      </div>
    </div>
  );
}
