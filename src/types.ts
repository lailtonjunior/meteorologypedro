export type MapLayerType = 'satellite' | 'radar' | 'thermal' | 'clouds' | 'wind' | 'street';

export type TornadoRating = 'EF0' | 'EF1' | 'EF2' | 'EF3' | 'EF4' | 'EF5';

export type AlertSeverity = 'calm' | 'moderate' | 'warning' | 'tornado_watch' | 'tornado_warning';

export interface TornadoAlert {
  id: string;
  title: string;
  rating: TornadoRating;
  lat: number;
  lng: number;
  city: string;
  stateCountry: string;
  windKmH: number;
  radiusKm: number;
  directionDeg: number;
  speedKmH: number;
  status: 'active' | 'spotted' | 'dissipating' | 'radar_indicated';
  pathCoordinates: { lat: number; lng: number }[];
  timestamp: string;
  radarReflectivityDbz: number;
  touchdownTime: string;
  description: string;
}

export interface WeatherData {
  regionName: string;
  stateCountry: string;
  lat: number;
  lng: number;
  temperatureC: number;
  temperatureF: number;
  feelsLikeC: number;
  humidityPct: number;
  pressureHpa: number;
  windSpeedKmH: number;
  windDirectionDeg: number;
  cloudCoverPct: number;
  dewPointC: number;
  uvIndex: number;
  capeIndex: number; // Convective Available Potential Energy (J/kg) -> Storm strength indicator
  weatherCode: number;
  weatherDescription: string;
  alertLevel: AlertSeverity;
  updatedAt: string;
}

export interface RadarFrame {
  timestamp: number;
  timeString: string;
  path: string;
}

export interface AiSkyAnalysis {
  skyCondition: string;
  tornadoRiskPercentage: number;
  cloudType: string;
  atmosphericStability: string;
  safetyRecommendations: string[];
  summaryText: string;
  analysisTimestamp: string;
}

export interface SearchResult {
  placeId: string;
  displayName: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}
