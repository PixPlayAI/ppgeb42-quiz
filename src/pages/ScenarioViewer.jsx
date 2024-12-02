// src/pages/ScenarioViewer.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

import Scenario1, {
  getScenarioConfig as getScenario1Config,
} from '../components/scenarios/Scenario1';

import Scenario2, {
  getScenarioConfig as getScenario2Config,
} from '../components/scenarios/Scenario2';

import Scenario3, {
  getScenarioConfig as getScenario3Config,
} from '../components/scenarios/Scenario3';

import Scenario4, {
  getScenarioConfig as getScenario4Config,
} from '../components/scenarios/Scenario4';

import Scenario5, {
  getScenarioConfig as getScenario5Config,
} from '../components/scenarios/Scenario5';

import Scenario6, {
  getScenarioConfig as getScenario6Config,
} from '../components/scenarios/Scenario6';

import Scenario7, {
  getScenarioConfig as getScenario7Config,
} from '../components/scenarios/Scenario7';

import Scenario8, {
  getScenarioConfig as getScenario8Config,
} from '../components/scenarios/Scenario8';

import Scenario9, {
  getScenarioConfig as getScenario9Config,
} from '../components/scenarios/Scenario9';

import Scenario10, {
  getScenarioConfig as getScenario10Config,
} from '../components/scenarios/Scenario10';

import Scenario11, {
  getScenarioConfig as getScenario11Config,
} from '../components/scenarios/Scenario11';

import Scenario12, {
  getScenarioConfig as getScenario12Config,
} from '../components/scenarios/Scenario12';

const SCENARIOS = {
  Scenario1: {
    id: 'scenario1',
    component: Scenario1,
    get config() {
      return getScenario1Config();
    },
    renderComponent: (props) => <Scenario1 {...props} />,
  },

  Scenario2: {
    id: 'scenario2',
    component: Scenario2,
    get config() {
      return getScenario2Config();
    },
    renderComponent: (props) => <Scenario2 {...props} />,
  },

  Scenario3: {
    id: 'scenario3',
    component: Scenario3,
    get config() {
      return getScenario3Config();
    },
    renderComponent: (props) => <Scenario3 {...props} />,
  },

  Scenario4: {
    id: 'scenario4',
    component: Scenario4,
    get config() {
      return getScenario4Config();
    },
    renderComponent: (props) => <Scenario4 {...props} />,
  },
  Scenario5: {
    id: 'scenario5',
    component: Scenario5,
    get config() {
      return getScenario5Config();
    },
    renderComponent: (props) => <Scenario5 {...props} />,
  },
  Scenario6: {
    id: 'scenario6',
    component: Scenario6,
    get config() {
      return getScenario6Config();
    },
    renderComponent: (props) => <Scenario6 {...props} />,
  },
  Scenario7: {
    id: 'scenario7',
    component: Scenario7,
    get config() {
      return getScenario7Config();
    },
    renderComponent: (props) => <Scenario7 {...props} />,
  },
  Scenario8: {
    id: 'scenario8',
    component: Scenario8,
    get config() {
      return getScenario8Config();
    },
    renderComponent: (props) => <Scenario8 {...props} />,
  },
  Scenario9: {
    id: 'scenario9',
    component: Scenario9,
    get config() {
      return getScenario9Config();
    },
    renderComponent: (props) => <Scenario9 {...props} />,
  },
  Scenario10: {
    id: 'scenario10',
    component: Scenario10,
    get config() {
      return getScenario10Config();
    },
    renderComponent: (props) => <Scenario10 {...props} />,
  },

  Scenario11: {
    id: 'scenario11',
    component: Scenario11,
    get config() {
      return getScenario11Config();
    },
    renderComponent: (props) => <Scenario11 {...props} />,
  },

  Scenario12: {
    id: 'scenario12',
    component: Scenario12,
    get config() {
      return getScenario12Config();
    },
    renderComponent: (props) => <Scenario12 {...props} />,
  },
};

function ScenarioViewer() {
  const { scenarioId } = useParams();
  const [isDark, setIsDark] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30.0);
  const [initialStart, setInitialStart] = useState(true);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [scenarioConfig, setScenarioConfig] = useState(null); // Inicializa como null

  // Modifique o useEffect para não fazer polling
  useEffect(() => {
    if (SCENARIOS[scenarioId]) {
      console.log('🎲 Iniciando monitoramento do cenário:', scenarioId);

      // Reseta o estado quando o cenário muda
      setScenarioConfig(null);
      setOptions([]);

      const handleConfigUpdate = () => {
        console.log('📢 Evento de atualização recebido');
        const currentConfig = SCENARIOS[scenarioId].config;
        console.log('🔄 Config atualizada:', currentConfig);
        setScenarioConfig(currentConfig);
        setOptions(prepareOptions(currentConfig));
      };

      window.addEventListener('scenarioConfigUpdated', handleConfigUpdate);

      return () => {
        window.removeEventListener('scenarioConfigUpdated', handleConfigUpdate);
      };
    }
  }, [scenarioId]);

  const prepareOptions = (scenarioConfig) => {
    console.log('🔄 Preparando opções com config:', scenarioConfig);
    const shuffledOptions = scenarioConfig.options
      .map((option) => ({ ...option }))
      .sort(() => Math.random() - 0.5);

    const preparedOptions = shuffledOptions
      .map((option, index) => ({
        ...option,
        label: `${String.fromCharCode(65 + index)})  `,
        position: index,
      }))
      .sort((a, b) => a.position - b.position);

    console.log('✅ Opções preparadas:', preparedOptions);
    return preparedOptions;
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  useEffect(() => {
    let timer = null;

    if (isPlaying) {
      if (initialStart) {
        setTimeLeft(30.0);
        setInitialStart(false);
      }

      timer = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = parseFloat((prev - 0.1).toFixed(1));
          if (newTime <= 0) {
            if (timer) clearInterval(timer);
            setIsPlaying(false);
            return 0;
          }
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, initialStart]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleSimulationToggle = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setSelectedOption(null);
      setTimeLeft(30.0);
      setInitialStart(true);
    }
  };

  const handleOptionClick = (optionId) => {
    if (!selectedOption) {
      setSelectedOption(optionId);
      const selectedOpt = options.find((opt) => opt.id === optionId);
      if (selectedOpt.isCorrect) {
        console.log('Correto!');
      } else {
        console.log('Incorreto!');
      }
    }
  };

  if (!SCENARIOS[scenarioId]) {
    return (
      <div
        className={`min-h-screen py-8 px-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Cenário não encontrado</h1>
          <p>O cenário &quot;{scenarioId}&quot; não existe.</p>
        </div>
      </div>
    );
  }

  const currentScenario = SCENARIOS[scenarioId];

  return (
    <div
      className={`min-h-screen py-4 px-2 md:py-8 md:px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'} overflow-y-auto`}
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-8 px-2">
          <h1
            className={`text-xl md:text-3xl font-bold mb-0 text-center flex-grow ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {scenarioConfig?.title || 'Carregando...'}
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${isDark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-800'} hover:bg-opacity-80 transition-colors fixed top-4 right-4 z-10 md:static`}
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:gap-8">
          <div className="w-full md:w-auto overflow-x-auto pb-4 md:pb-0">
            {currentScenario.renderComponent({
              isPlaying,
              isDark,
              scenarioNumber: 1,
            })}
          </div>

          <div className="flex flex-col items-center min-w-[200px] space-y-4">
            <button
              onClick={handleSimulationToggle}
              className={`w-full md:w-auto px-6 py-3 rounded-lg transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              {isPlaying ? 'Pausar Simulação' : 'Iniciar Simulação'}
            </button>
            <div
              className={`text-4xl md:text-5xl font-bold ${isDark ? 'text-yellow-300' : 'text-blue-600'}`}
            >
              {timeLeft.toFixed(1)}s
            </div>
          </div>

          <div className="w-full md:w-auto overflow-x-auto pb-4 md:pb-0">
            {currentScenario.renderComponent({
              isPlaying,
              isDark,
              scenarioNumber: 2,
            })}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-2 md:px-4 mt-4 md:mt-8 transition-all duration-500 opacity-100 translate-y-0">
          <h2
            className={`text-lg md:text-xl font-semibold mb-4 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {scenarioConfig?.question || 'Carregando...'}
          </h2>
          <div className="grid gap-3">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionClick(option.id)}
                className={`p-3 md:p-4 rounded-lg text-left min-h-[60px] md:min-h-[80px] flex items-center text-sm md:text-base
                  ${
                    selectedOption
                      ? option.isCorrect
                        ? 'bg-green-500 text-white'
                        : option.id === selectedOption
                          ? 'bg-red-500 text-white'
                          : isDark
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                  border transition-colors
                  ${isDark ? 'border-gray-700' : 'border-gray-200'}
                  cursor-pointer`}
              >
                <span className="w-[30px] md:w-[40px] font-bold text-base md:text-lg">
                  {option.label}
                </span>
                <span className="flex-1">{option.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioViewer;
