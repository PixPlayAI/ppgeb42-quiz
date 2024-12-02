// src/components/scenarios/Scenario13.jsx

import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial do cenário, com valores padrão de "Carregando..."
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

// Variável para controlar se o cenário já foi inicializado
let isInitialized = false;

// Função para resetar a configuração do cenário para o estado inicial
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

// Configurações específicas da simulação para este cenário
const SIMULATION_CONFIG = {
  // Área de emissão das partículas (posição e dimensões)
  emissionArea: {
    x: 30,
    y: 135,
    width: 20,
    height: 20,
  },
  // Configurações do "canhão" que emite as partículas
  cannon: {
    x: 20,
    y: 125,
    width: 40,
    height: 40,
  },
  // Configurações dos anteparos (barreiras)
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
  // Tipos de partículas e suas interações com os materiais
  particleTypes: [
    {
      type: 'alpha',
      color: '#3b82f6', // Azul para partículas alfa
      interaction: {
        papel: 'reflect', // Partícula alfa é refletida pelo papel
        alumínio: 'pass', // Partícula alfa passa pelo alumínio
      },
    },
    {
      type: 'beta',
      color: '#f97316', // Laranja para partículas beta
      interaction: {
        papel: 'pass', // Partícula beta passa pelo papel
        alumínio: 'reflect', // Partícula beta é refletida pelo alumínio
      },
    },
    {
      type: 'gamma',
      color: '#10b981', // Verde para partículas gama
      interaction: {
        papel: 'pass', // Partícula gama passa pelo papel
        alumínio: 'pass', // Partícula gama passa pelo alumínio
      },
    },
  ],
  emissionRate: 2, // Número de partículas emitidas por vez
  emissionInterval: 100, // Intervalo de tempo entre emissões (ms)
  maxParticles: 500, // Número máximo de partículas simultâneas na cena
};

// Prompt que é enviado para a API do OpenAI para gerar o conteúdo do cenário.
// Modifique este texto se quiser alterar o comportamento da geração de conteúdo.
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

// Componente principal do cenário
const Scenario13 = ({ isPlaying, isDark }) => {
  // Referência para o elemento canvas
  const canvasRef = useRef(null);
  // Lista de partículas ativas na cena
  const particles = useRef([]);
  // Referência para controlar o loop de animação
  const animationFrameRef = useRef(null);
  // Referência para controlar o tempo da última emissão de partículas
  const lastEmissionTimeRef = useRef(Date.now());

  // Função para atualizar a configuração e disparar evento personalizado
  const updateConfig = useCallback((newConfig) => {
    SCENARIO_CONFIG = newConfig;
    window.dispatchEvent(new CustomEvent('scenarioConfigUpdated'));
  }, []);

  // Efeito para buscar o conteúdo do cenário usando a API do OpenAI
  useEffect(() => {
    const fetchScenarioContent = async () => {
      // Se já foi inicializado, não faz nada
      if (isInitialized) return;

      try {
        isInitialized = true; // Marca como inicializado antes da chamada

        // Chama a função para gerar o conteúdo do cenário
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

        // Atualiza a configuração com o conteúdo gerado
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

        // Configuração de fallback com mensagens padrão
        const fallbackConfig = {
          ...SCENARIO_CONFIG,
          successMessage: `Parabéns! Você compreendeu como as diferentes radiações interagem com materiais diversos. Sua resposta indica conhecimento sobre a penetração e composição das partículas alfa, beta e gama.`,

          detailedExplanation:
            'A radiação alfa, composta por núcleos de hélio (2 prótons e 2 nêutrons), tem alto poder de ionização mas baixo poder de penetração, sendo bloqueada por uma folha de papel. ' +
            'A radiação beta é formada por elétrons de alta energia, com poder de penetração maior que alfa, mas é detida por materiais como alumínio. ' +
            'A radiação gama é uma onda eletromagnética de alta energia e alto poder de penetração, atravessando facilmente ambos os anteparos. ' +
            'As outras alternativas estão incorretas pois não refletem corretamente as propriedades de penetração e composição das radiações.',
        };

        // Atualiza a configuração com o fallback
        SCENARIO_CONFIG = fallbackConfig;
        updateConfig(SCENARIO_CONFIG);
      }
    };

    // Reseta a configuração inicial
    resetConfig();

    // Inicia a busca do conteúdo do cenário
    fetchScenarioContent();

    // Cleanup
    return () => {
      // Não reseta isInitialized no cleanup para manter o cache
    };
  }, [updateConfig]);

  // Efeito para a lógica de animação e renderização do cenário
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Função para criar uma nova partícula
    const createParticle = () => {
      // Seleciona aleatoriamente um tipo de partícula (alfa, beta ou gama)
      const particleType =
        SIMULATION_CONFIG.particleTypes[
          Math.floor(Math.random() * SIMULATION_CONFIG.particleTypes.length)
        ];
      // Define um ângulo aleatório ligeiramente variado
      const angle = (Math.random() - 0.5) * (Math.PI / 16);
      // Define uma velocidade aleatória dentro de um intervalo
      const speed = 2 + Math.random();

      // Posição inicial de emissão dentro da área definida
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
        vx: speed * Math.cos(angle), // Componente x da velocidade
        vy: speed * Math.sin(angle), // Componente y da velocidade
        active: true,
        trail: [{ x: emissionX, y: emissionY }], // Trilhas para desenhar o caminho percorrido
      };
    };

    // Função principal de animação que será chamada em loop
    const animate = () => {
      const currentTime = Date.now();

      // Limpa o canvas para redesenhar a cena
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenha o fundo
      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenha o título do cenário
      ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Cenário III', canvas.width / 2, 30);

      // Desenha os anteparos (barreiras)
      SIMULATION_CONFIG.barriers.forEach((barrier) => {
        ctx.fillStyle = '#6b7280'; // Cor do anteparo
        ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937'; // Cor do texto
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

        // Atualização das partículas existentes
        particles.current = particles.current.filter((particle) => {
          if (!particle.active) return false;

          // Atualiza a posição da partícula com base em sua velocidade
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
              // Obtém o tipo de interação da partícula com o material do anteparo
              const interaction = SIMULATION_CONFIG.particleTypes.find(
                (pt) => pt.type === particle.type
              ).interaction[barrier.name.toLowerCase()];

              if (interaction === 'reflect') {
                // Se a interação for "reflect", inverte a velocidade em x (reflexão horizontal)
                particle.vx = -particle.vx;
                particle.x = barrier.x - 1; // Move a partícula um pixel para fora do anteparo para evitar múltiplas colisões
              } else if (interaction === 'pass') {
                // Se a interação for "pass", a partícula continua sem alteração
                // Exemplo: Partículas gama passam por todos os materiais
              } else {
                // Se não houver interação definida, desativa a partícula
                particle.active = false;
              }
            }
          });

          // Verifica se a partícula saiu dos limites do canvas
          if (particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            return false; // Remove a partícula da lista
          }

          // Atualiza a trilha da partícula para desenhar o rastro
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 20) particle.trail.shift(); // Limita o tamanho da trilha

          return true; // Mantém a partícula na lista
        });
      }

      // Desenha as partículas na cena
      particles.current.forEach((particle) => {
        // Desenha a trilha (rastro) da partícula
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        particle.trail.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = `${particle.color}80`; // Cor com transparência para o rastro
        ctx.lineWidth = 1;
        ctx.stroke();

        // Desenha a partícula em si (como um pequeno círculo)
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Desenha o canhão (fonte emissora de partículas)
      const cannon = SIMULATION_CONFIG.cannon;
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(cannon.x, cannon.y, cannon.width, cannon.height);

      // Solicita o próximo frame de animação
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Inicia a animação chamando a função animate
    animationFrameRef.current = requestAnimationFrame(animate);

    // Cleanup para cancelar a animação quando o componente for desmontado
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

// Função para obter a configuração atual do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado para evitar renderizações desnecessárias
export default React.memo(Scenario13);
