import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario3',
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
    id: 'scenario3',
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
Nesta simulação 2D, são mostrados dois cenários de atenuação de radiação:
- No primeiro cenário há uma emissão intensa com muitas partículas a partir da fonte, bem mais radioativa.
- No segundo cenário há uma emissão bem menor e e espaçada da fonte, bem menos radioativa.
- Em ambos os casos as partículas podem ser refletidas, transmitidas ou absorvidas pela barreira

A questão deve avaliar se o aluno compreende as aplicações práticas dessas diferentes intensidades de radiação, por exemplo uma baixa radiação pode ser aplicável a um exame diagnóstico (ex.: cintilografia) já alta radiação pode ser aplicável a um Tratamento ( ex.: radioterapia). IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário ler tudo e marcar a resposta correta.

Requisitos:
- A questão deve ter 4 alternativas
- Apenas uma alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis e uma alternativa deve ser absurda e totalmente nada a ver irônica ou engraçada.
- Foque em aplicações práticas e na escolha adequada de diferentes radioisótopos
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar
- Inclua uma explicação detalhada da resposta correta e porque as outras alternativas estão erradas
- Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário ler tudo e marcar a resposta correta.


Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario3",
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
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas"
}`;
const getSimulationConfig = (scenarioNumber) => {
  return {
    particleInterval: scenarioNumber === 1 ? 5 : 50,
    maxParticles: scenarioNumber === 1 ? 400 : 40,
    ricochetProbability: 0.8,
    transmissionProbability: 0.15,
  };
};
const Scenario3 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
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
            'Parabéns! Você demonstrou compreender como diferentes intensidades de radiação podem ser aplicadas em contextos específicos, considerando tanto aspectos de segurança quanto eficácia terapêutica.';
          generatedContent.detailedExplanation =
            'A resposta correta considera que diferentes intensidades de radiação são adequadas para diferentes aplicações e que a escolha do radioisótopo deve levar em conta não apenas a intensidade, mas também o tipo de radiação emitida. ' +
            'Além disso, a atenuação da radiação é um fator essencial tanto para a segurança quanto para a eficácia das aplicações. ' +
            'As outras respostas estão incorretas porque confundem as aplicações apropriadas para cada intensidade de radiação, apresentam interpretações equivocadas sobre atenuação e blindagem, ou estabelecem associações inadequadas entre radioisótopos e suas possíveis aplicações.Não cite o número da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas';
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario3',
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
            'Parabéns! Você demonstrou compreender como diferentes intensidades de radiação podem ser aplicadas em contextos específicos, considerando tanto aspectos de segurança quanto eficácia terapêutica.',
          detailedExplanation:
            'A resposta correta considera que diferentes intensidades de radiação são mais apropriadas para diferentes tipos de aplicações. Além disso, a escolha do radioisótopo deve levar em conta não apenas a intensidade da radiação, mas também o tipo de radiação emitida, para garantir segurança e eficácia. A atenuação da radiação é um aspecto fundamental que influencia diretamente na proteção e no desempenho da aplicação. ' +
            'As outras respostas estão incorretas porque apresentam confusão sobre quais aplicações são adequadas para cada intensidade de radiação, interpretam de forma errada os conceitos de atenuação e blindagem, ou estabelecem associações imprecisas entre os radioisótopos e suas utilizaçõesNão cite o número da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas.',
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
      const config = getSimulationConfig(scenarioNumber); // Atualizar aqui

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

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={300}
      className={`border rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    />
  );
};

Scenario3.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};

// Função para obter a configuração do cenário
// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario3);
