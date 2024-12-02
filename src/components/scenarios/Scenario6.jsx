// src/components/scenarios/Scenario6.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario6',
  title: 'Cenário II: Colimação de Partículas',
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
    id: 'scenario6',
    title: 'Cenário II: Colimação de Partículas',
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

// Prompt para gerar a questão de múltipla escolha
const scenarioPrompt = `
Gere uma questão de múltipla escolha sobre o seguinte cenário:

No experimento de colimação, partículas radioativas são emitidas de uma fonte e passam por um anteparo que pode ou não colimá-las corretamente. Observa-se que:
- No Cenário I, o anteparo é feito de madeira ou outro material inapropriado para colimação.
- No Cenário II, o anteparo é feito de chumbo ou outro material apropriado para colimação.

A questão deve avaliar se o aluno sabe identificar o papel do material do anteparo usado na colimação das partículas e explicar por que a colimação é melhor em um cenário do que no outro. IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

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
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas"
}`;
// Configuração atualizada com parâmetros mais realistas
const getSimulationConfig = (scenarioNumber) => {
  if (scenarioNumber === 1) {
    // Cenário I: Material Inapropriado (Madeira)
    return {
      // Altíssima transmissão (madeira praticamente não interage)
      transmissionProbability: 0.95,
      // Reflexão quase nula
      ricochetProbability: 0.02,
      // Deflexão mínima
      deflectionProbability: 0.03,
      // Parâmetros de espalhamento muito reduzidos
      maxDeflectionAngle: Math.PI / 16, // Ângulo máximo de deflexão reduzido
      energyLossFactor: 0.05, // Perda de energia mínima
      scatteringStrength: 0.1, // Espalhamento muito baixo
    };
  } else {
    // Cenário II: Material Apropriado (Chumbo)
    return {
      // Baixa transmissão (chumbo tem alta densidade)
      transmissionProbability: 0.15,
      // Alta reflexão
      ricochetProbability: 0.6,
      // Deflexão significativa
      deflectionProbability: 0.25,
      // Parâmetros de espalhamento mantidos
      maxDeflectionAngle: Math.PI / 8,
      energyLossFactor: 0.5,
      scatteringStrength: 0.3,
    };
  }
};

// Função auxiliar para calcular o ângulo de espalhamento realista
const getRealisticScatteringAngle = (config) => {
  // Distribuição gaussiana para ângulos de espalhamento
  const gaussian = () => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  };

  // Ângulo de espalhamento seguindo distribuição mais realista
  return gaussian() * config.maxDeflectionAngle * config.scatteringStrength;
};

const Scenario6 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastParticleTimeRef = useRef(0);

  // Configuração específica para cada cenário
  const SIMULATION_CONFIG = {
    // Caixa de emissão
    emissionBox: {
      x: 20,
      y: 85,
      width: 60,
      height: 120,
      wallThickness: 10,
    },
    // Área de emissão de partículas
    emissionArea: {
      x: 45,
      y: 135,
      width: 10,
      height: 20,
    },
    // Canhão
    cannon: {
      x: 30,
      y: 125,
      width: 30,
      height: 40,
    },
    // Colimador
    collimator: {
      x: 120,
      y: 50,
      width: 100, // Aumentado de 60 para 100
      height: 200,
      openingWidth: 30,
      wallThickness: 50, // Aumentado de 30 para 50
      material: scenarioNumber === 1 ? 'inappropriate' : 'appropriate',
    },
    // Tela de detecção
    screen: {
      x: 370,
      y: 50,
      width: 10,
      height: 200,
    },
    // Configuração das partículas
    particle: {
      color: '#ef4444', // Vermelho
      baseSpeed: 2,
      maxSpeedVariation: 0.3, // Reduzida para comportamento mais consistente
      spreadAngle: Math.PI / 8, // Reduzido para emissão mais concentrada
      size: 2.5,
      trailLength: 10, // Similar ao Scenario2.jsx
    },
    emissionRate: 2,
    maxParticles: 200,
  };

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
            'Parabéns! Você demonstrou compreender corretamente os conceitos de colimação e como diferentes materiais afetam a trajetória das partículas.';
          generatedContent.detailedExplanation =
            'A resposta correta considera que:\n' +
            '1. O material apropriado (chumbo ou outro material adequado) tem um alto coeficiente de atenuação, permitindo uma colimação eficaz das partículas.\n' +
            '2. O material inapropriado (madeira ou outro material inadequado) tem um baixo coeficiente de atenuação, resultando em maior espalhamento das partículas.\n\n' +
            'As outras alternativas estão incorretas porque:\n' +
            '- Confundem os materiais e seus efeitos na colimação.\n' +
            '- Não consideram corretamente a relação entre o coeficiente de atenuação e a colimação.\n' +
            '- Fazem associações equivocadas entre tipos de materiais e seus usos em colimação. Não cite o número da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas';
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario6',
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
            'Parabéns! Você demonstrou compreender corretamente os conceitos de colimação e como diferentes materiais afetam a trajetória das partículas.',
          detailedExplanation:
            'A resposta correta considera que:\n' +
            '1. O material apropriado (chumbo ou outro material adequado) tem um alto coeficiente de atenuação, permitindo uma colimação eficaz das partículas.\n' +
            '2. O material inapropriado (madeira ou outro material inadequado) tem um baixo coeficiente de atenuação, resultando em maior espalhamento das partículas.\n\n' +
            'As outras alternativas estão incorretas porque:\n' +
            '- Confundem os materiais e seus efeitos na colimação.\n' +
            '- Não consideram corretamente a relação entre o coeficiente de atenuação e a colimação.\n' +
            '- Fazem associações equivocadas entre tipos de materiais e seus usos em colimação. Não cite o número da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas',
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

  // Função para criar uma nova partícula com comportamento semelhante ao Scenario2.jsx
  const createParticle = () => {
    const angle = (Math.random() - 0.5) * SIMULATION_CONFIG.particle.spreadAngle;
    const speedVariation = (Math.random() - 0.5) * SIMULATION_CONFIG.particle.maxSpeedVariation;
    const speed = SIMULATION_CONFIG.particle.baseSpeed + speedVariation;

    const emissionX =
      SIMULATION_CONFIG.emissionArea.x + Math.random() * SIMULATION_CONFIG.emissionArea.width;
    const emissionY =
      SIMULATION_CONFIG.emissionArea.y + Math.random() * SIMULATION_CONFIG.emissionArea.height;

    return {
      id: `particle-${Date.now()}-${Math.random()}`,
      color: SIMULATION_CONFIG.particle.color,
      x: emissionX,
      y: emissionY,
      vx: speed * Math.cos(angle),
      vy: speed * Math.sin(angle),
      speed: speed,
      active: true,
      passedCollimator: false,
      trail: [{ x: emissionX, y: emissionY }],
    };
  };

  // Função atualizada para colisão com o colimador
  const handleCollimatorCollision = (particle, collimator, openingY) => {
    const config = getSimulationConfig(collimator.material === 'appropriate' ? 2 : 1);
    const openingCenter = openingY + collimator.openingWidth / 2;

    if (particle.y >= openingY && particle.y <= openingY + collimator.openingWidth) {
      if (collimator.material === 'appropriate') {
        // Colimação mais forte para material apropriado
        const centerOffset = openingCenter - particle.y;
        // Correção mais forte da trajetória em direção ao centro
        particle.vy += centerOffset * 0.015; // Aumentado de 0.01 para 0.015

        // Alinhamento mais forte com o eixo horizontal
        const currentAngle = Math.atan2(particle.vy, particle.vx);
        const correction = -currentAngle * 0.3; // Aumentado de 0.2 para 0.3

        // Rotação do vetor velocidade
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        particle.vx = speed * Math.cos(currentAngle + correction);
        particle.vy = speed * Math.sin(currentAngle + correction);

        // Maior perda de energia na passagem
        particle.speed *= 1 - config.energyLossFactor * 0.15; // Aumentado de 0.1 para 0.15
      } else {
        // Comportamento da madeira permanece o mesmo
        const minimalPerturbation = (Math.random() - 0.5) * 0.02;
        particle.vy += minimalPerturbation;
        particle.speed *= 1 - config.energyLossFactor;
      }
    } else {
      // Colisão com a parede mais grossa
      const rand = Math.random();

      if (collimator.material === 'appropriate') {
        if (rand < config.ricochetProbability) {
          particle.vx *= -1 * (1 - config.energyLossFactor);
          particle.vy += (Math.random() - 0.5) * 0.2;
        } else if (rand < config.ricochetProbability + config.deflectionProbability) {
          const scatteringAngle = getRealisticScatteringAngle(config);
          const speed = particle.speed * (1 - config.energyLossFactor);
          particle.vx = speed * Math.cos(scatteringAngle);
          particle.vy = speed * Math.sin(scatteringAngle);
        } else {
          particle.active = false;
        }
      } else {
        // Comportamento da madeira permanece praticamente inalterado
        if (rand > config.transmissionProbability) {
          const minimalScatteringAngle = (Math.random() - 0.5) * config.maxDeflectionAngle;
          particle.vx += Math.cos(minimalScatteringAngle) * 0.1;
          particle.vy += Math.sin(minimalScatteringAngle) * 0.1;
          particle.speed *= 1 - config.energyLossFactor;
        }
      }
    }

    // Normalização da velocidade após modificações
    if (particle.active) {
      const currentSpeed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      particle.vx = (particle.vx / currentSpeed) * particle.speed;
      particle.vy = (particle.vy / currentSpeed) * particle.speed;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particleInterval = 10; // Intervalo de emissão em milissegundos

    const drawEmissionBox = () => {
      const box = SIMULATION_CONFIG.emissionBox;
      ctx.fillStyle = '#4b5563';

      // Paredes da caixa
      ctx.fillRect(box.x, box.y, box.wallThickness, box.height); // Esquerda
      ctx.fillRect(box.x + box.width - box.wallThickness, box.y, box.wallThickness, box.height); // Direita
      ctx.fillRect(box.x, box.y, box.width, box.wallThickness); // Superior
      ctx.fillRect(box.x, box.y + box.height - box.wallThickness, box.width, box.wallThickness); // Inferior

      // Abertura de saída
      const holeY = box.y + (box.height - SIMULATION_CONFIG.collimator.openingWidth) / 2;
      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(
        box.x + box.width - box.wallThickness,
        holeY,
        box.wallThickness,
        SIMULATION_CONFIG.collimator.openingWidth
      );
    };

    // ... (resto do código permanece igual)

    const animate = () => {
      const currentTime = Date.now();

      // Limpa o canvas e redesenha o fundo
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenha os labels
      ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Cenário ${scenarioNumber}`, canvas.width / 2, 30);
      ctx.font = '14px Arial';

      // Desenha os elementos estáticos
      drawEmissionBox();

      // Desenha o canhão
      const cannon = SIMULATION_CONFIG.cannon;
      ctx.fillStyle = '#374151';
      ctx.fillRect(cannon.x, cannon.y, cannon.width, cannon.height);

      // Desenha o colimador
      const collimator = SIMULATION_CONFIG.collimator;
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(collimator.x, collimator.y, collimator.width, collimator.height);

      // Abertura do colimador
      const openingY = collimator.y + (collimator.height - collimator.openingWidth) / 2;
      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(
        collimator.x,
        openingY,
        collimator.width,
        SIMULATION_CONFIG.collimator.openingWidth
      );

      // Tela de detecção
      const screen = SIMULATION_CONFIG.screen;
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(screen.x, screen.y, screen.width, screen.height);

      // Atualização e desenho das partículas
      if (isPlaying) {
        // Criar novas partículas apenas se estiver rodando
        if (
          currentTime - lastParticleTimeRef.current > particleInterval &&
          particlesRef.current.length < SIMULATION_CONFIG.maxParticles
        ) {
          particlesRef.current.push(createParticle());
          lastParticleTimeRef.current = currentTime;
        }

        // Atualizar posições apenas se estiver rodando
        particlesRef.current = particlesRef.current.filter((particle) => {
          if (!particle.active) return false;

          // Atualiza posição
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Interação com o colimador
          if (
            !particle.passedCollimator &&
            particle.x >= collimator.x &&
            particle.x <= collimator.x + collimator.width
          ) {
            handleCollimatorCollision(particle, collimator, openingY);
            particle.passedCollimator = true;
          }

          // Remove partículas que saíram do canvas
          if (particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            return false;
          }

          // Atualiza a trilha
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > SIMULATION_CONFIG.particle.trailLength) {
            particle.trail.shift();
          }

          return true;
        });
      }

      // Desenha as partículas independentemente do estado de isPlaying
      particlesRef.current.forEach((particle) => {
        // Desenha a trilha
        if (particle.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
          for (let i = 1; i < particle.trail.length; i++) {
            ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
          }
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.lineWidth = SIMULATION_CONFIG.particle.size;
          ctx.stroke();
        }

        // Desenha a partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, SIMULATION_CONFIG.particle.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isDark, scenarioNumber]);

  return (
    <canvas
      ref={canvasRef}
      width={440}
      height={320}
      className={`border rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    />
  );
};

Scenario6.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};

// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario6);
