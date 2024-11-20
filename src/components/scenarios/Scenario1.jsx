import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Configurações do cenário
const SCENARIO_CONFIG = {
  id: 'scenario1',
  title: 'Cenário I: Atenuação de Radiação',
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

// Configurações da simulação
const SIMULATION_CONFIG = {
  SOURCE_POSITION: -2.0,
  PARTICLE_SPAWN_INTERVAL: 50,
  PARTICLE_LIMIT: 800,
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
};

const Scenario1 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
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

  const getScenarioProbabilities = () => {
    return {
      transmissionProbability: 1,
      ricochetProbability: scenarioNumber === 2 ? 0.05 : 0.01,
      deflectionProbability: 0.0,
    };
  };

  useEffect(() => {
    if (!sceneRef.current) {
      // Inicialização da cena
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

      // Iluminação
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      // Canhão
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
      cannon.rotation.z = Math.PI / 2;
      cannon.position.set(
        SIMULATION_CONFIG.SOURCE_POSITION + SIMULATION_CONFIG.CANNON_LENGTH / 2,
        0,
        0
      );
      scene.add(cannon);

      // Orifício do canhão
      const holeGeometry = new THREE.CircleGeometry(
        SIMULATION_CONFIG.CANNON_OPENING_RADIUS,
        SIMULATION_CONFIG.CANNON_SEGMENTS
      );
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const hole = new THREE.Mesh(holeGeometry, holeMaterial);
      hole.position.set(SIMULATION_CONFIG.SOURCE_POSITION, 0, 0);
      hole.rotation.y = Math.PI / 2;
      scene.add(hole);

      // Barreira
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

      // Label
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

    // Atualização das cores baseada no tema
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

    const createParticle = () => {
      const theta = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(15));
      const phi = THREE.MathUtils.degToRad(THREE.MathUtils.randFloatSpread(15));

      const velocity = new THREE.Vector3(
        SIMULATION_CONFIG.BASE_SPEED * Math.cos(theta) * Math.cos(phi),
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(phi),
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(theta) * Math.cos(phi)
      );

      const particle = new THREE.ArrowHelper(
        velocity.clone().normalize(),
        new THREE.Vector3(SIMULATION_CONFIG.SOURCE_POSITION, 0, 0),
        SIMULATION_CONFIG.PARTICLE_SIZE,
        0xff0000,
        SIMULATION_CONFIG.HEAD_LENGTH,
        SIMULATION_CONFIG.HEAD_WIDTH
      );

      particle.userData = {
        velocity: velocity,
        position: new THREE.Vector3(SIMULATION_CONFIG.SOURCE_POSITION, 0, 0),
        lastPosition: new THREE.Vector3(SIMULATION_CONFIG.SOURCE_POSITION, 0, 0),
        elapsedTime: 0,
        distanceFromStart: 0,
      };

      return particle;
    };

    const updateParticles = (deltaTime) => {
      const scaledDelta = deltaTime * SIMULATION_CONFIG.TIME_SCALE;
      const probs = getScenarioProbabilities();

      particlesRef.current = particlesRef.current.filter((particle) => {
        const { velocity, position, lastPosition } = particle.userData;

        particle.userData.distanceFromStart = position.distanceTo(
          new THREE.Vector3(SIMULATION_CONFIG.SOURCE_POSITION, 0, 0)
        );

        if (
          particle.userData.distanceFromStart >
            SIMULATION_CONFIG.BOUNDARY_RADIUS * SIMULATION_CONFIG.REMOVAL_THRESHOLD &&
          particle.userData.distanceFromStart > SIMULATION_CONFIG.MIN_TRAVEL_DISTANCE
        ) {
          scene.remove(particle);
          return false;
        }

        position.copy(lastPosition).add(velocity.clone().multiplyScalar(scaledDelta));
        particle.position.copy(position);
        particle.setDirection(velocity.clone().normalize());
        lastPosition.copy(position);

        if (
          position.x >= -0.1 &&
          position.x <= 0.1 &&
          position.y >= -1.25 &&
          position.y <= 1.25 &&
          position.z >= -0.5 &&
          position.z <= 0.5
        ) {
          const rand = Math.random();

          if (rand < probs.ricochetProbability) {
            velocity.x *= -1;
            position.x = velocity.x > 0 ? 0.11 : -0.11;
          } else if (rand < probs.ricochetProbability + probs.transmissionProbability) {
            position.x = velocity.x > 0 ? 0.11 : -0.11;
          } else {
            scene.remove(particle);
            return false;
          }
        }

        return true;
      });
    };

    let accumulator = 0;
    const FIXED_TIME_STEP = 1 / 120;

    const animate = () => {
      if (isPlaying) {
        const currentTime = Date.now();
        const deltaTime = Math.min((currentTime - lastUpdateTimeRef.current) * 0.001, 0.1);
        lastUpdateTimeRef.current = currentTime;

        accumulator += deltaTime;

        while (accumulator >= FIXED_TIME_STEP) {
          updateParticles(FIXED_TIME_STEP);
          accumulator -= FIXED_TIME_STEP;
        }

        if (
          currentTime - lastParticleTimeRef.current > SIMULATION_CONFIG.PARTICLE_SPAWN_INTERVAL &&
          particlesRef.current.length < SIMULATION_CONFIG.PARTICLE_LIMIT
        ) {
          const particle = createParticle();
          particlesRef.current.push(particle);
          scene.add(particle);
          lastParticleTimeRef.current = currentTime;
        }

        label.lookAt(camera.position);
        controls.update();
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    if (!animationFrameRef.current) {
      animate();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
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

Scenario1.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};

// Exportando tanto o componente quanto as configurações
export { SCENARIO_CONFIG };
export default Scenario1;
