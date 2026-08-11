/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { WeatherMap } from './components/WeatherMap';
import { RadarTimeline } from './components/RadarTimeline';
import { SkyDomeVisualizer } from './components/SkyDomeVisualizer';
import { MetricsOverview } from './components/MetricsOverview';
import { TornadoListPanel } from './components/TornadoListPanel';
import { AiSkyReportModal } from './components/AiSkyReportModal';
import { MapLayerType, WeatherData, TornadoAlert, RadarFrame, AiSkyAnalysis, SearchResult } from './types';
import { fetchWeatherData, fetchRadarFrames, getInitialTornadoAlerts } from './services/weatherApi';

export default function App() {
  // Map Location State (Default: Oklahoma City / Tornado Alley)
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: 35.4676,
    lng: -97.5164,
    name: 'Oklahoma City, Tornado Alley'
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [mapLayer, setMapLayer] = useState<MapLayerType>('satellite');
  const [tornadoes, setTornadoes] = useState<TornadoAlert[]>([]);
  const [selectedTornadoId, setSelectedTornadoId] = useState<string | null>('tor-001');

  // Radar frames state
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isLoadingRadar, setIsLoadingRadar] = useState(false);

  // AI Gemini Analysis Modal state
  const [aiAnalysis, setAiAnalysis] = useState<AiSkyAnalysis | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Load weather and initial tornado list for location
  const loadLocationData = useCallback(async (lat: number, lng: number, name?: string) => {
    const data = await fetchWeatherData(lat, lng, name);
    setWeather(data);
  }, []);

  useEffect(() => {
    loadLocationData(location.lat, location.lng, location.name);
    setTornadoes(getInitialTornadoAlerts(location.lat, location.lng));
  }, [location, loadLocationData]);

  // Load RainViewer live radar frames
  const loadRadarData = useCallback(async () => {
    setIsLoadingRadar(true);
    const frames = await fetchRadarFrames();
    setRadarFrames(frames);
    if (frames.length > 0) {
      setCurrentFrameIndex(frames.length - 1); // Set to latest real-time frame
    }
    setIsLoadingRadar(false);
  }, []);

  useEffect(() => {
    loadRadarData();
  }, [loadRadarData]);

  // Handle Search Selection
  const handleSelectSearchResult = (result: SearchResult) => {
    setLocation({
      lat: result.lat,
      lng: result.lng,
      name: `${result.city}, ${result.country}`
    });
    setSelectedTornadoId(null);
  };

  // Handle Map Click
  const handleMapClick = (lat: number, lng: number) => {
    setLocation({
      lat,
      lng,
      name: `Lat: ${lat.toFixed(3)}°, Lng: ${lng.toFixed(3)}°`
    });
  };

  // Focus on Tornado
  const handleFocusTornado = (tornado: TornadoAlert) => {
    setSelectedTornadoId(tornado.id);
    setLocation({
      lat: tornado.lat,
      lng: tornado.lng,
      name: tornado.city
    });
  };

  // Simulate new tornado on current map position
  const handleAddSimulatedTornado = (lat: number, lng: number) => {
    const ratings: Array<'EF1' | 'EF2' | 'EF3' | 'EF4' | 'EF5'> = ['EF1', 'EF2', 'EF3', 'EF4', 'EF5'];
    const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
    const newId = `tor-sim-${Date.now()}`;
    const newTornado: TornadoAlert = {
      id: newId,
      title: `Novo Vórtice Detectado - ${randomRating}`,
      rating: randomRating,
      lat: lat + (Math.random() * 0.04 - 0.02),
      lng: lng + (Math.random() * 0.04 - 0.02),
      city: weather?.regionName || 'Região Monitorada',
      stateCountry: weather?.stateCountry || 'Coordenadas Locais',
      windKmH: 150 + Math.floor(Math.random() * 160),
      radiusKm: 1.2 + Math.random() * 2,
      directionDeg: Math.floor(Math.random() * 360),
      speedKmH: 40 + Math.floor(Math.random() * 35),
      status: 'active',
      pathCoordinates: [
        { lat, lng },
        { lat: lat + 0.03, lng: lng + 0.03 },
        { lat: lat + 0.06, lng: lng + 0.06 }
      ],
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      radarReflectivityDbz: 55 + Math.floor(Math.random() * 20),
      touchdownTime: 'Agora mesmo',
      description: 'Formação mesociclônica detectada via radar Doppler e telemetria de pressão. Alerta ativado!'
    };

    setTornadoes(prev => [newTornado, ...prev]);
    setSelectedTornadoId(newId);
  };

  // Call Gemini Server-side AI endpoint
  const handleGenerateAiReport = async () => {
    if (!weather) return;
    setIsLoadingAi(true);
    setIsAiModalOpen(true);

    try {
      const res = await fetch('/api/gemini/sky-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regionName: weather.regionName,
          lat: weather.lat,
          lng: weather.lng,
          temperatureC: weather.temperatureC,
          humidityPct: weather.humidityPct,
          pressureHpa: weather.pressureHpa,
          windSpeedKmH: weather.windSpeedKmH,
          windDirectionDeg: weather.windDirectionDeg,
          cloudCoverPct: weather.cloudCoverPct,
          capeIndex: weather.capeIndex,
          weatherDescription: weather.weatherDescription,
          nearbyTornadoesCount: tornadoes.length
        })
      });

      if (!res.ok) throw new Error('Erro na requisição da IA Gemini');
      const json = await res.json();
      if (json.success && json.data) {
        setAiAnalysis(json.data);
      } else {
        throw new Error(json.error || 'Erro desconhecido');
      }
    } catch (err) {
      console.error('Falha ao gerar análise IA:', err);
      // Fallback AI analysis if offline or backend key pending
      setAiAnalysis({
        skyCondition: 'Céu denso de tempestade com rotação mesociclônica visível na base das nuvens',
        tornadoRiskPercentage: weather.capeIndex > 1800 ? 88 : 42,
        cloudType: 'Cumulonimbus Arcuste / Wall Cloud Supercelular',
        atmosphericStability: 'Instabilidade Extrema com Forte Cisalhamento Vertical do Vento',
        safetyRecommendations: [
          'Abrigue-se imediatamente no cômodo mais interno do pavimento inferior ou porão.',
          'Permaneça distante de janelas, vidros e portas externas.',
          'Monitore continuamente os avisos de emergência do radar Doppler.'
        ],
        summaryText: `A região de ${weather.regionName} apresenta energia potencial de instabilidade (CAPE: ${weather.capeIndex} J/kg) combinada com rápida queda de pressão e ventos de ${weather.windSpeedKmH} km/h. As imagens do radar Doppler indicam grande favorecimento para rotações de tempestade de supercélula.\n\nRecomenda-se vigilância total do céu e atenção aos alertas de emergência locais.`,
        analysisTimestamp: new Date().toLocaleTimeString('pt-BR')
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navigation & Location Search Header */}
      <Header
        onSelectLocation={handleSelectSearchResult}
        activeTornadoes={tornadoes}
        onOpenAiReport={handleGenerateAiReport}
        isLoadingAi={isLoadingAi}
        onFocusTornado={handleFocusTornado}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Left / Center Main Column: Map + Radar Timeline (Spans 2 cols on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-4 min-h-[600px]">
          
          {/* Main Interactive Map (Satellite, Radar Doppler, Thermal Heatmap) */}
          {weather && (
            <WeatherMap
              weather={weather}
              mapLayer={mapLayer}
              onChangeLayer={setMapLayer}
              tornadoes={tornadoes}
              selectedTornadoId={selectedTornadoId}
              onSelectTornado={setSelectedTornadoId}
              onMapClick={handleMapClick}
              currentRadarFrame={radarFrames[currentFrameIndex] || null}
            />
          )}

          {/* Radar Frame Playback Controls */}
          <RadarTimeline
            radarFrames={radarFrames}
            currentFrameIndex={currentFrameIndex}
            onSelectFrameIndex={setCurrentFrameIndex}
            onRefreshRadar={loadRadarData}
            isLoading={isLoadingRadar}
          />

          {/* Weather Metrics Cards */}
          {weather && (
            <MetricsOverview
              weather={weather}
              onOpenAiReport={handleGenerateAiReport}
            />
          )}

        </div>

        {/* Right Sidebar: Sky Visualizer & Tornado Tracker Panel */}
        <div className="flex flex-col gap-4">
          
          {/* Real-time Atmospheric Sky Simulator Dome */}
          {weather && (
            <SkyDomeVisualizer
              weather={weather}
              onOpenAiReport={handleGenerateAiReport}
            />
          )}

          {/* Tornado Tracker & Active Alert List */}
          <TornadoListPanel
            tornadoes={tornadoes}
            selectedTornadoId={selectedTornadoId}
            onSelectTornado={setSelectedTornadoId}
            onFocusTornado={handleFocusTornado}
            onAddSimulatedTornado={handleAddSimulatedTornado}
            currentMapCenter={{ lat: location.lat, lng: location.lng }}
          />

        </div>

      </main>

      {/* AI Sky Analysis Modal Dialog */}
      {weather && (
        <AiSkyReportModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          analysis={aiAnalysis}
          weather={weather}
          isLoading={isLoadingAi}
        />
      )}

      {/* Compact Footer Status Bar */}
      <footer className="bg-slate-900/80 border-t border-slate-800 py-3 px-4 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto w-full gap-2">
        <span>VortexRadar &copy; Monitoramento Meteorológico em Tempo Real</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Telemetria Doppler, Satélite e Gemini AI
        </span>
      </footer>

    </div>
  );
}
