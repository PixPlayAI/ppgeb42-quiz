import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario4',
  title: 'Cenário II: Atenuação de Radiação 3D',
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

// Função para resetar a configuração
const resetConfig = () => {
  SCENARIO_CONFIG = {
    id: 'scenario4',
    title: 'Cenário II: Atenuação de Radiação 3D',
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
  SOURCE_POSITION: -2.0,
  BOUNDARY_RADIUS: 9.0,
  BASE_SPEED: 3.0,
  TIME_SCALE: 1,
  REMOVAL_THRESHOLD: 1.5,
  PARTICLE_SIZE: 0.2,
  HEAD_LENGTH: 0.1,
  HEAD_WIDTH: 0.1,
  MIN_TRAVEL_DISTANCE: 4.0,
  CANNON_LENGTH: 0.8,
  CANNON_RADIUS: 0.15,
  CANNON_SEGMENTS: 32,
  CANNON_OPENING_RADIUS: 0.05,
  RICOCHET_PROBABILITY: 0.8,
  TRANSMISSION_PROBABILITY: 0.15,
};

const scenarioPrompt = `
  Gere uma questão de múltipla escolha sobre o seguinte cenário:

  Neste experimento, são mostrados dois cenários de emissão de radiação em 3D:
  - No primeiro cenário há uma emissão intensa de radiação
  - No segundo cenário há uma emissão mais suave e controlada
  - Em ambos os casos as partículas podem ser refletidas ou transmitidas ao atingir a barreira

  A questão deve avaliar se o aluno compreende as aplicações práticas dessas diferentes intensidades de radiação na área médica.

  Requisitos:
  - A questão deve ter 4 alternativas
  - Apenas uma alternativa deve estar correta
  - As alternativas incorretas devem ser plausíveis mas claramente distinguíveis
  - Foque em aplicações médicas práticas como radioterapia e diagnóstico por imagem
  - Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar
  - Inclua uma explicação detalhada da resposta correta e porque as outras alternativas estão erradas

  Retorne a resposta EXATAMENTE neste formato JSON:
  {
    "id": "scenario4",
    "title": "Cenário II: Atenuação de Radiação 3D",
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
    particleInterval: scenarioNumber === 1 ? 5 : 20,
    maxParticles: scenarioNumber === 1 ? 400 : 100,
    ricochetProbability: SIMULATION_CONFIG.RICOCHET_PROBABILITY,
    transmissionProbability: SIMULATION_CONFIG.TRANSMISSION_PROBABILITY,
  };
};

const Scenario4 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
  const mountRef = useRef(null);
  const particlesRef = useRef([]);
  const lastParticleTimeRef = useRef(0);
  const animationFrameRef = useRef();
  const lastUpdateTimeRef = useRef(Date.now());
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const labelRef = useRef(null);
  const hasUpdated = useRef(false);
  const fetchingRef = useRef(false);

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
      if (hasUpdated.current || fetchingRef.current) return;

      try {
        fetchingRef.current = true;
        resetConfig();
        await new Promise((resolve) => setTimeout(resolve, 100));

        const generatedContent = await generateScenarioContent(scenarioPrompt);

        if (!generatedContent.successMessage || !generatedContent.detailedExplanation) {
          generatedContent.successMessage =
            'Parabéns! Você demonstrou compreender as diferentes aplicações da radiação na medicina, reconhecendo como diferentes intensidades são apropriadas para diferentes finalidades terapêuticas e diagnósticas.';

          generatedContent.detailedExplanation =
            'A resposta correta considera corretamente que:\n' +
            '1. Alta intensidade de radiação é necessária para radioterapia externa\n' +
            '2. Baixa intensidade é mais apropriada para exames diagnósticos\n' +
            '3. Diferentes radioisótopos são escolhidos conforme a aplicação\n\n' +
            'As outras alternativas estão incorretas porque:\n' +
            '- Confundem as aplicações apropriadas para cada intensidade\n' +
            '- Interpretam erroneamente o papel da blindagem\n' +
            '- Propõem usos inadequados dos radioisótopos mencionados';
        }

        updateConfig(generatedContent);
      } catch (error) {
        console.error('🔴 Erro ao buscar conteúdo:', error);
        const fallbackConfig = {
          ...SCENARIO_CONFIG,
          successMessage:
            'Parabéns! Você demonstrou compreender as diferentes aplicações da radiação na medicina, reconhecendo como diferentes intensidades são apropriadas para diferentes finalidades terapêuticas e diagnósticas.',
          detailedExplanation:
            'A resposta correta considera corretamente que:\n' +
            '1. Alta intensidade de radiação é necessária para radioterapia externa\n' +
            '2. Baixa intensidade é mais apropriada para exames diagnósticos\n' +
            '3. Diferentes radioisótopos são escolhidos conforme a aplicação\n\n' +
            'As outras alternativas estão incorretas porque:\n' +
            '- Confundem as aplicações apropriadas para cada intensidade\n' +
            '- Interpretam erroneamente o papel da blindagem\n' +
            '- Propõem usos inadequados dos radioisótopos mencionados',
        };
        updateConfig(fallbackConfig);
      } finally {
        fetchingRef.current = false;
      }
    };

    resetConfig();
    fetchScenarioContent();

    return () => {
      resetConfig();
      hasUpdated.current = false;
      fetchingRef.current = false;
    };
  }, [updateConfig]);

  useEffect(() => {
    if (!mountRef.current) return;

    if (!sceneRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isDark ? 0x444444 : 0xffffff);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(65, 400 / 300, 0.2, 1000);
      camera.position.set(0.8, 0.5, 3.0);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(400, 300);
      rendererRef.current = renderer;
      mountRef.current.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(SIMULATION_CONFIG.SOURCE_POSITION / 2, 0, 0);
      controls.minDistance = 2.0;
      controls.maxDistance = 10.0;
      controlsRef.current = controls;

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const emissionAngle = THREE.MathUtils.degToRad(15);

      const cannonGeometry = new THREE.CylinderGeometry(
        SIMULATION_CONFIG.CANNON_RADIUS,
        SIMULATION_CONFIG.CANNON_RADIUS,
        SIMULATION_CONFIG.CANNON_LENGTH,
        SIMULATION_CONFIG.CANNON_SEGMENTS
      );
      const cannonMaterial = new THREE.MeshPhongMaterial({
        color: 0x666666,
        metalness: 0.8,
        roughness: 0.2,
      });
      const cannon = new THREE.Mesh(cannonGeometry, cannonMaterial);

      cannon.rotation.z = Math.PI / 2 + emissionAngle;

      const cannonPosition = new THREE.Vector3(
        SIMULATION_CONFIG.SOURCE_POSITION +
          (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.cos(emissionAngle),
        (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.sin(emissionAngle),
        0
      );
      cannon.position.copy(cannonPosition);
      scene.add(cannon);

      const holeGeometry = new THREE.CircleGeometry(
        SIMULATION_CONFIG.CANNON_OPENING_RADIUS,
        SIMULATION_CONFIG.CANNON_SEGMENTS
      );
      const holeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
      });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.set(
        SIMULATION_CONFIG.SOURCE_POSITION +
          SIMULATION_CONFIG.CANNON_LENGTH * Math.cos(emissionAngle),
        SIMULATION_CONFIG.CANNON_LENGTH * Math.sin(emissionAngle),
        0
      );
      hole.rotation.y = Math.PI / 2;
      scene.add(hole);

      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 2.5, 1.0),
        new THREE.MeshPhongMaterial({
          color: isDark ? 0x4b5563 : 0x555555,
          transparent: true,
          opacity: 0.9,
        })
      );
      barrier.position.set(0, 0, 0);
      scene.add(barrier);

      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.4),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(createTextCanvas(`Cenário ${scenarioNumber}`)),
          transparent: true,
          side: THREE.DoubleSide,
        })
      );
      label.position.set(0, 1.5, 0);
      scene.add(label);
      labelRef.current = label;
    }

    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isDark ? 0x444444 : 0xffffff);
    }

    const barrier = sceneRef.current.children.find(
      (child) => child.geometry instanceof THREE.BoxGeometry
    );
    if (barrier) {
      barrier.material.color.set(isDark ? 0x4b5563 : 0x555555);
    }
  }, [isDark, scenarioNumber]);

  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    const label = labelRef.current;

    if (!scene || !camera || !renderer || !controls || !label) return;

    const scenarioConfig = getSimulationConfig(scenarioNumber);

    const emissionAngle = THREE.MathUtils.degToRad(15);

    const createParticle = () => {
      const theta = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(15));
      const phi = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(15));

      const velocity = new THREE.Vector3(
        SIMULATION_CONFIG.BASE_SPEED * Math.cos(theta) * Math.cos(phi),
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(phi) + 1,
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(theta) * Math.cos(phi)
      );

      const initialPosition = new THREE.Vector3(
        SIMULATION_CONFIG.SOURCE_POSITION +
          (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.cos(emissionAngle),
        (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.sin(emissionAngle),
        0
      );

      const particle = new THREE.ArrowHelper(
        velocity.clone().normalize(),
        initialPosition.clone(),
        SIMULATION_CONFIG.PARTICLE_SIZE,
        0xef4444,
        SIMULATION_CONFIG.HEAD_LENGTH,
        SIMULATION_CONFIG.HEAD_WIDTH
      );

      particle.userData = {
        velocity: velocity,
        position: initialPosition.clone(),
        lastPosition: initialPosition.clone(),
        active: true,
      };

      return particle;
    };

    const updateParticles = (deltaTime) => {
      const scaledDelta = deltaTime * SIMULATION_CONFIG.TIME_SCALE;

      while (particlesRef.current.length >= scenarioConfig.maxParticles) {
        const oldestParticle = particlesRef.current.shift();
        scene.remove(oldestParticle);
      }

      particlesRef.current = particlesRef.current.filter((particle) => {
        if (!particle.userData.active) return false;

        const { velocity, position, lastPosition } = particle.userData;
        position.copy(lastPosition).add(velocity.clone().multiplyScalar(scaledDelta));

        if (
          position.x >= -0.1 &&
          position.x <= 0.1 &&
          position.y >= -1.25 &&
          position.y <= 1.25 &&
          position.z >= -0.5 &&
          position.z <= 0.5
        ) {
          const rand = Math.random();

          if (rand < scenarioConfig.ricochetProbability) {
            velocity.x *= -1;
            position.x = velocity.x > 0 ? 0.11 : -0.11;
          } else if (
            (rand, scenarioConfig.ricochetProbability + scenarioConfig.transmissionProbability)
          ) {
            position.x = velocity.x > 0 ? 0.11 : -0.11;
          } else {
            scene.remove(particle);
            return false;
          }
        }

        particle.position.copy(position);
        particle.setDirection(velocity.clone().normalize());
        lastPosition.copy(position);

        if (position.length() > SIMULATION_CONFIG.BOUNDARY_RADIUS) {
          scene.remove(particle);
          return false;
        }

        return true;
      });
    };

    const animate = () => {
      if (isPlaying) {
        const currentTime = Date.now();
        const deltaTime = Math.min((currentTime - lastUpdateTimeRef.current) * 0.001, 0.1);
        lastUpdateTimeRef.current = currentTime;

        if (currentTime - lastParticleTimeRef.current >= scenarioConfig.particleInterval) {
          const particle = createParticle();
          particlesRef.current.push(particle);
          scene.add(particle);
          lastParticleTimeRef.current = currentTime;
        }

        updateParticles(deltaTime);
        label.lookAt(camera.position);
        controls.update();
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, scenarioNumber]);

  const createTextCanvas = (text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = isDark ? '#ffffff' : '#000000';
      context.font = 'bold 64px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, 256, 64);
    }
    return canvas;
  };

  return (
    <div
      ref={mountRef}
      className={`border rounded-lg shadow-md ${isDark ? 'bg-gray-800' : 'bg-white'}`}
    />
  );
};

Scenario4.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};

export const getScenarioConfig = () => SCENARIO_CONFIG;
export { SCENARIO_CONFIG };
export default React.memo(Scenario4);
