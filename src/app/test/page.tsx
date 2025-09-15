/** @format */
"use client";

import React from "react";
import WeatherAPITest from "@/components/WeatherAPITest";

export default function TestPage() {
  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">WeatherAPI.com Test Page</h1>
        <p className="mb-4 text-gray-600">
          This page tests the integration with the WeatherAPI.com service. Make sure your API key is properly set in the .env.local file.
        </p>
        <WeatherAPITest />
      </div>
    </div>
  );
}
