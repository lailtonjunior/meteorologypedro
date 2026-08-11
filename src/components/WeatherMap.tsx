import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapLayerType, TornadoAlert, WeatherData, RadarFrame } from '../types';
import { Layers, Eye, Flame, CloudRain, Wind, Radio, Navigation } from 'lucide-react';

interface WeatherMapProps {
  weather: WeatherData;
  mapLayer: MapLayerType;
  onChangeLayer: (layer: MapLayerType) => void;
  tornadoes: TornadoAlert[];
  selectedTornadoId: string | null;
  onSelectTornado: (id: string | null) => void;
  onMapClick: (lat: number, lng: number) => void;
  currentRadarFrame: RadarFrame | null;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  weather,
  mapLayer,
  onChangeLayer,
  tornadoes,
  selectedTornadoId,
  onSelectTornado,
  onMapClick,
  currentRadarFrame
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);
  const radarTileRef = useRef<L.TileLayer | null>(null);
  const thermalTileRef = useRef<L.TileLayer | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const targetMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [weather.lat, weather.lng],
      zoom: 8,
      zoomControl: false
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);

    // Click handler to select new location on map
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Center Position when weather location changes
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([weather.lat, weather.lng], mapRef.current.getZoom(), {
      animate: true,
      duration: 1.2
    });

    // Update target marker
    if (targetMarkerRef.current) {
      targetMarkerRef.current.setLatLng([weather.lat, weather.lng]);
    } else {
      const pinIcon = L.divIcon({
        className: 'custom-target-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-6 h-6 rounded-full bg-cyan-500/30 border-2 border-cyan-400 animate-ping absolute"></div>
            <div class="w-3 h-3 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-lg"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      targetMarkerRef.current = L.marker([weather.lat, weather.lng], { icon: pinIcon }).addTo(mapRef.current);
    }
  }, [weather.lat, weather.lng]);

  // Update Base Layer & Overlays
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove old base layer
    if (baseTileRef.current) {
      map.removeLayer(baseTileRef.current);
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap &copy; CARTO';

    if (mapLayer === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (mapLayer === 'street') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }

    baseTileRef.current = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);

    // Handle Radar Overlay
    if (radarTileRef.current) {
      map.removeLayer(radarTileRef.current);
      radarTileRef.current = null;
    }

    if ((mapLayer === 'radar' || currentRadarFrame) && currentRadarFrame?.path) {
      radarTileRef.current = L.tileLayer(currentRadarFrame.path, {
        opacity: 0.72,
        zIndex: 10
      }).addTo(map);
    }

    // Handle Thermal / Heat Vision Layer Overlay
    if (thermalTileRef.current) {
      map.removeLayer(thermalTileRef.current);
      thermalTileRef.current = null;
    }

    if (mapLayer === 'thermal') {
      // Temperature Heatmap / Thermal overlay
      thermalTileRef.current = L.tileLayer('https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2', {
        opacity: 0.65,
        className: 'thermal-layer-filter',
        zIndex: 15
      }).addTo(map);
    } else if (mapLayer === 'clouds') {
      thermalTileRef.current = L.tileLayer('https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2', {
        opacity: 0.6,
        className: 'clouds-layer-filter',
        zIndex: 12
      }).addTo(map);
    }
  }, [mapLayer, currentRadarFrame]);

  // Render Tornado Markers on Map
  useEffect(() => {
    if (!mapRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    tornadoes.forEach(tornado => {
      const isSelected = tornado.id === selectedTornadoId;

      // Rating Colors
      let colorClass = 'border-yellow-400 bg-yellow-500/20 text-yellow-300';
      let pinHex = '#facc15';
      if (tornado.rating === 'EF2') {
        colorClass = 'border-orange-500 bg-orange-500/30 text-orange-400';
        pinHex = '#f97316';
      } else if (tornado.rating === 'EF3' || tornado.rating === 'EF4') {
        colorClass = 'border-red-600 bg-red-600/40 text-red-400';
        pinHex = '#dc2626';
      } else if (tornado.rating === 'EF5') {
        colorClass = 'border-purple-600 bg-purple-600/50 text-purple-300';
        pinHex = '#9333ea';
      }

      // Draw path polyline if exists
      if (tornado.pathCoordinates && tornado.pathCoordinates.length > 1) {
        const pathArray = tornado.pathCoordinates.map(c => [c.lat, c.lng] as [number, number]);
        const line = L.polyline(pathArray, {
          color: pinHex,
          weight: isSelected ? 4 : 2,
          dashArray: '6, 8',
          opacity: 0.85
        });
        markersGroupRef.current?.addLayer(line);
      }

      // Draw Warning Radius Circle
      const radiusCircle = L.circle([tornado.lat, tornado.lng], {
        radius: (tornado.radiusKm || 2) * 1000,
        color: pinHex,
        fillColor: pinHex,
        fillOpacity: isSelected ? 0.25 : 0.12,
        weight: isSelected ? 2 : 1
      });
      markersGroupRef.current?.addLayer(radiusCircle);

      // Custom DivIcon for Tornado Vortex
      const tornadoDivIcon = L.divIcon({
        className: 'custom-tornado-icon',
        html: `
          <div class="relative group cursor-pointer flex items-center justify-center">
            ${isSelected ? `<div class="absolute w-12 h-12 rounded-full border-2 border-red-500 animate-ping"></div>` : ''}
            <div class="w-10 h-10 rounded-full border-2 ${colorClass} flex items-center justify-center shadow-xl backdrop-blur-md transition-transform hover:scale-125">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="${isSelected ? 'animate-vortex-fast' : 'animate-vortex-spin'}">
                <path d="M21 4H3"/>
                <path d="M18 8H6"/>
                <path d="M19 12H9"/>
                <path d="M16 16h-4"/>
                <path d="M14 20h-1"/>
              </svg>
            </div>
            <span class="absolute -bottom-5 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-900/90 text-slate-100 border border-slate-700 whitespace-nowrap shadow-md">
              ${tornado.rating} | ${tornado.windKmH} km/h
            </span>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = L.marker([tornado.lat, tornado.lng], { icon: tornadoDivIcon });

      marker.on('click', () => {
        onSelectTornado(tornado.id);
      });

      // Custom Popup
      marker.bindPopup(`
        <div class="p-1 min-w-[220px]">
          <div class="flex items-center justify-between gap-2 border-b border-slate-700 pb-2 mb-2">
            <span class="font-bold text-sm text-red-400 flex items-center gap-1">
              🌪️ ${tornado.title}
            </span>
            <span class="px-2 py-0.5 text-xs font-bold rounded bg-red-500/20 text-red-300 border border-red-500/40">
              ${tornado.rating}
            </span>
          </div>
          <p class="text-xs text-slate-300 mb-2">${tornado.description}</p>
          <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800">
            <div>Ventos: <span class="text-slate-100 font-bold">${tornado.windKmH} km/h</span></div>
            <div>Desloc.: <span class="text-slate-100 font-bold">${tornado.speedKmH} km/h</span></div>
            <div>Refletividade: <span class="text-cyan-400 font-bold">${tornado.radarReflectivityDbz} dBZ</span></div>
            <div>Status: <span class="text-amber-400 font-bold">${tornado.status.toUpperCase()}</span></div>
          </div>
        </div>
      `);

      markersGroupRef.current?.addLayer(marker);
    });
  }, [tornadoes, selectedTornadoId]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px] z-0" />

      {/* Layer Select Selector floating overlay */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl">
        
        <button
          onClick={() => onChangeLayer('satellite')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mapLayer === 'satellite'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Satélite</span>
        </button>

        <button
          onClick={() => onChangeLayer('radar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mapLayer === 'radar'
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar Doppler</span>
        </button>

        <button
          onClick={() => onChangeLayer('thermal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mapLayer === 'thermal'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Visão Térmica</span>
        </button>

        <button
          onClick={() => onChangeLayer('clouds')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mapLayer === 'clouds'
              ? 'bg-blue-500 text-slate-950 font-bold shadow-md shadow-blue-500/30'
              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>Céu / Nuvens</span>
        </button>

        <button
          onClick={() => onChangeLayer('street')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            mapLayer === 'street'
              ? 'bg-slate-200 text-slate-950 font-bold shadow-md'
              : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Mapa Urbano</span>
        </button>

      </div>

      {/* Layer Specific Legend Overlay */}
      {mapLayer === 'thermal' && (
        <div className="absolute bottom-6 right-4 z-10 p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl text-xs">
          <span className="font-semibold text-slate-300 block mb-1.5 font-mono text-[11px]">
            Escala Térmica Atmosférica (°C)
          </span>
          <div className="w-48 h-3 rounded-md bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 via-orange-500 to-red-600 shadow-inner" />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>-10°C</span>
            <span>15°C</span>
            <span>30°C</span>
            <span>45°C+</span>
          </div>
        </div>
      )}

      {mapLayer === 'radar' && (
        <div className="absolute bottom-6 right-4 z-10 p-2.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-xl text-xs">
          <span className="font-semibold text-slate-300 block mb-1.5 font-mono text-[11px]">
            Refletividade Radar Doppler (dBZ)
          </span>
          <div className="w-48 h-3 rounded-md bg-gradient-to-r from-cyan-400 via-green-500 via-yellow-400 via-red-600 to-purple-600 shadow-inner" />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>15 dBZ (Leve)</span>
            <span>40 dBZ</span>
            <span>75+ dBZ (Tornado)</span>
          </div>
        </div>
      )}

      {/* Click Map Hint */}
      <div className="absolute bottom-6 left-4 z-10 px-3 py-1.5 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-lg text-[11px] text-slate-400 flex items-center gap-2 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        <span>Clique em qualquer região do mapa para inspecionar o clima local</span>
      </div>

    </div>
  );
};
