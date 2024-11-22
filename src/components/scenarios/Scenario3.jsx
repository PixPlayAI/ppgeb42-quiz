import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SCENARIO_CONFIG = {
  id: 'scenario3',
  title: 'Cenário II: Atenuação de Radiação 2D',
  question:
    'Compare os cenários e identifique possíveis aplicações considerando a quantidade de radiação emitida:',
  options: [
    {
      id: 'correct',
      text: 'A intensa emissão do primeiro cenário sugere fonte para radioterapia externa com Cobalto-60, enquanto a menor emissão do segundo sugere uso em cintilografia com Tecnécio-99m.',
      isCorrect: true,
    },
    {
      id: 'plausible1',
      text: 'A intensa emissão do segundo cenário sugere fonte de Irídio-192 usada em braquiterapia HDR, enquanto a menor emissão do primeiro indica uso diagnóstico com Gálio-68.',
      isCorrect: false,
    },
    {
      id: 'plausible2',
      text: 'A diferença na quantidade de radiação detectada é causada pelos tipos de blindagem, sendo chumbo no primeiro e concreto no segundo.',
      isCorrect: false,
    },
    {
      id: 'absurd',
      text: 'A maior emissão do primeiro cenário poderia ser partículas alfa de Trítio, enquanto a menor do segundo seria radiação gama de Césio-137.',
      isCorrect: false,
    },
  ],
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

const getScenarioConfig = (scenarioNumber) => {
  return {
    particleInterval: scenarioNumber === 1 ? 5 : 50, // Cenário 1 emite 10x mais partículas
    maxParticles: scenarioNumber === 1 ? 400 : 40,
    ricochetProbability: 0.8, // Alta probabilidade de ricochete para ambos
    transmissionProbability: 0.15,
  };
};

const Scenario3 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastParticleTimeRef = useRef(0);

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
      const config = getScenarioConfig(scenarioNumber);

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

export { SCENARIO_CONFIG };
export default React.memo(Scenario3);
