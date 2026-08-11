import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Radio, Clock, RefreshCw } from 'lucide-react';
import { RadarFrame } from '../types';

interface RadarTimelineProps {
  radarFrames: RadarFrame[];
  currentFrameIndex: number;
  onSelectFrameIndex: (index: number) => void;
  onRefreshRadar: () => void;
  isLoading: boolean;
}

export const RadarTimeline: React.FC<RadarTimelineProps> = ({
  radarFrames,
  currentFrameIndex,
  onSelectFrameIndex,
  onRefreshRadar,
  isLoading
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(1000); // ms per frame

  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0) return;

    const interval = setInterval(() => {
      onSelectFrameIndex((currentFrameIndex + 1) % radarFrames.length);
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, currentFrameIndex, radarFrames.length, speed]);

  if (radarFrames.length === 0) {
    return (
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          Conectando à rede de radar meteorológico...
        </span>
        <button
          onClick={onRefreshRadar}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          Recarregar
        </button>
      </div>
    );
  }

  const activeFrame = radarFrames[currentFrameIndex] || radarFrames[0];

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
        
        {/* Left Status & Time */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono-tech">
              Radar Doppler em Tempo Real
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-cyan-400 border border-slate-700 font-mono text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {activeFrame?.timeString || '--:--'}
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectFrameIndex((currentFrameIndex - 1 + radarFrames.length) % radarFrames.length)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Quadro Anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            title={isPlaying ? 'Pausar Animação' : 'Reproduzir Radar'}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => onSelectFrameIndex((currentFrameIndex + 1) % radarFrames.length)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Próximo Quadro"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Speed Toggle */}
          <button
            onClick={() => setSpeed(speed === 1000 ? 500 : speed === 500 ? 250 : 1000)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
            title="Velocidade da Animação"
          >
            {speed === 1000 ? '1x' : speed === 500 ? '2x' : '4x'}
          </button>

          <button
            onClick={onRefreshRadar}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
            title="Atualizar Dados de Radar"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Timeline Scrubber */}
      <div className="relative flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={radarFrames.length - 1}
          value={currentFrameIndex}
          onChange={(e) => onSelectFrameIndex(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Timeline Labels */}
      <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
        <span>Passado (-2h)</span>
        <span className="text-cyan-400 font-semibold">Agora ({activeFrame?.timeString})</span>
        <span>Previsão Radar (+30m)</span>
      </div>
    </div>
  );
};
