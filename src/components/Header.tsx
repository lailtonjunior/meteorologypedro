import React, { useState, useEffect, useRef } from 'react';
import { Search, Tornado, CloudLightning, ShieldAlert, Sparkles, MapPin, Radio, Eye, Gauge } from 'lucide-react';
import { SearchResult, TornadoAlert } from '../types';
import { searchLocations } from '../services/weatherApi';

interface HeaderProps {
  onSelectLocation: (result: SearchResult) => void;
  activeTornadoes: TornadoAlert[];
  onOpenAiReport: () => void;
  isLoadingAi: boolean;
  onFocusTornado: (tornado: TornadoAlert) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectLocation,
  activeTornadoes,
  onOpenAiReport,
  isLoadingAi,
  onFocusTornado
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeWarningsCount = activeTornadoes.filter(t => t.status === 'active' || t.status === 'spotted').length;

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchLocations(query);
        setSearchResults(results);
        setIsSearching(false);
        setShowDropdown(true);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 350);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-xl px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Live Monitor Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-600 to-cyan-600 p-0.5 shadow-lg shadow-red-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Tornado className="w-6 h-6 text-cyan-400 animate-vortex-spin" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2 font-mono-tech">
                VORTEX<span className="text-cyan-400">RADAR</span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  AO VIVO
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoramento de Tornados, Satélite e Clima
              </p>
            </div>
          </div>

          {/* Mobile AI button */}
          <button
            onClick={onOpenAiReport}
            disabled={isLoadingAi}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-medium shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingAi ? 'Analisando...' : 'Análise IA'}</span>
          </button>
        </div>

        {/* Location Search Bar */}
        <div className="relative w-full md:w-96" ref={dropdownRef}>
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cidade, região ou Tornado Alley (ex: Oklahoma, São Paulo)..."
              className="w-full pl-10 pr-10 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {isSearching && (
              <div className="absolute right-3 w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Search Dropdown Results */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
              {searchResults.map((item) => (
                <button
                  key={item.placeId}
                  onClick={() => {
                    onSelectLocation(item);
                    setQuery('');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-800/80 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <MapPin className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                    <div className="truncate">
                      <span className="font-medium text-slate-100">{item.city}</span>
                      <span className="text-xs text-slate-400 block truncate">{item.displayName}</span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300">
                    Ir para
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ticker & AI Analysis Action */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {activeWarningsCount > 0 && (
            <button
              onClick={() => onFocusTornado(activeTornadoes[0])}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-500/25 transition-all animate-radar-pulse"
              title="Clique para ir ao maior vórtice de tornado ativo"
            >
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{activeWarningsCount} Vórtices Ativos</span>
            </button>
          )}

          <button
            onClick={onOpenAiReport}
            disabled={isLoadingAi}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-500/30 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 text-cyan-200 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Gerando Análise Atmosférica...' : 'Análise do Céu com IA'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
