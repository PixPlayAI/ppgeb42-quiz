import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario10',
  title: 'Cenário X: Título do Cenário',
  question: 'Carregando...',
  options: [
    {
      id: 'option1',
      text: 'Carregando...',
      isCorrect: true,
    },
    {
      id: 'option2',
      text: 'Carregando...',
      isCorrect: false,
    },
    {
      id: 'option3',
      text: 'Carregando...',
      isCorrect: false,
    },
    {
      id: 'option4',
      text: 'Carregando...',
      isCorrect: false,
    },
  ],
  successMessage: 'Carregando...',
  detailedExplanation: 'Carregando...',
};

// Variável para controlar a inicialização
let isInitialized = false;

// Função para resetar a configuração
const resetConfig = () => {
  SCENARIO_CONFIG = {
    id: 'scenario10',
    title: 'Cenário X: Título do Cenário',
    question: 'Carregando...',
    options: [
      {
        id: 'option1',
        text: 'Carregando...',
        isCorrect: true,
      },
      {
        id: 'option2',
        text: 'Carregando...',
        isCorrect: false,
      },
      {
        id: 'option3',
        text: 'Carregando...',
        isCorrect: false,
      },
      {
        id: 'option4',
        text: 'Carregando...',
        isCorrect: false,
      },
    ],
    successMessage: 'Carregando...',
    detailedExplanation: 'Carregando...',
  };
};

const SIMULATION_CONFIG = {
  startPoint: { x: 50, y: 150 },
  barrier: {
    x: 190,
    y: 75,
    width: 20,
    height: 150,
  },
};

const getSimulationConfig = (scenarioNumber) => {
  return {
    particleInterval: scenarioNumber === 1 ? 5 : 50,
    maxParticles: scenarioNumber === 1 ? 400 : 40,
    ricochetProbability: 0.8,
    transmissionProbability: 0.15,
  };
};

// Atualização do cenárioPrompt baseado no scenarioNumber
const getScenarioPrompt = (scenarioNumber) => {
  const scenarioDescription =
    scenarioNumber === 1
      ? `
Neste cenário, na parte superior é apresentada uma simulação de partículas que mostra uma emissão intensa, representando a alta atividade dos radioisótopos terapêuticos. Logo abaixo, são exibidos dois gráficos:

1. O primeiro gráfico mostra o decaimento radioativo de três radioisótopos amplamente utilizados em radioterapia:
   - Irídio-192 (linha vermelha sólida), com meia-vida de 74 dias, usado principalmente em braquiterapia para tratamento de diversos tipos de câncer.
   - Iodo-131 (linha vermelha tracejada), com meia-vida de 8 dias, aplicado especialmente no tratamento de câncer de tireoide.
   - Lutécio-177 (linha vermelha pontilhada), com meia-vida de 6,6 dias, utilizado em terapia de receptores peptídicos para tumores neuroendócrinos.

2. O segundo gráfico apresenta o espectro de energia destes mesmos radioisótopos:
   - Ir-192 com dois picos característicos em 316 keV e 468 keV.
   - I-131 com pico principal em 364 keV.
   - Lu-177 com pico principal em 208 keV.

Estas energias mais altas são ideais para terapia, pois proporcionam maior poder de penetração nos tecidos.
`
      : `
Neste cenário, a parte superior mostra a simulação com emissão menos intensa, adequada para procedimentos diagnósticos. Abaixo, encontramos:

1. O gráfico de decaimento exibe dois radioisótopos essenciais para diagnóstico:
   - Tecnécio-99m (linha azul sólida), com meia-vida de 6 horas, o radioisótopo mais utilizado em medicina nuclear diagnóstica.
   - Iodo-123 (linha azul tracejada), com meia-vida de 13 horas, usado principalmente em diagnóstico de doenças da tireoide.

2. O gráfico de espectro de energia mostra:
   - Tc-99m com pico característico em 140 keV.
   - I-123 com pico principal em 159 keV.

Estas energias mais baixas são ideais para imageamento, pois proporcionam boa detecção nas câmaras de cintilação e minimizam a dose no paciente. As meias-vidas curtas garantem que a exposição do paciente seja limitada ao tempo necessário para o exame.
`;

  return `Gere uma questão de múltipla escolha sobre o seguinte cenário:
${scenarioDescription}

A questão deve avaliar se o aluno compreende as aplicações práticas dos radioisótopos apresentados, relacionando suas meias-vidas, energias e usos clínicos.

IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

Requisitos:
- A questão deve ter 4 alternativas.
- Apenas uma alternativa deve estar correta.
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis, e necessáriamente uma alternativa deve ser absurda e totalmente nada a ver, irônica ou engraçada.
- Foque em aplicações práticas e na escolha adequada de diferentes radioisótopos.
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar.
- Inclua uma explicação detalhada da resposta correta e por que as outras alternativas estão erradas.
- Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario10",
  "title": "Cenário 10: Aplicações de Radioisótopos",
  "question": "[Sua pergunta aqui]",
  "options": [
    {
      "id": "option1",
      "text": "[Texto da primeira alternativa]",
      "isCorrect": true
    },
    {
      "id": "option2",
      "text": "[Texto da segunda alternativa]",
      "isCorrect": false
    },
    {
      "id": "option3",
      "text": "[Texto da terceira alternativa]",
      "isCorrect": false
    },
    {
      "id": "option4",
      "text": "[Texto da quarta alternativa]",
      "isCorrect": false
    }
  ],
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas"
}`;
};

const Scenario10 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastParticleTimeRef = useRef(0);

  // Função para atualizar a configuração e disparar evento
  const updateConfig = useCallback((newConfig) => {
    SCENARIO_CONFIG = newConfig;
    window.dispatchEvent(new CustomEvent('scenarioConfigUpdated'));
  }, []);

  useEffect(() => {
    const fetchScenarioContent = async () => {
      // Se já foi inicializado, não faz nada
      if (isInitialized) return;

      try {
        isInitialized = true; // Marca como inicializado antes da chamada
        const generatedContent = await generateScenarioContent(getScenarioPrompt(scenarioNumber));

        // Verifica se o conteúdo foi gerado corretamente
        if (
          !generatedContent ||
          !generatedContent.successMessage ||
          !generatedContent.detailedExplanation
        ) {
          generatedContent.successMessage =
            'Parabéns! Você demonstrou compreender como as características físicas dos radioisótopos influenciam suas aplicações clínicas.';
          generatedContent.detailedExplanation =
            'A resposta correta relaciona a meia-vida e a energia dos radioisótopos com suas aplicações práticas em diagnóstico ou terapia. Radioisótopos com meias-vidas mais longas e energias mais altas são ideais para terapia, enquanto aqueles com meias-vidas curtas e energias mais baixas são mais adequados para diagnóstico. As outras alternativas não consideram esses aspectos corretamente.';
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario10',
          title: 'MonteCarloQuiz.online PPGEB42 turma 2024/02',
        };

        // Dispara o evento de atualização
        updateConfig(SCENARIO_CONFIG);
      } catch (error) {
        console.error('🔴 Erro ao buscar conteúdo:', error);
        isInitialized = false; // Reset em caso de erro

        // Configuração de fallback
        const fallbackConfig = {
          ...SCENARIO_CONFIG,
          successMessage:
            'Parabéns! Você demonstrou compreender como as características físicas dos radioisótopos influenciam suas aplicações clínicas.',
          detailedExplanation:
            'A resposta correta relaciona a meia-vida e a energia dos radioisótopos com suas aplicações práticas em diagnóstico ou terapia. Radioisótopos com meias-vidas mais longas e energias mais altas são ideais para terapia, enquanto aqueles com meias-vidas curtas e energias mais baixas são mais adequados para diagnóstico. As outras alternativas não consideram esses aspectos corretamente.',
        };

        // Atualiza a configuração com fallback
        SCENARIO_CONFIG = fallbackConfig;
        updateConfig(SCENARIO_CONFIG);
      }
    };

    resetConfig();
    fetchScenarioContent();

    // Cleanup
    return () => {
      // Não reseta isInitialized no cleanup para manter o cache
    };
  }, [updateConfig, scenarioNumber]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const createParticle = () => {
      const angle = Math.random() * 2 * Math.PI;
      const speed = 2;
      return {
        x: SIMULATION_CONFIG.startPoint.x,
        y: SIMULATION_CONFIG.startPoint.y + (Math.random() - 0.5) * 20,
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
        active: true,
        trail: [{ x: SIMULATION_CONFIG.startPoint.x, y: SIMULATION_CONFIG.startPoint.y }],
        creationTime: Date.now(),
      };
    };

    const animate = () => {
      const currentTime = Date.now();
      const config = getSimulationConfig(scenarioNumber);

      if (isPlaying) {
        if (
          currentTime - lastParticleTimeRef.current > config.particleInterval &&
          particlesRef.current.length < config.maxParticles
        ) {
          particlesRef.current.push(createParticle());
          lastParticleTimeRef.current = currentTime;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenhar fundo e label
      ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Cenário ${scenarioNumber}`, canvas.width / 2, 30);

      // Barreira
      const gradient = ctx.createLinearGradient(
        SIMULATION_CONFIG.barrier.x,
        SIMULATION_CONFIG.barrier.y,
        SIMULATION_CONFIG.barrier.x + SIMULATION_CONFIG.barrier.width,
        SIMULATION_CONFIG.barrier.y
      );
      gradient.addColorStop(0, isDark ? '#4b5563' : '#6b7280');
      gradient.addColorStop(1, isDark ? '#374151' : '#9ca3af');
      ctx.fillStyle = gradient;
      ctx.fillRect(
        SIMULATION_CONFIG.barrier.x,
        SIMULATION_CONFIG.barrier.y,
        SIMULATION_CONFIG.barrier.width,
        SIMULATION_CONFIG.barrier.height
      );

      // Fonte
      ctx.beginPath();
      ctx.arc(SIMULATION_CONFIG.startPoint.x, SIMULATION_CONFIG.startPoint.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();

      // Atualiza e desenha partículas
      particlesRef.current = particlesRef.current.filter((particle) => {
        if (!particle.active) return false;

        if (isPlaying) {
          particle.x += particle.vx;
          particle.y += particle.vy;

          if (particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            return false;
          }

          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 10) particle.trail.shift();

          if (
            particle.x >= SIMULATION_CONFIG.barrier.x &&
            particle.x <= SIMULATION_CONFIG.barrier.x + SIMULATION_CONFIG.barrier.width &&
            particle.y >= SIMULATION_CONFIG.barrier.y &&
            particle.y <= SIMULATION_CONFIG.barrier.y + SIMULATION_CONFIG.barrier.height
          ) {
            const rand = Math.random();
            if (rand < config.ricochetProbability) {
              particle.vx = -particle.vx;
              particle.x =
                particle.vx > 0
                  ? SIMULATION_CONFIG.barrier.x + SIMULATION_CONFIG.barrier.width + 1
                  : SIMULATION_CONFIG.barrier.x - 1;
            } else if (rand < config.ricochetProbability + config.transmissionProbability) {
              particle.x = SIMULATION_CONFIG.barrier.x + SIMULATION_CONFIG.barrier.width + 1;
              particle.trail = [{ x: particle.x, y: particle.y }];
            } else {
              return false;
            }
          }
        }

        // Desenha trilha
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        particle.trail.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.stroke();

        // Desenha partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isDark, scenarioNumber]);

  // A parte dos gráficos permanece a mesma que antes
  // Função de cálculo de decaimento
  const calculateDecay = (halfLife, time) => {
    const decayConstant = Math.log(2) / halfLife;
    return 100 * Math.exp(-decayConstant * time);
  };

  // Dados específicos para cada cenário
  const getScenarioData = () => {
    if (scenarioNumber === 1) {
      // Cenário I - Terapia (dias)
      return {
        decayData: Array.from({ length: 100 }, (_, i) => ({
          tempo: i,
          ir192: calculateDecay(74, i), // Meia-vida 74 dias
          i131: calculateDecay(8, i), // Meia-vida 8 dias
          lu177: calculateDecay(6.6, i), // Meia-vida 6.6 dias
        })),
        energyData: Array.from({ length: 800 }, (_, i) => ({
          energia: i,
          ir192:
            (i === 316 ? 1000 : i === 468 ? 900 : 100 * Math.exp(-(Math.pow(i - 375, 2) / 400))) +
            Math.random() * 20,
          i131:
            i === 364 ? 950 : 100 * Math.exp(-(Math.pow(i - 364, 2) / 300)) + Math.random() * 20,
          lu177:
            i === 208 ? 850 : 100 * Math.exp(-(Math.pow(i - 208, 2) / 250)) + Math.random() * 20,
        })),
      };
    } else {
      // Cenário II - Diagnóstico (horas)
      return {
        decayData: Array.from({ length: 48 }, (_, i) => ({
          tempo: i,
          tc99m: calculateDecay(6, i), // Meia-vida 6 horas
          i123: calculateDecay(13, i), // Meia-vida 13 horas
        })),
        energyData: Array.from({ length: 800 }, (_, i) => ({
          energia: i,
          tc99m:
            i === 140 ? 1000 : 100 * Math.exp(-(Math.pow(i - 140, 2) / 200)) + Math.random() * 20,
          i123:
            i === 159 ? 900 : 100 * Math.exp(-(Math.pow(i - 159, 2) / 200)) + Math.random() * 20,
        })),
      };
    }
  };

  const { decayData, energyData } = getScenarioData();
  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        className={`border rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      />

      <div className={`w-full grid grid-cols-1 gap-4 mt-4`}>
        <div className="h-72 border rounded-lg shadow-md p-4">
          <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>
            {scenarioNumber === 1
              ? 'Decaimento - Radioisótopos Terapêuticos'
              : 'Decaimento - Radioisótopos Diagnósticos'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={decayData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="tempo"
                label={{
                  value: scenarioNumber === 1 ? 'Tempo (dias)' : 'Tempo (horas)',
                  position: 'insideBottomRight',
                  offset: -10,
                  fill: isDark ? '#e5e7eb' : '#1f2937',
                  fontSize: 12,
                }}
                stroke={isDark ? '#e5e7eb' : '#1f2937'}
              />
              <YAxis
                domain={[0, 100]}
                label={{
                  value: 'Atividade (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: isDark ? '#e5e7eb' : '#1f2937',
                  fontSize: 12,
                }}
                stroke={isDark ? '#e5e7eb' : '#1f2937'}
              />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }} />
              <Legend
                verticalAlign="top"
                align="right"
                iconSize={10}
                wrapperStyle={{ top: -10, right: 0, fontSize: '10px' }}
              />
              {scenarioNumber === 1 ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="ir192"
                    name="Ir-192 (T₁/₂: 74d)"
                    stroke="#dc2626"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="i131"
                    name="I-131 (T₁/₂: 8d)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="lu177"
                    name="Lu-177 (T₁/₂: 6.6d)"
                    stroke="#f87171"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="tc99m"
                    name="Tc-99m (T₁/₂: 6h)"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="i123"
                    name="I-123 (T₁/₂: 13h)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72 border rounded-lg shadow-md p-4">
          <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>
            {scenarioNumber === 1
              ? 'Espectro de Energia - Radioisótopos Terapêuticos'
              : 'Espectro de Energia - Radioisótopos Diagnósticos'}
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={energyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="energia"
                label={{
                  value: 'Energia (keV)',
                  position: 'insideBottomRight',
                  offset: -10,
                  fill: isDark ? '#e5e7eb' : '#1f2937',
                  fontSize: 12,
                }}
                stroke={isDark ? '#e5e7eb' : '#1f2937'}
              />
              <YAxis
                label={{
                  value: 'Contagens Relativas',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 0,
                  fill: isDark ? '#e5e7eb' : '#1f2937',
                  fontSize: 12,
                }}
                stroke={isDark ? '#e5e7eb' : '#1f2937'}
              />
              <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#ffffff' }} />
              <Legend
                verticalAlign="top"
                align="right"
                iconSize={10}
                wrapperStyle={{ top: -10, right: 0, fontSize: '10px' }}
              />
              {scenarioNumber === 1 ? (
                <>
                  <Line
                    type="monotone"
                    dataKey="ir192"
                    name="Ir-192 (316/468 keV)"
                    stroke="#dc2626"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="i131"
                    name="I-131 (364 keV)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Line
                    type="monotone"
                    dataKey="lu177"
                    name="Lu-177 (208 keV)"
                    stroke="#f87171"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                </>
              ) : (
                <>
                  <Line
                    type="monotone"
                    dataKey="tc99m"
                    name="Tc-99m (140 keV)"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="i123"
                    name="I-123 (159 keV)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

Scenario10.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};

// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario10);
