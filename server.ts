import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client (Server-side only)
  let ai: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY não configurada nas variáveis de ambiente.');
      }
      ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return ai;
  }

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Route: AI Sky & Tornado Diagnostic Endpoint
  app.post('/api/gemini/sky-analysis', async (req, res) => {
    try {
      const {
        regionName,
        lat,
        lng,
        temperatureC,
        humidityPct,
        pressureHpa,
        windSpeedKmH,
        windDirectionDeg,
        cloudCoverPct,
        capeIndex,
        weatherDescription,
        nearbyTornadoesCount
      } = req.body;

      const client = getGeminiClient();

      const prompt = `Você é um Meteorologista Chefe e Especialista em Caça de Tornados e Análise Atmosférica em Tempo Real.
Analise os seguintes dados climáticos para a região de "${regionName || 'Desconhecida'}" (Lat: ${lat}, Lng: ${lng}):
- Temperatura: ${temperatureC}°C
- Umidade Relativa: ${humidityPct}%
- Pressão Atmosférica: ${pressureHpa} hPa
- Velocidade do Vento: ${windSpeedKmH} km/h (Direção: ${windDirectionDeg}°)
- Cobertura de Nuvens: ${cloudCoverPct}%
- Índice CAPE (Energia Potencial Convectiva Disponível): ${capeIndex} J/kg
- Descrição da Estação: ${weatherDescription}
- Vórtices de Tornado Detectados na Região Próxima: ${nearbyTornadoesCount || 0}

Forneça uma análise detalhada da condição do céu, estabilidade atmosférica e risco de tornados no seguinte formato JSON estrito:
{
  "skyCondition": "Descrição visual do céu (ex: Céu carregado com nuvem de parede em rotação e tons verde-cinza indicando granizo)",
  "tornadoRiskPercentage": 0 a 100 (número inteiro indicando o risco de tornado),
  "cloudType": "Tipos de nuvens identificadas (ex: Cumulonimbus Arcuste, Supercélula Mesociclônica, Mammatus)",
  "atmosphericStability": "Status da atmosfera (ex: Atmosfera Extremamente Instável com Alto Cisalhamento do Vento)",
  "safetyRecommendations": [
    "Recomendação de segurança 1",
    "Recomendação de segurança 2",
    "Recomendação de segurança 3"
  ],
  "summaryText": "Resumo meteorológico explicativo em 2 parágrafos enfatizando a situação atual do céu e os cuidados necessários."
}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skyCondition: { type: Type.STRING },
              tornadoRiskPercentage: { type: Type.INTEGER },
              cloudType: { type: Type.STRING },
              atmosphericStability: { type: Type.STRING },
              safetyRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              summaryText: { type: Type.STRING }
            },
            required: ['skyCondition', 'tornadoRiskPercentage', 'cloudType', 'atmosphericStability', 'safetyRecommendations', 'summaryText']
          }
        }
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);

      res.json({
        success: true,
        data: {
          ...parsed,
          analysisTimestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      });
    } catch (error: any) {
      console.error('Erro no endpoint Gemini sky-analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao processar análise do céu com IA'
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server rodando em http://localhost:${PORT}`);
  });
}

startServer();
