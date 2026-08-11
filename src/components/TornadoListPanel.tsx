import React, { useState } from 'react';
import { Tornado, ShieldAlert, Navigation, Wind, Radio, AlertTriangle, PlusCircle, CheckCircle2 } from 'lucide-react';
import { TornadoAlert, TornadoRating } from '../types';

interface TornadoListPanelProps {
  tornadoes: TornadoAlert[];
  selectedTornadoId: string | null;
  onSelectTornado: (id: string | null) => void;
  onFocusTornado: (tornado: TornadoAlert) => void;
  onAddSimulatedTornado: (lat: number, lng: number) => void;
  currentMapCenter: { lat: number; lng: number };
}

export const TornadoListPanel: React.FC<TornadoListPanelProps> = ({
  tornadoes,
  selectedTornadoId,
  onSelectTornado,
  onFocusTornado,
  onAddSimulatedTornado,
  currentMapCenter
}) => {
  const [filterRating, setFilterRating] = useState<string>('ALL');

  const filteredTornadoes = tornadoes.filter(t => {
    if (filterRating === 'ALL') return true;
    return t.rating === filterRating;
  });

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-full max-h-[620px]">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
            <Tornado className="w-5 h-5 animate-vortex-spin" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono-tech flex items-center gap-2">
              RASTREADOR DE TORNADOS
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/40">
                {tornadoes.length} Ativos
              </span>
            </h2>
            <p className="text-xs text-slate-400">Vórtices mesociclônicos monitorados via Doppler</p>
          </div>
        </div>

        <button
          onClick={() => onAddSimulatedTornado(currentMapCenter.lat, currentMapCenter.lng)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
          title="Simular formação de tornado na região atual"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Simular Vórtice</span>
        </button>
      </div>

      {/* EF Filter Pill Buttons */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {['ALL', 'EF0', 'EF1', 'EF2', 'EF3', 'EF4', 'EF5'].map(rating => (
          <button
            key={rating}
            onClick={() => setFilterRating(rating)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              filterRating === rating
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {rating}
          </button>
        ))}
      </div>

      {/* Tornado List */}
      <div className="space-y-3 overflow-y-auto pr-1 flex-1">
        {filteredTornadoes.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
            Nenhum tornado encontrado com o filtro selecionado.
          </div>
        ) : (
          filteredTornadoes.map(tornado => {
            const isSelected = tornado.id === selectedTornadoId;

            let badgeColor = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
            if (tornado.rating === 'EF2') badgeColor = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
            if (tornado.rating === 'EF3' || tornado.rating === 'EF4') badgeColor = 'bg-red-500/25 text-red-400 border-red-500/50';
            if (tornado.rating === 'EF5') badgeColor = 'bg-purple-500/30 text-purple-300 border-purple-500/60';

            return (
              <div
                key={tornado.id}
                onClick={() => onSelectTornado(tornado.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${badgeColor} mb-1`}>
                      {tornado.rating} ({tornado.windKmH} km/h)
                    </span>
                    <h3 className="text-xs font-bold text-slate-100 font-mono-tech line-clamp-1">
                      {tornado.title}
                    </h3>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusTornado(tornado);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 transition-colors shrink-0"
                    title="Centralizar no Mapa"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                  {tornado.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    <span>Deslocamento: <strong className="text-slate-200">{tornado.speedKmH} km/h</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-red-400" />
                    <span>Refletividade: <strong className="text-red-400">{tornado.radarReflectivityDbz} dBZ</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 pt-1 border-t border-slate-800/60">
                  <span>Local: {tornado.city}</span>
                  <span>{tornado.touchdownTime}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
