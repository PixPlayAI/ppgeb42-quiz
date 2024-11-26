// src/components/scenarios/Scenario5.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario5',
  title: 'Cenário II: Experimento de Rutherford',
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
};

// Função para resetar a configuração
const resetConfig = () => {
  SCENARIO_CONFIG = {
    id: 'scenario5',
    title: 'Cenário II: Experimento de Rutherford',
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
  };
};

const SIMULATION_CONFIG = {
  emissionArea: {
    x: 30,
    y: 135,
    width: 20,
    height: 20,
  },
  cannon: {
    x: 20,
    y: 125,
    width: 40,
    height: 40,
  },
  electricField: {
    x: 150,
    y: 50,
    width: 200,
    height: 200,
  },
  poles: {
    positive: { x: 250, y: 30 },
    negative: { x: 250, y: 270 },
  },
  screen: {
    x: 370,
    y: 50,
    width: 10,
    height: 200,
  },
  particleTypes: [
    {
      type: 'alpha',
      color: '#f97316',
      charge: '+',
      mass: 'alta',
      deflectionCoefficient: 0.05,
    },
    {
      type: 'beta',
      color: '#3b82f6',
      charge: '-',
      mass: 'baixa',
      deflectionCoefficient: -0.02,
    },
    {
      type: 'gamma',
      color: '#10b981',
      charge: '0',
      mass: 'nenhuma',
      deflectionCoefficient: 0,
    },
  ],
  emissionRate: 5,
  maxParticles: 500,
  reflectionProbability: 0.55,
};
const scenarioPrompt = `
Gere uma questão de múltipla escolha sobre o seguinte cenário:

No experimento de Rutherford, partículas são emitidas de uma fonte e passam por um forte campo elétrico.
Observa-se que:
- Partículas BETA (LARANJAS) são fortemente atraídas para o campo positivo
- Partículas ALFA (AZUIS) são atraídas para o polo negativo
- Partículas GAMA não sofrem alteração na trajetória

A questão deve avaliar se o aluno sabe identificar as partículas ALFA, BETA e GAMA e explicar por que elas sofrem ou não alteração em suas trajetórias.

Requisitos:
- A questão deve ter 4 alternativas
- Apenas uma alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis
- Foque no comportamento das partículas em campos elétricos

Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario5",
  "title": "Cenário II: Experimento de Rutherford",
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
  ]
}`;

const Scenario5 = ({ isPlaying, isDark }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationFrameRef = useRef(null);
  const hasUpdated = useRef(false);
  const fetchingRef = useRef(false); // Novo ref para controlar o estado de fetch

  const updateConfig = useCallback((newConfig) => {
    if (!hasUpdated.current) {
      console.log('📝 Atualizando config pela primeira vez');
      SCENARIO_CONFIG = newConfig;
      hasUpdated.current = true;
      window.dispatchEvent(new CustomEvent('scenarioConfigUpdated'));
    }
  }, []);

  useEffect(() => {
    const fetchScenarioContent = async () => {
      // Previne múltiplas chamadas simultâneas
      if (hasUpdated.current || fetchingRef.current) return;

      try {
        fetchingRef.current = true;

        // Reset a configuração antes de fazer a nova requisição
        resetConfig();

        // Força um pequeno delay para garantir que o estado "Carregando..." seja renderizado
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Faz a chamada à API
        const generatedContent = await generateScenarioContent(scenarioPrompt);
        updateConfig(generatedContent);
      } catch (error) {
        console.error('🔴 Erro ao buscar conteúdo:', error);
        updateConfig(SCENARIO_CONFIG);
      } finally {
        fetchingRef.current = false;
      }
    };

    // Reset inicial
    resetConfig();

    // Inicia o fetch
    fetchScenarioContent();

    // Cleanup function
    return () => {
      resetConfig();
      hasUpdated.current = false;
      fetchingRef.current = false;
    };
  }, [updateConfig]); // Dependência única

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const createParticle = () => {
      const particleType =
        SIMULATION_CONFIG.particleTypes[
          Math.floor(Math.random() * SIMULATION_CONFIG.particleTypes.length)
        ];
      const angle = (Math.random() - 0.5) * (Math.PI / 16);
      const speed = 2 + Math.random();

      const emissionX =
        SIMULATION_CONFIG.emissionArea.x + Math.random() * SIMULATION_CONFIG.emissionArea.width;
      const emissionY =
        SIMULATION_CONFIG.emissionArea.y + Math.random() * SIMULATION_CONFIG.emissionArea.height;

      return {
        id: `${particleType.type}-${Date.now()}-${Math.random()}`,
        type: particleType.type,
        color: particleType.color,
        x: emissionX,
        y: emissionY,
        vx: speed * Math.cos(angle),
        vy: speed * Math.sin(angle),
        deflectionCoefficient: particleType.deflectionCoefficient,
        active: true,
        trail: [{ x: emissionX, y: emissionY }],
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cenário II', canvas.width / 2, 30);

      const field = SIMULATION_CONFIG.electricField;
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(field.x, field.y, field.width, field.height);
      ctx.globalAlpha = 1.0;

      const { positive, negative } = SIMULATION_CONFIG.poles;

      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(positive.x, positive.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('+', positive.x, positive.y + 4);

      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(negative.x, negative.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('-', negative.x, negative.y + 4);

      const screen = SIMULATION_CONFIG.screen;
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(screen.x, screen.y, screen.width, screen.height);

      if (isPlaying) {
        for (let i = 0; i < SIMULATION_CONFIG.emissionRate; i++) {
          if (particles.current.length < SIMULATION_CONFIG.maxParticles) {
            particles.current.push(createParticle());
          }
        }

        particles.current = particles.current.filter((particle) => {
          if (!particle.active) return false;

          particle.x += particle.vx;
          particle.y += particle.vy;

          if (
            particle.x >= SIMULATION_CONFIG.electricField.x &&
            particle.x <= SIMULATION_CONFIG.electricField.x + SIMULATION_CONFIG.electricField.width
          ) {
            particle.vy += particle.deflectionCoefficient;
          }

          if (particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            return false;
          }

          if (
            particle.x >= screen.x &&
            particle.x <= screen.x + screen.width &&
            particle.y >= screen.y &&
            particle.y <= screen.y + screen.height
          ) {
            const rand = Math.random();
            if (rand < SIMULATION_CONFIG.reflectionProbability) {
              particle.vx = -particle.vx;
              particle.x = screen.x - 1;
            } else {
              return false;
            }
          }

          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 20) particle.trail.shift();

          return true;
        });
      }

      particles.current.forEach((particle) => {
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        particle.trail.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = `${particle.color}80`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      const cannon = SIMULATION_CONFIG.cannon;
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(cannon.x, cannon.y, cannon.width, cannon.height);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isDark]);

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={300}
      className={`border rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    />
  );
};

Scenario5.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export const getScenarioConfig = () => SCENARIO_CONFIG;
export { SCENARIO_CONFIG };
export default React.memo(Scenario5);
