import React from 'react';
import { X, Sparkles, ShieldAlert, Cloud, Zap, CheckCircle, AlertTriangle, Radio } from 'lucide-react';
import { AiSkyAnalysis, WeatherData } from '../types';

interface AiSkyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AiSkyAnalysis | null;
  weather: WeatherData;
  isLoading: boolean;
}

export const AiSkyReportModal: React.FC<AiSkyReportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  weather,
  isLoading
}) => {
  if (!isOpen) return null;

  const risk = analysis?.tornadoRiskPercentage ?? (weather.capeIndex > 2000 ? 82 : weather.capeIndex > 1200 ? 55 : 15);

  let riskColor = 'from-emerald-500 to-green-600 text-emerald-400';
  let riskBadge = 'BAIXO';
  if (risk >= 75) {
    riskColor = 'from-purple-600 via-red-600 to-amber-600 text-red-400';
    riskBadge = 'EMERGÊNCIA / EXTREMO';
  } else if (risk >= 45) {
    riskColor = 'from-amber-500 to-red-500 text-amber-400';
    riskBadge = 'ALERTA SEVERO';
  } else if (risk >= 25) {
    riskColor = 'from-blue-500 to-amber-500 text-blue-400';
    riskBadge = 'MODERADO';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-slate-950 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-mono-tech flex items-center gap-2">
                ANÁLISE DO CÉU E CLIMA COM GEMINI IA
              </h2>
              <p className="text-xs text-slate-400">
                Região: <strong className="text-cyan-400">{weather.regionName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                <Sparkles className="w-6 h-6 text-cyan-400 absolute animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200 font-mono-tech">
                  Analisando Cisalhamento, CAPE e Dinâmica Atmosférica...
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sintetizando modelos meteorológicos e radar via Gemini AI
                </p>
              </div>
            </div>
          ) : analysis ? (
            <>
              {/* Tornado Risk Gauge Banner */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Probabilidade & Risco de Tornado Local
                  </span>
                  <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border bg-slate-900 ${riskColor}`}>
                    {riskBadge}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-extrabold text-slate-100 font-mono-tech">{risk}%</span>
                  <span className="text-xs text-slate-400 font-mono">Índice de Vorticidade Mesociclônica</span>
                </div>

                <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${riskColor} transition-all duration-1000`}
                    style={{ width: `${Math.min(100, Math.max(5, risk))}%` }}
                  />
                </div>
              </div>

              {/* Sky Condition & Cloud Diagnostics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-mono text-cyan-400 font-semibold block mb-1">
                    ☁️ Condição do Céu
                  </span>
                  <p className="text-xs text-slate-200 font-medium">
                    {analysis.skyCondition}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-xs font-mono text-cyan-400 font-semibold block mb-1">
                    🌩️ Classificação das Nuvens
                  </span>
                  <p className="text-xs text-slate-200 font-medium">
                    {analysis.cloudType}
                  </p>
                </div>
              </div>

              {/* Atmospheric Stability */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-mono text-amber-400 font-semibold block mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Estabilidade Atmosférica e Cisalhamento
                </span>
                <p className="text-xs text-slate-200">
                  {analysis.atmosphericStability}
                </p>
              </div>

              {/* AI Summary */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
                <h4 className="font-bold text-slate-100 font-mono uppercase text-[11px] text-cyan-400">
                  Relatório Sintético Meteorológico:
                </h4>
                <p>{analysis.summaryText}</p>
              </div>

              {/* Safety Recommendations */}
              {analysis.safetyRecommendations && analysis.safetyRecommendations.length > 0 && (
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30">
                  <h4 className="text-xs font-bold text-red-400 font-mono uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Protocolo de Segurança e Recomendações
                  </h4>
                  <ul className="space-y-1.5">
                    {analysis.safetyRecommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-mono">
              Nenhuma análise disponível no momento.
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Atualizado às: {analysis?.analysisTimestamp || weather.updatedAt}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium transition-colors"
          >
            Fechar Relatório
          </button>
        </div>

      </div>
    </div>
  );
};
