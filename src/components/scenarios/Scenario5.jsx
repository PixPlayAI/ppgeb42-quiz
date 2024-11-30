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
  successMessage: 'Carregando...',
  detailedExplanation: 'Carregando...',
};

// Variável para controlar a inicialização
let isInitialized = false;

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
    successMessage: 'Carregando...',
    detailedExplanation: 'Carregando...',
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
    positive: { x: 250, y: 270 },
    negative: { x: 250, y: 30 },
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

A questão deve avaliar se o aluno sabe identificar as partículas ALFA, BETA e GAMA e explicar por que elas sofrem ou não alteração em suas trajetórias. IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário ler tudo e marcar a resposta correta.


Requisitos:
- A questão deve ter 4 alternativas
- Apenas uma alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis e uma alternativa deve ser absurda e totalmente nada a ver irônica ou engraçada.
- Foque no comportamento das partículas em campos elétricos
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar
- Inclua uma explicação detalhada da resposta correta e porque as outras alternativas estão erradas
- Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário ler tudo e marcar a resposta correta.


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
  ],
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou], não cite alternativa abcd ou 1234 pois elas são embaralhadas",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta], não cite alternativa abcd ou 1234 pois elas são embaralhadas"
}`;

const Scenario5 = ({ isPlaying, isDark }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationFrameRef = useRef(null);
  //const labelRef = useRef(null);

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
          // Se não tiver as mensagens, adiciona mensagens padrão relacionadas ao contexto
          generatedContent.successMessage = `Parabéns! Você demonstrou compreender corretamente como as partículas alfa, beta e gama interagem com campos elétricos. Sua resposta mostra que você entende que partículas carregadas são defletidas de acordo com sua carga, enquanto partículas neutras não são afetadas.`;

          generatedContent.detailedExplanation = `No experimento de Rutherford:
1. Partículas alfa (positivas) são atraídas para o polo negativo devido à força elétrica
2. Partículas beta (negativas) são atraídas para o polo positivo devido à força elétrica oposta
3. Partículas gama (neutras) não sofrem deflexão por não terem carga elétrica

As outras alternativas estão incorretas porque:
- Confundem as cargas das partículas
- Não consideram corretamente a interação entre cargas elétricas
- Ignoram o princípio fundamental de que cargas opostas se atraem e cargas iguais se repelem`;
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario5',
          title: 'Cenário II: Experimento de Rutherford',
        };

        // Dispara o evento de atualização
        updateConfig(SCENARIO_CONFIG);
      } catch (error) {
        console.error('🔴 Erro ao buscar conteúdo:', error);
        isInitialized = false; // Reset em caso de erro

        // Configuração de fallback
        const fallbackConfig = {
          ...SCENARIO_CONFIG,
          successMessage: `Parabéns! Você demonstrou compreender corretamente como as partículas alfa, beta e gama interagem com campos elétricos. Sua resposta mostra que você entende que partículas carregadas são defletidas de acordo com sua carga, enquanto partículas neutras não são afetadas.`,

          detailedExplanation: `No experimento de Rutherford:
1. Partículas alfa (positivas) são atraídas para o polo negativo devido à força elétrica
2. Partículas beta (negativas) são atraídas para o polo positivo devido à força elétrica oposta
3. Partículas gama (neutras) não sofrem deflexão por não terem carga elétrica

As outras alternativas estão incorretas porque:
- Confundem as cargas das partículas
- Não consideram corretamente a interação entre cargas elétricas
- Ignoram o princípio fundamental de que cargas opostas se atraem e cargas iguais se repelem`,
        };

        // Atualiza a configuração com fallback
        SCENARIO_CONFIG = fallbackConfig;
        updateConfig(SCENARIO_CONFIG);
      }
    };

    // Reset inicial
    resetConfig();

    // Inicia o fetch
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
      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fundo
      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cenário II', canvas.width / 2, 30);

      // Campo Elétrico
      const field = SIMULATION_CONFIG.electricField;
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(field.x, field.y, field.width, field.height);
      ctx.globalAlpha = 1.0;

      // Polos
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

      // Tela de Detecção
      const screen = SIMULATION_CONFIG.screen;
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(screen.x, screen.y, screen.width, screen.height);

      if (isPlaying) {
        // Emissão de partículas
        for (let i = 0; i < SIMULATION_CONFIG.emissionRate; i++) {
          if (particles.current.length < SIMULATION_CONFIG.maxParticles) {
            particles.current.push(createParticle());
          }
        }

        // Atualização das partículas
        particles.current = particles.current.filter((particle) => {
          if (!particle.active) return false;

          // Atualiza posição
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Interação com o campo elétrico
          if (
            particle.x >= SIMULATION_CONFIG.electricField.x &&
            particle.x <= SIMULATION_CONFIG.electricField.x + SIMULATION_CONFIG.electricField.width
          ) {
            particle.vy += particle.deflectionCoefficient;
          }

          // Verifica se a partícula saiu do canvas
          if (particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            return false;
          }

          // Interação com a tela de detecção
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

          // Atualiza a trilha da partícula
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 20) particle.trail.shift();

          return true;
        });
      }

      // Desenha as partículas
      particles.current.forEach((particle) => {
        // Desenha a trilha
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        particle.trail.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = `${particle.color}80`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Desenha a partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Desenha o canhão
      const cannon = SIMULATION_CONFIG.cannon;
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(cannon.x, cannon.y, cannon.width, cannon.height);

      // Solicita o próximo frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Inicia a animação
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup
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

// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario5);
