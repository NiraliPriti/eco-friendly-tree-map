"use client";

import { useState } from "react";
import { Leaf, Wind, Activity, Droplets, Download, Map as MapIcon } from "lucide-react";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"metrics" | "planner">("metrics");

  return (
    <div className="flex h-screen w-full bg-slate-900 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[380px] h-full flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl relative z-10 shrink-0">
        {/* Branding */}
        <div className="p-6 border-b border-slate-700/50 flex items-center gap-3">
          <div className="p-2 bg-emerald-400/10 rounded-xl">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent tracking-wide">
            ECO-friendly Tree Map
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex p-4 gap-2 border-b border-slate-700/50">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === "metrics"
                ? "bg-slate-700/60 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Atmospheric Metrics
          </button>
          <button
            onClick={() => setActiveTab("planner")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === "planner"
                ? "bg-slate-700/60 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            Afforestation Planner
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className={`transition-all duration-500 absolute inset-6 ${activeTab === 'metrics' ? 'opacity-100 translate-x-0 pointer-events-auto z-10' : 'opacity-0 -translate-x-4 pointer-events-none z-0'}`}>
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-300 text-sm leading-relaxed text-center italic">
                "Click on the satellite canvas to query regional air quality logs"
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Mock Cards */}
                {[
                  { label: "PM2.5", value: "12.4", unit: "µg/m³", icon: Wind, color: "text-blue-400" },
                  { label: "PM10", value: "34.2", unit: "µg/m³", icon: Wind, color: "text-indigo-400" },
                  { label: "AQI", value: "45", unit: "Good", icon: Activity, color: "text-emerald-400" },
                  { label: "Humidity", value: "62", unit: "%", icon: Droplets, color: "text-cyan-400" },
                ].map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 transition-colors group cursor-default">
                    <div className="flex items-center gap-2 mb-3">
                      <stat.icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-100">{stat.value}</span>
                      <span className="text-xs text-slate-500">{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className={`transition-all duration-500 absolute inset-6 flex flex-col ${activeTab === 'planner' ? 'opacity-100 translate-x-0 pointer-events-auto z-10' : 'opacity-0 translate-x-4 pointer-events-none z-0'}`}>
            <div className="space-y-4 flex-1">
              {[
                { name: "Neem", co2: "22kg/yr", humidity: "Moderate" },
                { name: "Bamboo", co2: "400kg/yr", humidity: "High" },
                { name: "Banana Plant", co2: "15kg/yr", humidity: "High" },
              ].map((tree, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-700/50 bg-slate-800/40 hover:border-emerald-500/30 transition-colors">
                  <h3 className="text-base font-semibold text-emerald-300 mb-3">{tree.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 text-xs font-medium bg-slate-900 border border-slate-700 rounded-md text-slate-300">
                      CO2 Absorption: {tree.co2}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium bg-slate-900 border border-slate-700 rounded-md text-slate-300">
                      Ideal Humidity: {tree.humidity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="mt-6 w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5">
              <Download className="w-4 h-4" />
              Download CSV Data Report
            </button>
          </div>
        </div>
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 relative bg-slate-950 overflow-hidden">
        {/* Placeholder Pattern for Map */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-400 to-transparent blur-sm" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4 text-slate-500/50">
            <MapIcon className="w-24 h-24 mx-auto animate-pulse" />
            <p className="text-lg font-medium tracking-wider uppercase">Mapbox Satellite Map Layer Placeholder</p>
          </div>
        </div>

        {/* Coordinates Card */}
        <div className="absolute bottom-8 right-8 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 shadow-2xl flex items-center gap-6 z-10 hover:border-emerald-500/30 transition-colors">
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Latitude</div>
            <div className="text-sm font-mono text-emerald-400">19.0760&deg; N</div>
          </div>
          <div className="w-px h-8 bg-slate-700/50" />
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Longitude</div>
            <div className="text-sm font-mono text-emerald-400">72.8777&deg; E</div>
          </div>
        </div>
      </main>
    </div>
  );
}
