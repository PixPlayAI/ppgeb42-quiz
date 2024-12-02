// src/components/scenarios/Scenario13.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario13',
  title: 'Cenário III: Penetração de Radiação',
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
    id: 'scenario13',
    title: 'Cenário III: Penetração de Radiação',
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

// SIMULATION_CONFIG para este cenário
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
  barriers: [
    {
      name: 'Papel',
      x: 150,
      y: 50,
      width: 10,
      height: 200,
    },
    {
      name: 'Alumínio',
      x: 250,
      y: 50,
      width: 10,
      height: 200,
    },
  ],
  particleTypes: [
    {
      type: 'alpha',
      color: '#3b82f6', // azul
      interaction: {
        papel: 'reflect',
        alumínio: 'pass',
      },
    },
    {
      type: 'beta',
      color: '#f97316', // laranja
      interaction: {
        papel: 'pass',
        alumínio: 'reflect',
      },
    },
    {
      type: 'gamma',
      color: '#10b981', // verde
      interaction: {
        papel: 'pass',
        alumínio: 'pass',
      },
    },
  ],
  emissionRate: 2,
  emissionInterval: 100,
  maxParticles: 500,
};

const scenarioPrompt = `
Gere uma questão de múltipla escolha sobre o seguinte cenário:

No experimento de penetração de radiação, partículas são emitidas de uma fonte e passam por dois anteparos:

- O primeiro é uma folha de papel fina.
- O segundo é uma placa de alumínio de espessura fina.

Observa-se que:

- Partículas BETA (LARANJAS) passam pela folha de papel mas são refletidas pela placa de alumínio.
- Partículas ALFA (AZUIS) são refletidas pela folha de papel.
- Partículas GAMA (VERDES) passam por ambos os materiais sem alteração em sua trajetória.

A questão deve avaliar se o aluno sabe identificar as partículas ALFA, BETA e GAMA e explicar por que elas são detidas ou não pelos materiais, incluindo informações como:

- A radiação alfa é equivalente ao núcleo de hélio (2 prótons e 2 nêutrons), possui alta ionização e baixo poder de penetração, sendo barrada por uma folha de papel.
- A radiação beta é composta por elétrons de alta energia, sendo mais penetrante que as partículas alfa, mas ainda pode ser detida por materiais como o alumínio.
- A radiação gama é uma onda eletromagnética de alta energia, com alto poder de penetração, atravessando facilmente ambos os anteparos.

IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

Requisitos:
- A questão deve ter 4 alternativas
- Apenas uma alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis, e uma alternativa deve ser absurda e totalmente nada a ver, irônica ou engraçada.
- Foque no comportamento das partículas ao interagir com diferentes materiais
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar
- Inclua uma explicação detalhada da resposta correta e por que as outras alternativas estão erradas
- Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário ler tudo e marcar a resposta correta.

Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario13",
  "title": "Cenário III: Penetração de Radiação",
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
  "successMessage": "[Mensagem de parabéns explicando por que a resposta está correta e reforçando o conceito que o aluno dominou, importante não citar os números da alternativa como por exemplo primeira, segunda, terceira, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas]",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta, importante não citar os números da alternativa como por exemplo primeira, segunda, terceira, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas]"
}
`;

const Scenario13 = ({ isPlaying, isDark }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animationFrameRef = useRef(null);
  const lastEmissionTimeRef = useRef(Date.now());

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
          generatedContent.successMessage = `Parabéns! Você compreendeu como as diferentes radiações interagem com materiais diversos. Sua resposta indica conhecimento sobre a penetração e composição das partículas alfa, beta e gama.`;

          generatedContent.detailedExplanation =
            'A radiação alfa, composta por núcleos de hélio (2 prótons e 2 nêutrons), tem alto poder de ionização mas baixo poder de penetração, sendo bloqueada por uma folha de papel. ' +
            'A radiação beta é formada por elétrons de alta energia, com poder de penetração maior que alfa, mas é detida por materiais como alumínio. ' +
            'A radiação gama é uma onda eletromagnética de alta energia e alto poder de penetração, atravessando facilmente ambos os anteparos. ' +
            'As outras alternativas estão incorretas pois não refletem corretamente as propriedades de penetração e composição das radiações.';
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario13',
          title: 'Cenário III: Penetração de Radiação',
        };

        // Dispara o evento de atualização
        updateConfig(SCENARIO_CONFIG);
      } catch (error) {
        console.error('🔴 Erro ao buscar conteúdo:', error);
        isInitialized = false; // Reset em caso de erro

        // Configuração de fallback
        const fallbackConfig = {
          ...SCENARIO_CONFIG,
          successMessage: `Parabéns! Você compreendeu como as diferentes radiações interagem com materiais diversos. Sua resposta indica conhecimento sobre a penetração e composição das partículas alfa, beta e gama.`,

          detailedExplanation:
            'A radiação alfa, composta por núcleos de hélio (2 prótons e 2 nêutrons), tem alto poder de ionização mas baixo poder de penetração, sendo bloqueada por uma folha de papel. ' +
            'A radiação beta é formada por elétrons de alta energia, com poder de penetração maior que alfa, mas é detida por materiais como alumínio. ' +
            'A radiação gama é uma onda eletromagnética de alta energia e alto poder de penetração, atravessando facilmente ambos os anteparos. ' +
            'As outras alternativas estão incorretas pois não refletem corretamente as propriedades de penetração e composição das radiações.',
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
        active: true,
        trail: [{ x: emissionX, y: emissionY }],
      };
    };

    const animate = () => {
      const currentTime = Date.now();

      // Limpa o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fundo
      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Título
      ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cenário III', canvas.width / 2, 30);

      // Desenha os anteparos
      SIMULATION_CONFIG.barriers.forEach((barrier) => {
        ctx.fillStyle = '#6b7280';
        ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(barrier.name, barrier.x + barrier.width / 2, barrier.y - 5);
      });

      if (isPlaying) {
        // Emissão de partículas baseada em intervalo de tempo
        if (
          currentTime - lastEmissionTimeRef.current >= SIMULATION_CONFIG.emissionInterval &&
          particles.current.length < SIMULATION_CONFIG.maxParticles
        ) {
          for (let i = 0; i < SIMULATION_CONFIG.emissionRate; i++) {
            particles.current.push(createParticle());
          }
          lastEmissionTimeRef.current = currentTime;
        }

        // Atualização das partículas
        particles.current = particles.current.filter((particle) => {
          if (!particle.active) return false;

          // Atualiza posição
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Interação com os anteparos
          SIMULATION_CONFIG.barriers.forEach((barrier) => {
            if (
              particle.x >= barrier.x &&
              particle.x <= barrier.x + barrier.width &&
              particle.y >= barrier.y &&
              particle.y <= barrier.y + barrier.height
            ) {
              const interaction = SIMULATION_CONFIG.particleTypes.find(
                (pt) => pt.type === particle.type
              ).interaction[barrier.name.toLowerCase()];

              if (interaction === 'reflect') {
                particle.vx = -particle.vx;
                particle.x = barrier.x - 1; // Move a partícula para fora do anteparo
              } else if (interaction === 'pass') {
                // Nada acontece, partícula continua
              } else {
                // Se não houver interação definida, desativa a partícula
                particle.active = false;
              }
            }
          });

          // Verifica se a partícula saiu do canvas
          if (particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            return false;
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

Scenario13.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
};

// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario13);
