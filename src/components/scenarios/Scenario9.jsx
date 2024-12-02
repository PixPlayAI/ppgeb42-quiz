import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial do cenário
let SCENARIO_CONFIG = {
  id: 'scenario9',
  title: 'Cenário II: Colimação em Física Médica 3D',
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
    id: 'scenario9',
    title: 'Cenário II: Colimação em Física Médica 3D',
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
const scenarioPrompt = `Gere uma questão de múltipla escolha sobre o seguinte cenário:

No experimento de colimação, partículas radioativas são emitidas de uma fonte e passam por um anteparo que pode ou não colimá-las corretamente. Observa-se que:
- No Cenário I, o anteparo é feito de madeira ou outro material inapropriado para colimação.
- No Cenário II, o anteparo é feito de chumbo ou outro material apropriado para colimação.

A questão deve avaliar se o aluno sabe o motivo de se usar uma colimação, que pode ser para a segurança do paciente, aumento da eficácia de um tratamento radioterápico para irradiar um local específico ou para obter uma radiografia dental específica. Você também pode explorar outras aplicações na física médica relacionadas à colimação na pergunta, usando uma linguagem adequada.

IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

Requisitos:
- A questão deve ter 4 alternativas
- Apenas uma alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis e uma alternativa deve ser absurda e totalmente nada a ver, irônica ou engraçada.
- Foque nas aplicações da colimação em física médica
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar
- Inclua uma explicação detalhada da resposta correta e porque as outras alternativas estão erradas
- Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario9",
  "title": "Cenário II: Colimação em Física Médica 3D",
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
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou, importante não citar os números da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas]",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta, importante não citar os números da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas]"
}`;

// Configurações da simulação
const SIMULATION_CONFIG = {
  SOURCE_POSITION: -5.0,
  BOUNDARY_RADIUS: 20.0,
  BASE_SPEED: 5.0,
  TIME_SCALE: 1,
  REMOVAL_THRESHOLD: 1.5,
  PARTICLE_SIZE: 0.2,
  HEAD_LENGTH: 0.1,
  HEAD_WIDTH: 0.1,
  MIN_TRAVEL_DISTANCE: 4.0,
  CANNON_LENGTH: 1.0,
  CANNON_RADIUS: 0.5,
  CANNON_SEGMENTS: 32,
  CANNON_OPENING_RADIUS: 0.3,
  COLLIMATOR_THICKNESS: 4, // Define a espessura do colimador como constante
};

// Configurações específicas do cenário
const getSimulationConfig = (scenarioNumber) => {
  if (scenarioNumber === 1) {
    // Cenário I: Material Inapropriado (Madeira)
    return {
      particleInterval: 5,
      maxParticles: 500,
      transmissionProbability: 0.95,
      ricochetProbability: 0.05,
      deflectionProbability: 0.1,
      maxDeflectionAngle: Math.PI / 8,
      energyLossFactor: 0.1,
      scatteringStrength: 0.2,
      collimatorMaterial: 'wood',
      parallelismStrength: 0.1,
      collimationEfficiency: 0.2,
    };
  } else {
    // Cenário II: Material Apropriado (Chumbo)
    return {
      particleInterval: 5,
      maxParticles: 500,
      transmissionProbability: 0.1,
      ricochetProbability: 0.2,
      deflectionProbability: 0.05,
      maxDeflectionAngle: Math.PI / 16,
      energyLossFactor: 0.7,
      scatteringStrength: 0.1,
      collimatorMaterial: 'lead',
      parallelismStrength: 0.9,
      collimationEfficiency: 0.95,
    };
  }
};

const Scenario9 = ({ isPlaying, isDark, scenarioNumber = 1 }) => {
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

  // Função para atualizar a configuração e disparar evento
  const updateConfig = useCallback((newConfig) => {
    SCENARIO_CONFIG = newConfig;
    window.dispatchEvent(new CustomEvent('scenarioConfigUpdated'));
  }, []);

  // Efeito para buscar o conteúdo do cenário
  useEffect(() => {
    const fetchScenarioContent = async () => {
      if (isInitialized) return;
      try {
        isInitialized = true;
        const generatedContent = await generateScenarioContent(scenarioPrompt);
        // Verifica se o conteúdo foi gerado corretamente
        if (!generatedContent.successMessage || !generatedContent.detailedExplanation) {
          generatedContent.successMessage =
            'Parabéns! Você compreende que a colimação é essencial para direcionar a radiação ao local específico, aumentando a eficácia do tratamento e a segurança do paciente.';
          generatedContent.detailedExplanation =
            'A resposta correta destaca que a colimação é usada para concentrar a radiação em uma área específica, minimizando a exposição desnecessária. As outras alternativas estão incorretas pois:\n' +
            '- Não relacionam a colimação com a segurança ou eficácia do tratamento.\n' +
            '- Sugerem aplicações não relacionadas à física médica.\n' +
            '- Apresentam conceitos absurdos ou humorísticos que não se aplicam. Não cite o número da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas';
        }

        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario9',
          title: 'MonteCarloQuiz.online PPGEB42 turma 2024/02',
        };
        updateConfig(SCENARIO_CONFIG);
      } catch (error) {
        console.error('🔴 Erro ao buscar conteúdo:', error);
        isInitialized = false;
        // Configuração de fallback
        const fallbackConfig = {
          ...SCENARIO_CONFIG,
          successMessage:
            'Parabéns! Você compreende que a colimação é essencial para direcionar a radiação ao local específico, aumentando a eficácia do tratamento e a segurança do paciente.',
          detailedExplanation:
            'A resposta correta destaca que a colimação é usada para concentrar a radiação em uma área específica, minimizando a exposição desnecessária. As outras alternativas estão incorretas pois:\n' +
            '- Não relacionam a colimação com a segurança ou eficácia do tratamento.\n' +
            '- Sugerem aplicações não relacionadas à física médica.\n' +
            '- Apresentam conceitos absurdos ou humorísticos que não se aplicam. Não cite o número da alternativa como por exemplo primeira, segunda, terceria, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas',
        };
        SCENARIO_CONFIG = fallbackConfig;
        updateConfig(SCENARIO_CONFIG);
      }
    };
    resetConfig();
    fetchScenarioContent();
  }, [updateConfig]);

  // Configuração da cena
  useEffect(() => {
    if (!sceneRef.current) {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isDark ? 0x444444 : 0xffffff);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(65, 400 / 300, 0.2, 1000);
      camera.position.set(0, 5, 15);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(400, 300);
      rendererRef.current = renderer;
      mountRef.current?.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.target.set(0, 0, 0);
      controls.minDistance = 5.0;
      controls.maxDistance = 30.0;
      controlsRef.current = controls;

      // Iluminação
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
      directionalLight.position.set(5, 10, 7.5);
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
      cannon.position.set(SIMULATION_CONFIG.SOURCE_POSITION, 0, 0);
      scene.add(cannon);

      // Colimador
      const collimatorConfig = getSimulationConfig(scenarioNumber);
      const collimatorMaterial = new THREE.MeshPhongMaterial({
        color: collimatorConfig.collimatorMaterial === 'lead' ? 0x4b5563 : 0x8b5a2b,
        metalness: 0.5,
        roughness: 0.5,
        opacity: 0.9,
        transparent: true,
      });
      const collimator = new THREE.Mesh(
        new THREE.BoxGeometry(SIMULATION_CONFIG.COLLIMATOR_THICKNESS, 10, 10),
        collimatorMaterial
      );
      collimator.position.set(0, 0, 0);
      scene.add(collimator);

      // Abertura
      const apertureGeometry = new THREE.BoxGeometry(
        SIMULATION_CONFIG.COLLIMATOR_THICKNESS + 0.2,
        2,
        2
      );
      const apertureMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const aperture = new THREE.Mesh(apertureGeometry, apertureMaterial);
      aperture.position.set(0, 0, 0);
      scene.add(aperture);

      // Tela de detecção
      const screenGeometry = new THREE.PlaneGeometry(1, 10);
      const screenMaterial = new THREE.MeshPhongMaterial({
        color: 0x6b7280,
        side: THREE.DoubleSide,
      });
      const screen = new THREE.Mesh(screenGeometry, screenMaterial);
      screen.position.set(10, 0, 0);
      screen.rotation.y = -Math.PI / 2;
      scene.add(screen);

      // Label
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 1),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(createTextCanvas(`Cenário ${scenarioNumber}`)),
          transparent: true,
          side: THREE.DoubleSide,
        })
      );
      label.position.set(0, 5.5, 0);
      scene.add(label);
      labelRef.current = label;
    }
    // Atualiza o fundo da cena conforme o tema
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isDark ? 0x444444 : 0xffffff);
    }
    // Atualiza materiais conforme o tema
    const collimator = sceneRef.current.children.find(
      (child) => child.geometry instanceof THREE.BoxGeometry && child.material.opacity === 0.9
    );
    if (collimator) {
      collimator.material.color.set(isDark ? 0x4b5563 : 0x8b5a2b);
    }
  }, [isDark, scenarioNumber]);

  // Animação e gerenciamento de partículas
  useEffect(() => {
    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const controls = controlsRef.current;
    const label = labelRef.current;
    if (!scene || !camera || !renderer || !controls || !label) return;
    const scenarioConfig = getSimulationConfig(scenarioNumber);

    const createParticle = () => {
      const angleRange = Math.PI / 8;
      const theta = (Math.random() - 0.5) * angleRange;
      const phi = (Math.random() - 0.5) * angleRange;
      const velocity = new THREE.Vector3(SIMULATION_CONFIG.BASE_SPEED, 0, 0)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), theta)
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), phi);
      const position = new THREE.Vector3(SIMULATION_CONFIG.SOURCE_POSITION, 0, 0);
      const particle = new THREE.ArrowHelper(
        velocity.clone().normalize(),
        position.clone(),
        SIMULATION_CONFIG.PARTICLE_SIZE,
        0xff0000,
        SIMULATION_CONFIG.HEAD_LENGTH,
        SIMULATION_CONFIG.HEAD_WIDTH
      );
      particle.userData = {
        velocity: velocity,
        position: position.clone(),
        lastPosition: position.clone(),
        active: true,
        passedCollimator: false,
      };
      return particle;
    };

    const handleCollimatorCollision = (particle, config) => {
      const { position, velocity } = particle.userData;
      const halfThickness = SIMULATION_CONFIG.COLLIMATOR_THICKNESS / 2;
      const inCollimatorX = position.x >= -halfThickness && position.x <= halfThickness;
      if (inCollimatorX) {
        const inApertureY = position.y >= -1 && position.y <= 1;
        const inApertureZ = position.z >= -1 && position.z <= 1;
        if (inApertureY && inApertureZ) {
          // Partícula está dentro da abertura
          // Verifica se está próximo às bordas
          const edgeThreshold = 0.8; // Ajuste conforme necessário
          const nearEdgeY = Math.abs(position.y) >= edgeThreshold;
          const nearEdgeZ = Math.abs(position.z) >= edgeThreshold;
          if (nearEdgeY || nearEdgeZ) {
            // Simula dispersão devido à interação com as paredes
            const deflectionAngle = (Math.random() - 0.5) * config.maxDeflectionAngle;
            const axis = new THREE.Vector3(0, 1, 0).cross(velocity).normalize();
            velocity.applyAxisAngle(axis, deflectionAngle);
            // Aplica perda de energia
            velocity.multiplyScalar(1 - config.energyLossFactor * 0.05);
          } else {
            // Partícula está próxima ao centro
            const rand = Math.random();
            if (rand < config.collimationEfficiency) {
              const currentVelocity = velocity.clone();
              const idealVelocity = new THREE.Vector3(1, 0, 0).multiplyScalar(
                currentVelocity.length()
              );
              // Interpola em direção à direção ideal com força de paralelismo
              velocity.lerp(idealVelocity, config.parallelismStrength);
              // Aplica perda de energia
              velocity.multiplyScalar(1 - config.energyLossFactor * 0.01);
            }
          }
        } else {
          // Partícula está fora da abertura, colide com o material do colimador
          const rand = Math.random();
          if (rand < config.ricochetProbability) {
            // Ricochete
            const normal = new THREE.Vector3(-1, 0, 0);
            velocity.reflect(normal);
            // Adiciona desvio aleatório
            const randomDeviation = new THREE.Vector3(
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2,
              (Math.random() - 0.5) * 0.2
            );
            velocity.add(randomDeviation);
            // Aplica perda de energia
            velocity.multiplyScalar(1 - config.energyLossFactor);
          } else {
            // Partícula é absorvida
            particle.userData.active = false;
          }
        }
      }
    };

    const updateParticles = (deltaTime) => {
      const scaledDelta = deltaTime * SIMULATION_CONFIG.TIME_SCALE;
      const halfThickness = SIMULATION_CONFIG.COLLIMATOR_THICKNESS / 2;
      // Remove partículas em excesso
      while (particlesRef.current.length >= scenarioConfig.maxParticles) {
        const oldestParticle = particlesRef.current.shift();
        scene.remove(oldestParticle);
      }
      // Atualiza partículas ativas
      particlesRef.current = particlesRef.current.filter((particle) => {
        if (!particle.userData.active) return false;
        const { velocity, position, lastPosition, passedCollimator } = particle.userData;
        // Atualiza posição com base na velocidade
        position.copy(lastPosition).add(velocity.clone().multiplyScalar(scaledDelta));
        // Verifica interação com o colimador
        if (!passedCollimator && position.x >= -halfThickness && position.x <= halfThickness) {
          handleCollimatorCollision(particle, scenarioConfig);
          particle.userData.passedCollimator = true;
        }
        // Atualiza visualização da partícula
        particle.position.copy(position);
        particle.setDirection(velocity.clone().normalize());
        lastPosition.copy(position);
        // Remove partículas fora do limite
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
        // Cria novas partículas em intervalos
        if (currentTime - lastParticleTimeRef.current >= scenarioConfig.particleInterval) {
          const particle = createParticle();
          particlesRef.current.push(particle);
          scene.add(particle);
          lastParticleTimeRef.current = currentTime;
        }
        // Atualiza posições e interações das partículas
        updateParticles(deltaTime);
        // Atualiza orientação do label e controles
        label.lookAt(camera.position);
        controls.update();
      }
      // Renderiza a cena
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Inicia o loop de animação
    animate();

    // Limpeza ao desmontar
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, scenarioNumber]);

  // Função utilitária para criar canvas de texto
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

Scenario9.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};

export const getScenarioConfig = () => SCENARIO_CONFIG;
export { SCENARIO_CONFIG };
export default React.memo(Scenario9);
