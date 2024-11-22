import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SCENARIO_CONFIG = {
  id: 'scenario4',
  title: 'Cenário II: Atenuação de Radiação 3D',
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

// Ajustado para emissão contínua
const getScenarioConfig = (scenarioNumber) => {
  return {
    particleInterval: scenarioNumber === 1 ? 5 : 20, // Reduzido intervalo do cenário 2
    maxParticles: scenarioNumber === 1 ? 400 : 100, // Aumentado limite do cenário 2
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

  useEffect(() => {
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
      mountRef.current?.appendChild(renderer.domElement);

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

      // Definição do ângulo de emissão
      const emissionAngle = THREE.MathUtils.degToRad(15); // Ângulo de 15 graus

      // Criação do canhão
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

      // Rotaciona o canhão para o ângulo de emissão definido
      cannon.rotation.z = Math.PI / 2 + emissionAngle;

      // Define a posição do canhão de modo que o centro de massa coincida com a origem da emissão
      const cannonPosition = new THREE.Vector3(
        SIMULATION_CONFIG.SOURCE_POSITION +
          (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.cos(emissionAngle),
        (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.sin(emissionAngle),
        0
      );
      cannon.position.copy(cannonPosition);
      scene.add(cannon);

      // Removendo o buraco preto e ajustando a cor para integrar melhor à cena
      // Tornando o buraco transparente
      const holeGeometry = new THREE.CircleGeometry(
        SIMULATION_CONFIG.CANNON_OPENING_RADIUS,
        SIMULATION_CONFIG.CANNON_SEGMENTS
      );
      const holeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
      }); // Tornado transparente
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

    const scenarioConfig = getScenarioConfig(scenarioNumber);

    // Definição do ângulo de emissão novamente para uso neste escopo
    const emissionAngle = THREE.MathUtils.degToRad(15); // Certifique-se de que este valor corresponde ao usado anteriormente

    const createParticle = () => {
      const theta = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(15));
      const phi = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(15));

      // Definição da velocidade da partícula
      const velocity = new THREE.Vector3(
        SIMULATION_CONFIG.BASE_SPEED * Math.cos(theta) * Math.cos(phi),
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(phi) + 1, // Adiciona componente Y para inclinar a direção
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(theta) * Math.cos(phi)
      );

      // Define a posição inicial da partícula no centro do canhão
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
        0xef4444, // Mantém a cor vermelha para as partículas
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

      // Remove partículas antigas primeiro
      while (particlesRef.current.length >= scenarioConfig.maxParticles) {
        const oldestParticle = particlesRef.current.shift();
        scene.remove(oldestParticle);
      }

      particlesRef.current = particlesRef.current.filter((particle) => {
        if (!particle.userData.active) return false;

        const { velocity, position, lastPosition } = particle.userData;
        position.copy(lastPosition).add(velocity.clone().multiplyScalar(scaledDelta));

        // Verifica colisão com a barreira
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
            rand <
            scenarioConfig.ricochetProbability + scenarioConfig.transmissionProbability
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

        // Garante criação contínua de partículas
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

  function createTextCanvas(text) {
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
  }

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

export { SCENARIO_CONFIG };
export default Scenario4;
