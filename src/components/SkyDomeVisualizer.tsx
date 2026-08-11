import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Eye, Wind, Zap, ShieldAlert } from 'lucide-react';
import { WeatherData } from '../types';

interface SkyDomeVisualizerProps {
  weather: WeatherData;
  onOpenAiReport: () => void;
}

export const SkyDomeVisualizer: React.FC<SkyDomeVisualizerProps> = ({ weather, onOpenAiReport }) => {
  const [flash, setFlash] = useState(false);

  // Trigger occasional lightning flash for severe storms
  useEffect(() => {
    if (weather.capeIndex < 1200 && weather.weatherCode < 80) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setFlash(true);
        setTimeout(() => setFlash(false), 180);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [weather.capeIndex, weather.weatherCode]);

  // Determine atmospheric sky visual mood
  const isSevere = weather.capeIndex > 1800 || weather.weatherCode >= 95;
  const isCloudy = weather.cloudCoverPct > 60;
  const isRainy = weather.weatherCode >= 50;

  let bgGradient = 'from-blue-600 via-sky-400 to-indigo-900'; // clear daytime
  let skyTitle = 'Céu Limpo & Visibilidade Alta';

  if (isSevere) {
    bgGradient = 'from-emerald-950 via-slate-900 to-slate-950'; // Greenish-grey supercell sky
    skyTitle = 'Céu de Supercélula - Tom Esverdeado (Risco de Tornado)';
  } else if (isRainy && isCloudy) {
    bgGradient = 'from-slate-900 via-slate-800 to-slate-950'; // Stormy dark
    skyTitle = 'Céu Carregado de Tempestade';
  } else if (isCloudy) {
    bgGradient = 'from-slate-700 via-slate-800 to-slate-900';
    skyTitle = 'Céu Parcialmente a Totalmente Nublado';
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 font-mono-tech">
          <Eye className="w-4 h-4 text-cyan-400" />
          SIMULAÇÃO DO CÉU LOCAL (VISÃO DIRETA)
        </h3>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
          Nuvens: {weather.cloudCoverPct}%
        </span>
      </div>

      {/* Atmospheric Canvas Dome Box */}
      <div className={`relative w-full h-44 rounded-xl bg-gradient-to-b ${bgGradient} overflow-hidden shadow-inner flex flex-col justify-between p-4 transition-colors duration-1000 border border-slate-700/50`}>
        
        {/* Lightning Flash Overlay */}
        {flash && (
          <div className="absolute inset-0 bg-white/40 backdrop-brightness-200 z-30 transition-opacity duration-75" />
        )}

        {/* Rain Animated Effect */}
        {isRainy && (
          <div className="absolute inset-0 opacity-40 z-10 pointer-events-none overflow-hidden">
            <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent animate-pulse" />
          </div>
        )}

        {/* Floating Clouds & Sky Features */}
        <div className="relative z-20 flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-slate-100 drop-shadow flex items-center gap-1.5 font-mono">
              {isSevere ? (
                <CloudLightning className="w-4 h-4 text-amber-400 animate-pulse" />
              ) : isRainy ? (
                <CloudRain className="w-4 h-4 text-cyan-300" />
              ) : (
                <Sun className="w-4 h-4 text-amber-300" />
              )}
              {skyTitle}
            </span>
            <p className="text-[11px] text-slate-300/80 drop-shadow mt-0.5">
              Pressão: {weather.pressureHpa} hPa | Ponto de Orvalho: {weather.dewPointC}°C
            </p>
          </div>

          {/* Tornado Risk Indicator Pill */}
          {isSevere && (
            <div className="px-2.5 py-1 rounded-lg bg-red-600/80 border border-red-400 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg animate-bounce">
              <ShieldAlert className="w-3.5 h-3.5" />
              Risco Severo
            </div>
          )}
        </div>

        {/* Dynamic Cloud / Funnel Silhouettes */}
        <div className="relative z-20 flex items-center justify-center py-2">
          {isSevere ? (
            <div className="relative flex flex-col items-center">
              <div className="w-32 h-10 bg-slate-900/90 rounded-full blur-sm animate-pulse border border-emerald-500/30" />
              <div className="w-12 h-16 bg-gradient-to-b from-slate-900 to-slate-950 clip-funnel animate-vortex-spin opacity-90 border-x border-slate-700" style={{ clipPath: 'polygon(0 0, 100% 0, 65% 100%, 35% 100%)' }} />
              <span className="text-[10px] font-bold text-amber-300 font-mono mt-1">
                Supercélula com Vórtice em Rotação
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4 opacity-80">
              <Cloud className="w-10 h-10 text-slate-200/60 animate-pulse" />
              <Cloud className="w-14 h-14 text-slate-100/70" />
              <Cloud className="w-8 h-8 text-slate-300/50" />
            </div>
          )}
        </div>

        {/* Bottom Horizon line */}
        <div className="relative z-20 flex justify-between items-end text-[10px] font-mono text-slate-300/80 border-t border-white/10 pt-1.5">
          <span className="flex items-center gap-1">
            <Wind className="w-3 h-3 text-cyan-300" />
            Ventos: {weather.windSpeedKmH} km/h ({weather.windDirectionDeg}°)
          </span>
          <button
            onClick={onOpenAiReport}
            className="text-cyan-300 hover:text-cyan-200 underline flex items-center gap-1 font-bold"
          >
            <Zap className="w-3 h-3" />
            Análise Estabilidade IA
          </button>
        </div>

      </div>
    </div>
  );
};
