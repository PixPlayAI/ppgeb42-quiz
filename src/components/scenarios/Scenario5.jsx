// src/components/scenarios/Scenario5.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SCENARIO_CONFIG = {
  id: 'scenario5',
  title: 'Cenário II: Experimento de Rutherford',
  question: 'Analise os dois cenários e escolha a alternativa correta:',
  options: [
    {
      id: 'option1',
      text: 'A fonte radioativa emite a mesma intensidade de radiação nos dois cenários, porém a blindagem do cenário II apresenta coeficiente de atenuação linear (μ) que é bem maior do que o valor da blindagem do cenário I',
      isCorrect: true,
    },
    {
      id: 'option2',
      text: 'A fonte radioativa do cenário II emite o dobro da intensidade de radiação em relação ao cenário I, mantendo os mesmos coeficientes de atenuação linear (μ) nas blindagens',
      isCorrect: false,
    },
    {
      id: 'option3',
      text: 'A blindagem do cenário II possui espessura que é metade da espessura da blindagem do cenário I, mantendo o mesmo material atenuador',
      isCorrect: false,
    },
    {
      id: 'option4',
      text: 'A radiação no cenário II é composta por partículas alfa, enquanto no cenário I são fótons gama, por isso há diferença na penetração',
      isCorrect: false,
    },
  ],
};

const SIMULATION_CONFIG = {
  // Área de emissão das partículas (mantida inalterada)
  emissionArea: {
    x: 30, // Posição no eixo x
    y: 135, // Posição no eixo y
    width: 20, // Largura da área de emissão
    height: 20, // Altura da área de emissão
  },
  // Configuração do canhão (aumentada a grossura)
  cannon: {
    x: 20, // Posição no eixo x (ajustada para centralizar sobre a área de emissão)
    y: 125, // Posição no eixo y (ajustada para centralizar sobre a área de emissão)
    width: 40, // Aumentada de 20 para 40
    height: 40, // Aumentada de 20 para 40
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
  reflectionProbability: 0.55, // Probabilidade de reflexão maior que no cenário I
};

const Scenario5 = ({ isPlaying, isDark }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Função para criar uma partícula aleatória emitida do canhão cilíndrico
    const createParticle = () => {
      const particleType =
        SIMULATION_CONFIG.particleTypes[
          Math.floor(Math.random() * SIMULATION_CONFIG.particleTypes.length)
        ];
      const angle = (Math.random() - 0.5) * (Math.PI / 16);
      const speed = 2 + Math.random();

      // Emissão a partir de uma posição dentro da área de emissão
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
      // Limpar o canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenhar fundo
      ctx.fillStyle = isDark ? '#1f2937' : '#e5e7eb';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Desenhar título
      ctx.fillStyle = isDark ? '#e5e7eb' : '#1f2937';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`Cenário II`, canvas.width / 2, 30);

      // Desenhar campo elétrico
      const field = SIMULATION_CONFIG.electricField;
      ctx.fillStyle = '#fbbf24';
      ctx.globalAlpha = 0.2;
      ctx.fillRect(field.x, field.y, field.width, field.height);
      ctx.globalAlpha = 1.0;

      // Desenhar polos
      const { positive, negative } = SIMULATION_CONFIG.poles;

      // Polo Positivo
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(positive.x, positive.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('+', positive.x, positive.y + 4);

      // Polo Negativo
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(negative.x, negative.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText('-', negative.x, negative.y + 4);

      // Desenhar anteparo (tela) com reflexão
      const screen = SIMULATION_CONFIG.screen;
      ctx.fillStyle = '#6b7280';
      ctx.fillRect(screen.x, screen.y, screen.width, screen.height);

      // Desenhar partículas somente se a simulação estiver em execução
      if (isPlaying) {
        // Emissão de novas partículas
        for (let i = 0; i < SIMULATION_CONFIG.emissionRate; i++) {
          if (particlesRef.current.length < SIMULATION_CONFIG.maxParticles) {
            particlesRef.current.push(createParticle());
          }
        }

        // Atualizar partículas
        particlesRef.current = particlesRef.current.filter((particle) => {
          if (!particle.active) return false;

          // Atualizar posição
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Aplicar desvio no campo elétrico (vy)
          if (
            particle.x >= SIMULATION_CONFIG.electricField.x &&
            particle.x <= SIMULATION_CONFIG.electricField.x + SIMULATION_CONFIG.electricField.width
          ) {
            particle.vy += particle.deflectionCoefficient;
          }

          // Limites do canvas
          if (particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            return false;
          }

          // Detecção de colisão com o anteparo
          if (
            particle.x >= screen.x &&
            particle.x <= screen.x + screen.width &&
            particle.y >= screen.y &&
            particle.y <= screen.y + screen.height
          ) {
            const rand = Math.random();
            if (rand < SIMULATION_CONFIG.reflectionProbability) {
              // Reflete a partícula
              particle.vx = -particle.vx;
              particle.x = screen.x - 1;
            } else {
              // Partícula atravessa o anteparo
              return false;
            }
          }

          // Adicionar posição ao rastro
          particle.trail.push({ x: particle.x, y: particle.y });
          if (particle.trail.length > 20) particle.trail.shift();

          return true;
        });
      }

      // Desenhar partículas
      particlesRef.current.forEach((particle) => {
        // Desenhar rastro
        ctx.beginPath();
        ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
        particle.trail.forEach((point) => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.strokeStyle = `${particle.color}80`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Desenhar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      // Desenhar canhão cilíndrico (acima das partículas)
      const cannon = SIMULATION_CONFIG.cannon;
      ctx.fillStyle = '#4b5563'; // Cor do canhão
      ctx.fillRect(cannon.x, cannon.y, cannon.width, cannon.height);
      // Remover a escrita "Canhão"

      // Solicitar próximo frame
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Iniciar o loop de animação
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
      width={450}
      height={300}
      className={`border rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    />
  );
};

Scenario5.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export { SCENARIO_CONFIG };
export default React.memo(Scenario5);
