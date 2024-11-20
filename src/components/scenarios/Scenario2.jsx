import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const SCENARIO_CONFIG = {
  id: 'scenario2',
  title: 'Cenário II: Atenuação de Radiação 2D',
  question: 'Analise os dois cenários e escolha a alternativa correta:',
  options: [
    {
      id: 'correct',
      text: 'A fonte radioativa emite a mesma intensidade de radiação nos dois cenários, porém a blindagem do cenário II apresenta coeficiente de atenuação linear (μ) que é bem maior do que o valor da blindagem do cenário I',
      isCorrect: true,
    },
    {
      id: 'plausible1',
      text: 'A fonte radioativa do cenário II emite o dobro da intensidade de radiação em relação ao cenário I, mantendo os mesmos coeficientes de atenuação linear (μ) nas blindagens',
      isCorrect: false,
    },
    {
      id: 'plausible2',
      text: 'A blindagem do cenário II possui espessura que é metade da espessura da blindagem do cenário I, mantendo o mesmo material atenuador',
      isCorrect: false,
    },
    {
      id: 'absurd',
      text: 'A radiação no cenário II é composta por partículas alfa, enquanto no cenário I são fótons gama, por isso há diferença na penetração',
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

const getScenarioProbabilities = (scenarioNumber) => {
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

        // Só atualiza posições se estiver em play
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
            const probs = getScenarioProbabilities(scenarioNumber);
            const rand = Math.random();

            if (rand < probs.ricochetProbability) {
              particle.vx = -particle.vx;
              particle.x =
                particle.vx > 0
                  ? SIMULATION_CONFIG.barrier.x + SIMULATION_CONFIG.barrier.width + 1
                  : SIMULATION_CONFIG.barrier.x - 1;
            } else if (rand < probs.ricochetProbability + probs.transmissionProbability) {
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

export { SCENARIO_CONFIG };
export default React.memo(Scenario2);
