import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import Scenario1, { SCENARIO_CONFIG as SCENARIO_1_CONFIG } from '../components/scenarios/Scenario1';
import Scenario2, { SCENARIO_CONFIG as SCENARIO_2_CONFIG } from '../components/scenarios/Scenario2';
import Scenario3, { SCENARIO_CONFIG as SCENARIO_3_CONFIG } from '../components/scenarios/Scenario3';
import Scenario4, { SCENARIO_CONFIG as SCENARIO_4_CONFIG } from '../components/scenarios/Scenario4';

const SCENARIOS = {
  Scenario1: {
    id: 'scenario1',
    component: Scenario1,
    config: SCENARIO_1_CONFIG,
    renderComponent: (props) => <Scenario1 {...props} />,
  },
  Scenario2: {
    id: 'scenario2',
    component: Scenario2,
    config: SCENARIO_2_CONFIG,
    renderComponent: (props) => <Scenario2 {...props} />,
  },
  Scenario3: {
    id: 'scenario3',
    component: Scenario3,
    config: SCENARIO_3_CONFIG,
    renderComponent: (props) => <Scenario3 {...props} />,
  },
  Scenario4: {
    id: 'scenario4',
    component: Scenario4,
    config: SCENARIO_4_CONFIG,
    renderComponent: (props) => <Scenario4 {...props} />,
  },
};

function ScenarioViewer() {
  const { scenarioId } = useParams();
  const [isDark, setIsDark] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15.0);
  const [initialStart, setInitialStart] = useState(true);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (SCENARIOS[scenarioId]) {
      setOptions(prepareOptions(SCENARIOS[scenarioId].config));
    }
  }, [scenarioId]);

  const prepareOptions = (scenarioConfig) => {
    const shuffledOptions = scenarioConfig.options
      .map((option) => ({ ...option }))
      .sort(() => Math.random() - 0.5);

    return shuffledOptions
      .map((option, index) => ({
        ...option,
        label: `${String.fromCharCode(65 + index)})  `,
        position: index,
      }))
      .sort((a, b) => a.position - b.position);
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  useEffect(() => {
    let timer = null;

    if (isPlaying) {
      if (initialStart) {
        setTimeLeft(15.0);
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
      setTimeLeft(15.0);
      setInitialStart(true);
    }
  };

  const handleOptionClick = (optionId) => {
    if (!selectedOption) {
      setSelectedOption(optionId);
      const selectedOption = options.find((opt) => opt.id === optionId);
      if (selectedOption.isCorrect) {
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
            {currentScenario.config.title}
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
            {currentScenario.config.question}
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
