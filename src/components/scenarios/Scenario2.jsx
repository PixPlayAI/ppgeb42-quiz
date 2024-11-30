import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario2',
  title: 'Cenário II: Atenuação de Radiação 2D',
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
    id: 'scenario2',
    title: 'Cenário II: Atenuação de Radiação 2D',
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

const scenarioPrompt = `Gere uma questão de múltipla escolha sobre o seguinte cenário:
São mostrados dois cenários de atenuação de radiação:
- No primeiro cenário, a radiação atravessa uma barreira com baixo coeficiente de atenuação
- No segundo cenário, a radiação atravessa uma barreira com alto coeficiente de atenuação
- Em ambos os cenários, as partículas podem ser refletidas, transmitidas ou absorvidas

A questão deve avaliar se o aluno compreende os conceitos de atenuação de radiação e blindagem.

Requisitos:
- A questão deve ter 4 alternativas
- Apenas uma alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis
- Foque nos conceitos de atenuação, blindagem e materiais atenuadores
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar
- Inclua uma explicação detalhada da resposta correta e porque as outras alternativas estão erradas

Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario2",
  "title": "Cenário II: Atenuação de Radiação 2D",
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
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou], não cite alternativa abcd ou 1234 pois elas são embaralhadas",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta], não cite alternativa abcd ou 1234 pois elas são embaralhadas"
}`;

const getSimulationConfig = (scenarioNumber) => {
  return {
    transmissionProbability: 1,
    ricochetProbability: scenarioNumber === 2 ? 0.55 : 0.05,
    deflectionProbability: 0,
  };
};

const Scenario2 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
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
        const generatedContent = await generateScenarioContent(scenarioPrompt);

        // Verifica se o conteúdo foi gerado corretamente
        if (!generatedContent.successMessage || !generatedContent.detailedExplanation) {
          generatedContent.successMessage =
            'Parabéns! Você demonstrou compreender corretamente os conceitos de atenuação de radiação e como diferentes materiais e espessuras afetam a penetração da radiação.';
          generatedContent.detailedExplanation =
            'A resposta correta considera que:\n' +
            '1. O coeficiente de atenuação linear (μ) é uma propriedade do material\n' +
            '2. Quanto maior o coeficiente de atenuação, maior a blindagem\n' +
            '3. A atenuação depende tanto do material quanto da espessura\n\n' +
            'As outras alternativas estão incorretas porque:\n' +
            '- Confundem os conceitos de intensidade e atenuação\n' +
            '- Interpretam erroneamente a relação entre espessura e atenuação\n' +
            '- Fazem associações equivocadas entre tipos de radiação e penetração';
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario2',
          title: 'Cenário II: Atenuação de Radiação 2D',
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
            'Parabéns! Você demonstrou compreender corretamente os conceitos de atenuação de radiação e como diferentes materiais e espessuras afetam a penetração da radiação.',
          detailedExplanation:
            'A resposta correta considera que:\n' +
            '1. O coeficiente de atenuação linear (μ) é uma propriedade do material\n' +
            '2. Quanto maior o coeficiente de atenuação, maior a blindagem\n' +
            '3. A atenuação depende tanto do material quanto da espessura\n\n' +
            'As outras alternativas estão incorretas porque:\n' +
            '- Confundem os conceitos de intensidade e atenuação\n' +
            '- Interpretam erroneamente a relação entre espessura e atenuação\n' +
            '- Fazem associações equivocadas entre tipos de radiação e penetração',
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
  }, [updateConfig]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particleInterval = 10;

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

      if (isPlaying) {
        if (
          currentTime - lastParticleTimeRef.current > particleInterval &&
          particlesRef.current.length < 200
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
            const config = getSimulationConfig(scenarioNumber);
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

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className={`border rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    />
  );
};

Scenario2.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};

// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario2);
