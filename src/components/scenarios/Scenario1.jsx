import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { generateScenarioContent } from '../../services/openai';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario1',
  title: 'Cenário I: Atenuação de Radiação',
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
    id: 'scenario1',
    title: 'Cenário I: Atenuação de Radiação',
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

// Configurações da simulação
const SIMULATION_CONFIG = {
  SOURCE_POSITION: -2.0, // Posição inicial da fonte no eixo X. Alterar este valor move a fonte.
  BOUNDARY_RADIUS: 9.0, // Raio do limite onde as partículas são removidas da simulação.
  BASE_SPEED: 3.0, // Velocidade base das partículas. Aumentar este valor faz as partículas se moverem mais rápido.
  TIME_SCALE: 1, // Escala de tempo da simulação. Aumentar acelera o tempo, diminuir desacelera.
  REMOVAL_THRESHOLD: 1.5, // Limite de distância para remoção das partículas.
  PARTICLE_SIZE: 0.2, // Tamanho visual das partículas na simulação.
  HEAD_LENGTH: 0.1, // Comprimento da cabeça das setas que representam as partículas.
  HEAD_WIDTH: 0.1, // Largura da cabeça das setas.
  MIN_TRAVEL_DISTANCE: 4.0, // Distância mínima que as partículas viajam antes de serem removidas.
  CANNON_LENGTH: 0.8, // Comprimento do canhão (representação da fonte).
  CANNON_RADIUS: 0.15, // Raio do canhão.
  CANNON_SEGMENTS: 32, // Número de segmentos para desenhar o canhão (define a suavidade).
  CANNON_OPENING_RADIUS: 0.05, // Raio de abertura do canhão.
  EMISSION_ANGLE: 15, // Ângulo de emissão do canhão em graus. Alterar este valor muda a direção inicial das partículas.
  EMISSION_ANGLE_SPREAD: 15, // Ângulo de espalhamento das partículas em graus. Alterar este valor muda a dispersão das partículas emitidas.
};

// Prompt que é enviado para a API do OpenAI para gerar o conteúdo do cenário.
// Se quiser alterar o prompt que busca a resposta da API, modifique o texto abaixo.
const scenarioPrompt = `Gere uma questão de múltipla escolha sobre o seguinte cenário:
São mostrados dois cenários de atenuação de radiação em 3D:
- No primeiro cenário, a radiação interage com uma barreira com baixo coeficiente de atenuação
- No segundo cenário, a radiação interage com uma barreira com alto coeficiente de atenuação
- Em ambos os cenários, a fonte radioativa é a mesma e emite partículas com a mesma energia

A questão deve avaliar se o aluno compreende os conceitos de atenuação de radiação e interação com a matéria. IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário ler tudo e marcar a resposta correta.

Requisitos:
- A questão deve ter 4 alternativas
- Apenas uma alternativa deve estar correta
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis e uma alternativa deve ser absurda e totalmente nada a ver irônica ou engraçada.
- Foque na física da interação da radiação com a matéria
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar
- Inclua uma explicação detalhada da resposta correta e porque as outras alternativas estão erradas
- Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário ler tudo e marcar a resposta correta.

Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario1",
  "title": "",
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
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou, importante não citar os números da alternativa como por exemplo primeira, segunda, terceira, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas]",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta, importante não citar os números da alternativa como por exemplo primeira, segunda, terceira, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas]"
}`;

// Função para obter a configuração específica do cenário
const getSimulationConfig = (scenarioNumber) => {
  return {
    particleInterval: 5, // Intervalo entre emissões de partículas em milissegundos. Diminuir este valor faz a fonte emitir mais partículas.
    maxParticles: 400, // Número máximo de partículas na cena. Aumentar este valor permite mais partículas simultaneamente.
    ricochetProbability: scenarioNumber === 2 ? 0.8 : 0.2, // Probabilidade de ricochete (reflexão) na barreira. Alterar este valor muda o coeficiente de atenuação (maior valor, mais reflexão).
    transmissionProbability: scenarioNumber === 2 ? 0.15 : 0.7, // Probabilidade de transmissão através da barreira. Alterar este valor muda o coeficiente de atenuação (maior valor, mais transmissão).
  };
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
            'Parabéns! Você demonstrou compreender os princípios físicos da interação da radiação com a matéria e como diferentes materiais afetam a atenuação da radiação.';
          generatedContent.detailedExplanation =
            'A resposta correta considera que a atenuação está diretamente relacionada às propriedades do material, como o coeficiente de atenuação, que determina o quanto o material pode bloquear ou absorver a radiação. ' +
            'Além disso, o mesmo feixe de radiação interage de maneira diferente com materiais distintos, devido às suas características intrínsecas. ' +
            'As outras respostas estão incorretas porque confundem as propriedades dos materiais com as da radiação, ou não interpretam corretamente os mecanismos de interação envolvidos. ' +
            'Algumas ainda apresentam conceitos que não são fisicamente consistentes, como sugerir resultados que não são possíveis segundo os princípios físicos.Não cite o número da alternativa como por exemplo primeira, segunda, terceira, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas';
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario1',
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
            'Parabéns! Você demonstrou compreender os princípios físicos da interação da radiação com a matéria e como diferentes materiais afetam a atenuação da radiação.',
          detailedExplanation:
            'A resposta correta considera que a atenuação está diretamente ligada às propriedades do material, sendo influenciada por fatores como o coeficiente de atenuação, que determina a capacidade do material de absorver ou bloquear a radiação. ' +
            'O mesmo feixe de radiação pode interagir de maneiras distintas dependendo das características intrínsecas do material atravessado. ' +
            'As outras respostas estão incorretas porque apresentam conceitos equivocados, como confundir as propriedades do material com as da radiação, ignorar os mecanismos corretos de interação ou sugerir interpretações que não são fisicamente consistentes. Não cite o número da alternativa como por exemplo primeira, segunda, terceira, quarta ou A, B, C, D ou 1, 2, 3, 4 pois as alternativas estão embaralhadas',
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

      // Cria o canhão (fonte de partículas)
      const emissionAngle = THREE.MathUtils.degToRad(SIMULATION_CONFIG.EMISSION_ANGLE);
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

      // Cria o anteparo (barreira) na posição central.
      // Para aumentar a espessura do anteparo, altere o primeiro parâmetro (0.2) da BoxGeometry abaixo.
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

    // Converte o ângulo de emissão para radianos
    const emissionAngle = THREE.MathUtils.degToRad(SIMULATION_CONFIG.EMISSION_ANGLE);

    // Função responsável por criar uma nova partícula
    const createParticle = () => {
      // Gera ângulos aleatórios para a direção inicial da partícula dentro do espalhamento definido.
      const theta = THREE.MathUtils.degToRad(
        THREE.MathUtils.randFloatSpread(SIMULATION_CONFIG.EMISSION_ANGLE_SPREAD)
      ); // Ângulo aleatório em torno do eixo Y.
      const phi = THREE.MathUtils.degToRad(
        THREE.MathUtils.randFloatSpread(SIMULATION_CONFIG.EMISSION_ANGLE_SPREAD)
      ); // Ângulo aleatório em torno do eixo Z.

      // Calcula a velocidade inicial da partícula com base nos ângulos aleatórios.
      const velocity = new THREE.Vector3(
        SIMULATION_CONFIG.BASE_SPEED * Math.cos(theta) * Math.cos(phi),
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(phi) + 1,
        SIMULATION_CONFIG.BASE_SPEED * Math.sin(theta) * Math.cos(phi)
      );

      // Define a posição inicial da partícula na ponta do canhão.
      const position = new THREE.Vector3(
        SIMULATION_CONFIG.SOURCE_POSITION +
          (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.cos(emissionAngle),
        (SIMULATION_CONFIG.CANNON_LENGTH / 2) * Math.sin(emissionAngle),
        0
      );

      // Cria uma seta para representar a partícula.
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
      };

      return particle;
    };

    // Função responsável por atualizar as partículas existentes na cena.
    // Esta função é responsável por guiar as partículas em movimento retilíneo uniforme (MRU).
    const updateParticles = (deltaTime) => {
      const scaledDelta = deltaTime * SIMULATION_CONFIG.TIME_SCALE;

      // Limpa partículas antigas se ultrapassar o máximo permitido.
      while (particlesRef.current.length >= scenarioConfig.maxParticles) {
        const oldestParticle = particlesRef.current.shift();
        scene.remove(oldestParticle);
      }

      particlesRef.current = particlesRef.current.filter((particle) => {
        if (!particle.userData.active) return false;

        const { velocity, position, lastPosition } = particle.userData;
        position.copy(lastPosition).add(velocity.clone().multiplyScalar(scaledDelta));

        // Verifica colisão com o anteparo (barreira)
        // Os limites abaixo devem corresponder à metade das dimensões do anteparo definido na BoxGeometry
        if (
          position.x >= -0.1 && // Metade da espessura do anteparo em X
          position.x <= 0.1 &&
          position.y >= -1.25 && // Metade da altura do anteparo em Y
          position.y <= 1.25 &&
          position.z >= -0.5 && // Metade da profundidade do anteparo em Z
          position.z <= 0.5
        ) {
          const rand = Math.random();

          if (rand < scenarioConfig.ricochetProbability) {
            // Partícula ricocheteia (reflete) na barreira
            velocity.x *= -1;
            position.x = velocity.x > 0 ? 0.11 : -0.11;
          } else if (
            rand <
            scenarioConfig.ricochetProbability + scenarioConfig.transmissionProbability
          ) {
            // Partícula é transmitida através da barreira
            position.x = velocity.x > 0 ? 0.11 : -0.11;
          } else {
            // Partícula é absorvida pela barreira e removida
            scene.remove(particle);
            return false;
          }
        }

        particle.position.copy(position);
        particle.setDirection(velocity.clone().normalize());
        lastPosition.copy(position);

        // Remove partículas que saíram dos limites da cena
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

// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario1);
