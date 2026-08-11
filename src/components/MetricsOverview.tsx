import React from 'react';
import { Thermometer, Wind, Gauge, Droplets, Compass, Cloud, Sun, ShieldAlert, Zap } from 'lucide-react';
import { WeatherData } from '../types';

interface MetricsOverviewProps {
  weather: WeatherData;
  onOpenAiReport: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ weather, onOpenAiReport }) => {
  // Determine CAPE level severity (Convective Available Potential Energy)
  let capeBadge = { label: 'Baixa Instabilidade', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' };
  if (weather.capeIndex > 2500) {
    capeBadge = { label: 'Instabilidade Extrema (Tornado EF3+)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' };
  } else if (weather.capeIndex > 1500) {
    capeBadge = { label: 'Alta Instabilidade (Supercélula)', color: 'bg-red-500/20 text-red-400 border-red-500/40' };
  } else if (weather.capeIndex > 800) {
    capeBadge = { label: 'Instabilidade Moderada', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
  }

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl">
      
      {/* Header with region info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-cyan-400 font-semibold">
            Condição Atmosférica Atual
          </span>
          <h2 className="text-xl font-bold text-slate-100 font-mono-tech truncate">
            {weather.regionName}
          </h2>
          <p className="text-xs text-slate-400 font-mono">{weather.stateCountry}</p>
        </div>

        <div className="text-right">
          <div className="text-3xl font-extrabold text-slate-100 font-mono-tech">
            {weather.temperatureC}°<span className="text-sm font-normal text-slate-400">C</span>
          </div>
          <span className="text-xs text-slate-400">Sensação: {weather.feelsLikeC}°C ({weather.temperatureF}°F)</span>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        
        {/* CAPE Index Card */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-medium">Índice CAPE</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {weather.capeIndex} <span className="text-xs text-slate-400 font-normal">J/kg</span>
          </div>
          <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border mt-1 truncate ${capeBadge.color}`}>
            {capeBadge.label}
          </span>
        </div>

        {/* Wind Speed & Direction */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-medium">Vento & Cisalhamento</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {weather.windSpeedKmH} <span className="text-xs text-slate-400 font-normal">km/h</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-1">
            <Compass className="w-3 h-3 text-cyan-400" style={{ transform: `rotate(${weather.windDirectionDeg}deg)` }} />
            <span>Direção {weather.windDirectionDeg}°</span>
          </div>
        </div>

        {/* Pressure */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-medium">Pressão Superfície</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {weather.pressureHpa} <span className="text-xs text-slate-400 font-normal">hPa</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1">
            {weather.pressureHpa < 1005 ? '⚠️ Queda de Pressão Rápida' : 'Pressão Estável'}
          </span>
        </div>

        {/* Dew Point & Humidity */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-mono font-medium">Umidade / Ponto Orvalho</span>
            <Droplets className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-slate-100 font-mono">
            {weather.humidityPct}%
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1">
            Pto. Orvalho: {weather.dewPointC}°C
          </span>
        </div>

      </div>

      {/* Description & Status Footer */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Status: <strong className="text-slate-100">{weather.weatherDescription}</strong></span>
        </div>

        <button
          onClick={onOpenAiReport}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline font-mono flex items-center gap-1"
        >
          Análise Completa com Gemini IA &rarr;
        </button>
      </div>

    </div>
  );
};
