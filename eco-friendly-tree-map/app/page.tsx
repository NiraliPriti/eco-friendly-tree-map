"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Leaf,
  Wind,
  Activity,
  Droplets,
  Download,
  Map as MapIcon,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sliders,
  TreePine,
  Info
} from "lucide-react";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface TreeItem {
  name: string;
  co2: string;
  humidity: string;
  tolerance: string;
}

interface MetricsData {
  pm25: string;
  pm10: string;
  no2: string;
  so2: string;
  o3: string;
  co: string;
  aqi: string;
  aqiLabel: string;
  humidity: string;
  canopyDeficit: number;
}

type BackendType = "express" | "fastapi" | "demo";

const PRESET_CITIES = [
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "New Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 }
];

const AQI_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Good: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30" },
  Fair: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/30" },
  Moderate: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30" },
  Poor: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30" },
  "Very Poor": { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" }
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"metrics" | "planner">("metrics");
  const [backendType, setBackendType] = useState<BackendType>("express");
  const [backendStatus, setBackendStatus] = useState<"connected" | "disconnected" | "checking">("checking");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mapbox token state (loaded from env, can be adjusted in UI)
  const envMapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const [mapboxToken, setMapboxToken] = useState<string>(envMapboxToken);
  const [showTokenModal, setShowTokenModal] = useState(false);

  // View state & Coordinates
  const [viewState, setViewState] = useState({
    longitude: 72.8777,
    latitude: 19.076,
    zoom: 10
  });

  const [selectedCoords, setSelectedCoords] = useState({
    latitude: 19.076,
    longitude: 72.8777
  });

  const [locationName, setLocationName] = useState("Mumbai Metropolitan, IN");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [dataSource, setDataSource] = useState("OpenWeatherMap Air Pollution API");

  // Metrics and Planner state
  const [metrics, setMetrics] = useState<MetricsData>({
    pm25: "158.2",
    pm10: "175.6",
    no2: "1.2",
    so2: "10.3",
    o3: "170.6",
    co: "533.9",
    aqi: "5",
    aqiLabel: "Very Poor",
    humidity: "51",
    canopyDeficit: 80
  });

  const [recommendedCount, setRecommendedCount] = useState(70);
  const [trees, setTrees] = useState<TreeItem[]>([
    { name: "Neem", co2: "22kg/yr", humidity: "Moderate", tolerance: "Very High" },
    { name: "Banyan", co2: "25kg/yr", humidity: "Moderate", tolerance: "Very High" }
  ]);

  // Backend URLs
  const expressUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://127.0.0.1:8000";

  const getActiveBackendUrl = useCallback(() => {
    if (backendType === "fastapi") return fastApiUrl;
    return expressUrl;
  }, [backendType, fastApiUrl, expressUrl]);

  // Check backend health
  const checkHealth = useCallback(async () => {
    if (backendType === "demo") {
      setBackendStatus("connected");
      return;
    }
    const targetUrl = getActiveBackendUrl();
    try {
      const res = await fetch(`${targetUrl}/api/health`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        setBackendStatus("connected");
        setErrorMessage(null);
      } else {
        setBackendStatus("disconnected");
      }
    } catch {
      setBackendStatus("disconnected");
    }
  }, [backendType, getActiveBackendUrl]);

  // Fetch data from selected backend or generate demo fallback
  const fetchPollutionData = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true);
      setErrorMessage(null);

      // If demo mode is active
      if (backendType === "demo") {
        const randAqi = Math.floor(Math.random() * 5) + 1;
        const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
        const deficit = 10 + (randAqi - 1) * 17.5;
        const count = 10 + (randAqi - 1) * 15;

        setMetrics({
          pm25: (Math.random() * 60 + 10).toFixed(1),
          pm10: (Math.random() * 120 + 20).toFixed(1),
          no2: (Math.random() * 25 + 5).toFixed(1),
          so2: (Math.random() * 15 + 2).toFixed(1),
          o3: (Math.random() * 80 + 30).toFixed(1),
          co: (Math.random() * 400 + 200).toFixed(1),
          aqi: randAqi.toString(),
          aqiLabel: labels[randAqi - 1] || "Moderate",
          humidity: Math.floor(Math.random() * 30 + 45).toString(),
          canopyDeficit: Math.round(deficit)
        });

        setRecommendedCount(count);
        if (randAqi >= 4) {
          setTrees([
            { name: "Neem", co2: "22kg/yr", humidity: "Moderate", tolerance: "Very High" },
            { name: "Banyan", co2: "25kg/yr", humidity: "Moderate", tolerance: "Very High" }
          ]);
        } else {
          setTrees([
            { name: "Neem", co2: "22kg/yr", humidity: "Moderate", tolerance: "Very High" },
            { name: "Bamboo", co2: "400kg/yr", humidity: "High", tolerance: "High" },
            { name: "Banana Plant", co2: "15kg/yr", humidity: "High", tolerance: "Fair" }
          ]);
        }
        setLocationName(`${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
        setDataSource("Simulated Demo Engine");
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
        setIsLoading(false);
        return;
      }

      // Live Backend API call
      const targetUrl = getActiveBackendUrl();
      try {
        const res = await fetch(`${targetUrl}/api/pollution?lat=${lat}&lng=${lng}`, {
          signal: AbortSignal.timeout(8000)
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || errorData.detail || `Server returned HTTP ${res.status}`);
        }

        const data = await res.json();
        setBackendStatus("connected");

        setMetrics({
          pm25: data.pm2_5 !== undefined ? String(data.pm2_5) : "0",
          pm10: data.pm10 !== undefined ? String(data.pm10) : "0",
          no2: data.no2 !== undefined ? String(data.no2) : "0",
          so2: data.so2 !== undefined ? String(data.so2) : "0",
          o3: data.o3 !== undefined ? String(data.o3) : "0",
          co: data.co !== undefined ? String(data.co) : "0",
          aqi: String(data.aqi || 1),
          aqiLabel: data.aqi_label || "Moderate",
          humidity: String(data.humidity ?? 60),
          canopyDeficit: data.canopyDeficitPercentage ?? 50
        });

        setRecommendedCount(data.recommended_tree_count || 10);

        if (Array.isArray(data.recommended_species)) {
          setTrees(
            data.recommended_species.map((sp: { name: string; co2?: string; co2_absorption?: string; humidity?: string; ideal_humidity?: string; tolerance?: string }) => ({
              name: sp.name,
              co2: sp.co2 || sp.co2_absorption || "20kg/yr",
              humidity: sp.humidity || sp.ideal_humidity || "Moderate",
              tolerance: sp.tolerance || "High"
            }))
          );
        }

        setLocationName(data.location_name || `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
        setDataSource(data.source || `${backendType === "express" ? "Express (5000)" : "FastAPI (8000)"} + OpenWeatherMap`);
        setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to connect to backend";
        console.error("API error:", message);
        setBackendStatus("disconnected");
        setErrorMessage(
          `Could not reach ${backendType === "express" ? "Express on port 5000" : "FastAPI on port 8000"}. Make sure the server is started or switch to Demo mode.`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [backendType, getActiveBackendUrl]
  );

  // Initial load
  useEffect(() => {
    let active = true;
    const initialize = async () => {
      await checkHealth();
      if (active) {
        await fetchPollutionData(selectedCoords.latitude, selectedCoords.longitude);
      }
    };
    initialize();
    return () => {
      active = false;
    };
  }, [backendType, checkHealth, fetchPollutionData, selectedCoords.latitude, selectedCoords.longitude]);

  // Handle map click
  const handleMapClick = (e: { lngLat: { lng: number; lat: number } }) => {
    const { lng, lat } = e.lngLat;
    setSelectedCoords({ latitude: lat, longitude: lng });
    setViewState(prev => ({ ...prev, latitude: lat, longitude: lng }));
    fetchPollutionData(lat, lng);
  };

  // Preset city selection
  const handleCitySelect = (city: typeof PRESET_CITIES[0]) => {
    setSelectedCoords({ latitude: city.lat, longitude: city.lng });
    setViewState(prev => ({ ...prev, latitude: city.lat, longitude: city.lng, zoom: 10 }));
    fetchPollutionData(city.lat, city.lng);
  };

  // CSV Report Generator
  const handleDownloadReport = () => {
    const reportDate = new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const reportTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    const csvRows = [
      ["ECO-FRIENDLY TREE MAP with SmartCity Simulation — AFFORESTATION REPORT"],
      ["Generated On", `${reportDate} at ${reportTime}`],
      ["Backend Service", backendType.toUpperCase()],
      ["Data Source", dataSource],
      ["Location", `"${locationName}"`],
      ["Latitude", `${selectedCoords.latitude.toFixed(4)} N`],
      ["Longitude", `${selectedCoords.longitude.toFixed(4)} E`],
      [],
      ["--- ATMOSPHERIC METRICS ---"],
      ["Metric", "Value", "Unit"],
      ["Air Quality Index (AQI)", metrics.aqi, metrics.aqiLabel],
      ["PM2.5 Concentration", metrics.pm25, "ug/m3"],
      ["PM10 Concentration", metrics.pm10, "ug/m3"],
      ["Nitrogen Dioxide (NO2)", metrics.no2, "ug/m3"],
      ["Sulfur Dioxide (SO2)", metrics.so2, "ug/m3"],
      ["Ozone (O3)", metrics.o3, "ug/m3"],
      ["Carbon Monoxide (CO)", metrics.co, "ug/m3"],
      ["Relative Humidity", metrics.humidity, "%"],
      ["Canopy Deficit", `${metrics.canopyDeficit}%`],
      [],
      ["--- AFFORESTATION PLAN ---"],
      ["Recommended Tree Count", recommendedCount, "trees"],
      [],
      ["--- RECOMMENDED TREE SPECIES ---"],
      ["Species Name", "CO2 Absorption", "Ideal Humidity", "AQI Tolerance"],
      ...trees.map(t => [t.name, t.co2, t.humidity, t.tolerance]),
      [],
      ["--- RECOMMENDATIONS ---"],
      ["1. Plant recommended species in clusters for maximum ecological absorption."],
      ["2. Prioritize high-tolerance trees in high AQI zones."],
      ["3. Maintain soil moisture suitable for selected local species."]
    ];

    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const cleanLocation = locationName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    link.setAttribute("download", `eco-tree-report-${cleanLocation}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const hasValidMapboxToken = Boolean(mapboxToken && mapboxToken.trim().startsWith("pk."));
  const aqiStyle = AQI_COLORS[metrics.aqiLabel] || AQI_COLORS["Moderate"];

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[410px] h-full flex flex-col bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800 shadow-2xl relative z-10 shrink-0">
        {/* Header / Branding */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-xl border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Leaf className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent tracking-wide">
                ECO Tree Map
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Smart Atmospheric & Afforestation AI</p>
            </div>
          </div>
          <button
            onClick={() => setShowTokenModal(!showTokenModal)}
            title="Configure Mapbox & API settings"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

        {/* Backend Selector Banner */}
        <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-medium">Backend:</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setBackendType("express")}
              className={`px-2 py-1 rounded font-medium transition-all ${
                backendType === "express"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Express (5000)
            </button>
            <button
              onClick={() => setBackendType("fastapi")}
              className={`px-2 py-1 rounded font-medium transition-all ${
                backendType === "fastapi"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              FastAPI (8000)
            </button>
            <button
              onClick={() => setBackendType("demo")}
              className={`px-2 py-1 rounded font-medium transition-all ${
                backendType === "demo"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Demo
            </button>
          </div>

          {/* Status Dot */}
          <div className="flex items-center gap-1" title={`Status: ${backendStatus}`}>
            {backendStatus === "connected" && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
            {backendStatus === "disconnected" && <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />}
            {backendStatus === "checking" && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            <button onClick={checkHealth} title="Re-check backend health">
              <RefreshCw className={`w-3 h-3 text-slate-500 hover:text-slate-300 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Backend Error Banner */}
        {errorMessage && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Backend Offline</p>
              <p className="text-rose-200/80 leading-relaxed mb-2">{errorMessage}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setBackendType("demo")}
                  className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 font-semibold text-rose-200 border border-rose-500/30"
                >
                  Switch to Demo Mode
                </button>
                <button
                  onClick={() => fetchPollutionData(selectedCoords.latitude, selectedCoords.longitude)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 border border-slate-700"
                >
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings / Token Config Drawer */}
        {showTokenModal && (
          <div className="mx-4 mt-3 p-4 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Mapbox Token Settings</span>
              <button onClick={() => setShowTokenModal(false)} className="text-slate-400 hover:text-slate-200">
                &times;
              </button>
            </div>
            <p className="text-slate-300">
              Paste your Mapbox access token below to activate live satellite tiles (or add to <code className="text-emerald-400">.env.local</code>):
            </p>
            <input
              type="text"
              value={mapboxToken}
              onChange={e => setMapboxToken(e.target.value)}
              placeholder="pk.eyJ1Ijo..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTokenModal(false)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
              >
                Apply Token
              </button>
            </div>
          </div>
        )}

        {/* Location & Quick Presets Card */}
        <div className="mx-4 mt-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Target</span>
            </div>
            {isLoading && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-spin" /> Querying...
              </span>
            )}
          </div>

          <div className="text-sm text-slate-100 font-semibold truncate">{locationName}</div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {PRESET_CITIES.map(city => (
              <button
                key={city.name}
                onClick={() => handleCitySelect(city)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  locationName.includes(city.name)
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 border border-slate-800"
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-3 pb-2 gap-2 border-b border-slate-800">
          <button
            id="tab-metrics"
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "metrics"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Atmospheric Metrics
          </button>
          <button
            id="tab-planner"
            onClick={() => setActiveTab("planner")}
            className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === "planner"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <TreePine className="w-3.5 h-3.5" /> Afforestation Planner
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 relative space-y-4">
          {activeTab === "metrics" ? (
            <div className="space-y-4">
              {/* AQI Overview Banner */}
              <div className={`p-4 rounded-xl border ${aqiStyle.border} ${aqiStyle.bg} flex items-center justify-between`}>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Air Quality Index</div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-black ${aqiStyle.text}`}>{metrics.aqi}</span>
                    <span className={`text-sm font-bold ${aqiStyle.text}`}>Level {metrics.aqi} &bull; {metrics.aqiLabel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Canopy Deficit</span>
                  <span className="text-2xl font-bold text-slate-200">{metrics.canopyDeficit}%</span>
                </div>
              </div>

              {/* Canopy Deficit Progress Bar */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Canopy Cover Deficit</span>
                  <span className="font-bold text-teal-300">{metrics.canopyDeficit}% required</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${metrics.canopyDeficit}%` }}
                  />
                </div>
              </div>

              {/* Grid of 4 Key Atmospheric Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "PM2.5", value: metrics.pm25, unit: "µg/m³", icon: Wind, color: "text-blue-400" },
                  { label: "PM10", value: metrics.pm10, unit: "µg/m³", icon: Wind, color: "text-indigo-400" },
                  { label: "Humidity", value: metrics.humidity, unit: "%", icon: Droplets, color: "text-cyan-400" },
                  { label: "Nitrogen (NO₂)", value: metrics.no2, unit: "µg/m³", icon: Activity, color: "text-purple-400" },
                  { label: "Sulfur (SO₂)", value: metrics.so2, unit: "µg/m³", icon: Activity, color: "text-amber-400" },
                  { label: "Ozone (O₃)", value: metrics.o3, unit: "µg/m³", icon: Activity, color: "text-emerald-400" }
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-850 transition-colors"
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-slate-100">{stat.value}</span>
                      <span className="text-[10px] text-slate-500">{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Provenance Card */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-2">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Telemetry Audit</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Engine:</span>
                  <span className="text-slate-200 font-medium">{dataSource}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Last Sync:</span>
                  <span className="text-slate-200 font-medium">{lastUpdated || "Live"}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Coordinates:</span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    {selectedCoords.latitude.toFixed(4)}° N, {selectedCoords.longitude.toFixed(4)}° E
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 flex flex-col h-full">
              {/* Recommended Tree Count Banner */}
              <div className="p-4 rounded-xl border border-teal-500/30 bg-teal-500/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">
                    🌱 Recommended Planting
                  </div>
                  <div className="text-slate-400 text-xs">Calculated based on AQI & canopy deficit</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-teal-300">{recommendedCount}</div>
                  <div className="text-xs text-slate-400">trees recommended</div>
                </div>
              </div>

              {/* Tree Species Recommendations */}
              <div className="space-y-3 flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recommended Species for This Climate & AQI
                </div>
                {trees.map((tree, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/40 transition-colors space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-emerald-300">{tree.name}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded">
                        {tree.tolerance} Tolerance
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        CO₂ Absorption: <strong className="text-teal-300">{tree.co2}</strong>
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        Ideal Humidity: <strong className="text-slate-200">{tree.humidity}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Download CSV Report Button */}
              <button
                id="btn-download-report"
                onClick={handleDownloadReport}
                className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download CSV Afforestation Report
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col">
        {/* If Mapbox Token is present, render Mapbox GL */}
        {hasValidMapboxToken ? (
          <div className="w-full h-full relative">
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              onClick={handleMapClick}
              mapStyle="mapbox://styles/mapbox/dark-v11"
              mapboxAccessToken={mapboxToken}
              style={{ width: "100%", height: "100%" }}
              cursor="crosshair"
            >
              <Marker latitude={selectedCoords.latitude} longitude={selectedCoords.longitude} anchor="bottom">
                <div className="flex flex-col items-center group cursor-pointer">
                  <div className="p-2 bg-emerald-500 text-slate-950 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.8)] border-2 border-white animate-bounce">
                    <TreePine className="w-5 h-5" />
                  </div>
                  <div className="px-2 py-1 bg-slate-900/90 text-[10px] font-bold text-emerald-300 rounded border border-emerald-500/40 shadow mt-1">
                    {locationName}
                  </div>
                </div>
              </Marker>
            </Map>
          </div>
        ) : (
          /* Interactive Fallback Map Canvas (when Mapbox token is not configured) */
          <div
            className="w-full h-full relative cursor-crosshair select-none"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              // Map canvas click to coordinates (centered around current viewState)
              const latOffset = ((rect.height / 2 - y) / rect.height) * 1.5;
              const lngOffset = ((x - rect.width / 2) / rect.width) * 2.5;
              const newLat = Number((viewState.latitude + latOffset).toFixed(4));
              const newLng = Number((viewState.longitude + lngOffset).toFixed(4));
              setSelectedCoords({ latitude: newLat, longitude: newLng });
              fetchPollutionData(newLat, newLng);
            }}
          >
            {/* Satellite Background Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src="/static-map-bg.jpg"
                alt="Satellite imagery canvas"
                fill
                priority
                className="object-cover opacity-40 filter saturate-150 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-transparent to-slate-950/90 pointer-events-none" />
              {/* Radar Grid Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:36px_36px] pointer-events-none" />
            </div>

            {/* Missing Token Guidance Badge */}
            <div className="absolute top-5 left-5 z-20 max-w-md p-3.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 shadow-2xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive Geo-Afforestation Canvas Active</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Click anywhere on the map grid or pick preset cities to query live atmospheric metrics.
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
                <span>Want official 3D Mapbox satellite tiles?</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowTokenModal(true);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold underline ml-2"
                >
                  Enter Token
                </button>
              </div>
            </div>

            {/* Clicked Coordinate Pin Marker */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="relative flex flex-col items-center">
                {/* Glowing Radar Pulse Rings */}
                <div className="absolute w-28 h-28 -top-6 rounded-full border border-emerald-400/40 animate-ping pointer-events-none" />
                <div className="absolute w-48 h-48 -top-16 rounded-full border border-teal-500/20 animate-pulse pointer-events-none" />

                {/* Center Pin Icon */}
                <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.9)] border-2 border-white">
                  <TreePine className="w-6 h-6 animate-pulse" />
                </div>

                {/* Pin Tooltip */}
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900/95 backdrop-blur-md border border-emerald-500/40 shadow-xl text-center">
                  <div className="text-xs font-bold text-emerald-300">{locationName}</div>
                  <div className="text-[10px] font-mono text-slate-400">
                    {selectedCoords.latitude.toFixed(4)}° N, {selectedCoords.longitude.toFixed(4)}° E
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top-Right Satellite Status Badge */}
        <div className="absolute top-5 right-5 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-emerald-500/30 shadow-lg pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
            {hasValidMapboxToken ? "Mapbox Satellite 3D" : "Geo Satellite Canvas"}
          </span>
        </div>

        {/* Bottom Coordinates HUD */}
        <div className="absolute bottom-6 right-6 p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-2xl flex items-center gap-6 z-20 pointer-events-none">
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Latitude</div>
            <div className="text-sm font-mono text-emerald-400 font-bold">{selectedCoords.latitude.toFixed(4)}° N</div>
          </div>
          <div className="w-px h-7 bg-slate-700/60" />
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Longitude</div>
            <div className="text-sm font-mono text-emerald-400 font-bold">{selectedCoords.longitude.toFixed(4)}° E</div>
          </div>
          <div className="w-px h-7 bg-slate-700/60" />
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">AQI Level</div>
            <div className={`text-sm font-bold ${aqiStyle.text}`}>{metrics.aqi} &bull; {metrics.aqiLabel}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
