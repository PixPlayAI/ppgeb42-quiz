import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import FeedbackModal from './components/FeedbackModal';
import WelcomeModal from './components/WelcomeModal';
import CongratulationModal from './components/CongratulationModal';
import Scenario1, { SCENARIO_CONFIG as SCENARIO_1_CONFIG } from './components/scenarios/Scenario1';
import Scenario2, { SCENARIO_CONFIG as SCENARIO_2_CONFIG } from './components/scenarios/Scenario2';
import Scenario3, { SCENARIO_CONFIG as SCENARIO_3_CONFIG } from './components/scenarios/Scenario3';
import Scenario4, { SCENARIO_CONFIG as SCENARIO_4_CONFIG } from './components/scenarios/Scenario4';
import Scenario5, { SCENARIO_CONFIG as SCENARIO_5_CONFIG } from './components/scenarios/Scenario5';
import PropTypes from 'prop-types';
import Footer from './components/Footer';

const AVAILABLE_SCENARIOS = [
  {
    id: 'scenario1',
    component: Scenario1,
    config: SCENARIO_1_CONFIG,
    renderComponent: (props) => <Scenario1 {...props} />,
  },
  {
    id: 'scenario2',
    component: Scenario2,
    config: SCENARIO_2_CONFIG,
    renderComponent: (props) => <Scenario2 {...props} />,
  },
  {
    id: 'scenario3',
    component: Scenario3,
    config: SCENARIO_3_CONFIG,
    renderComponent: (props) => <Scenario3 {...props} />,
  },
  {
    id: 'scenario4',
    component: Scenario4,
    config: SCENARIO_4_CONFIG,
    renderComponent: (props) => <Scenario4 {...props} />,
  },
  {
    id: 'scenario5',
    component: Scenario5,
    config: SCENARIO_5_CONFIG,
    renderComponent: (props) => <Scenario5 {...props} />,
  },
];

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showSimulations, setShowSimulations] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const [options, setOptions] = useState([]);
  const [initialStart, setInitialStart] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15.0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [scenarioQueue, setScenarioQueue] = useState([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);

  useEffect(() => {
    const generateScenarioQueue = () => {
      const queue = Array(5)
        .fill(null)
        .map(() => Math.floor(Math.random() * AVAILABLE_SCENARIOS.length));
      setScenarioQueue(queue);
    };

    generateScenarioQueue();
  }, []);

  const getCurrentScenario = () => {
    return AVAILABLE_SCENARIOS[scenarioQueue[currentQueueIndex] || 0];
  };

  useEffect(() => {
    if (showSimulations) {
      const currentScenario = getCurrentScenario();
      setOptions(prepareOptions(currentScenario.config));
    }
  }, [currentQueueIndex, showSimulations]);

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

  const resetState = () => {
    setShowOptions(false);
    setIsPlaying(false);
    setHasAnswered(false);
    setSelectedAnswer(null);
    setInitialStart(true);
    setTimeLeft(15.0);
  };

  const handleStartGame = () => {
    setShowWelcome(false);
    handleSimulationToggle();
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
            setLastAnswerCorrect(false);
            setIsModalOpen(true);
            setScore(0);
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

  const handleSimulationToggle = () => {
    if (!showSimulations) {
      resetState();
      setShowOptions(true);
      setShowSimulations(true);
      setIsPlaying(true);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  const handleAnswer = (option) => {
    setSelectedAnswer(option.id);
    setHasAnswered(true);
    setLastAnswerCorrect(option.isCorrect);
    if (option.isCorrect) {
      const newScore = Math.min(score + 1, 5);
      setScore(newScore);

      if (newScore === 5) {
        setShowCongratulations(true);
      }
    }
    setIsPlaying(false);
    setTimeout(() => {
      setIsModalOpen(true);
    }, 50);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);

    if (!lastAnswerCorrect) {
      window.location.reload();
      return;
    }

    if (score === 5) {
      return;
    }

    setCurrentQueueIndex((prev) => prev + 1);
    resetState();
    setShowOptions(true);
    setIsPlaying(true);
  };

  const handleCongratulationsClose = () => {
    setShowCongratulations(false);
    window.location.reload();
  };

  const currentScenario = getCurrentScenario();

  return (
    <div
      className={`min-h-screen py-4 px-2 md:py-8 md:px-4 ${isDark ? 'bg-gray-900' : 'bg-gray-100'} overflow-y-auto`}
    >
      <WelcomeModal isOpen={showWelcome} onStart={handleStartGame} isDark={isDark} />

      <CongratulationModal
        isOpen={showCongratulations}
        onClose={handleCongratulationsClose}
        isDark={isDark}
      />

      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-8 px-2">
          <h1
            className={`text-xl md:text-3xl font-bold mb-0 text-center flex-grow ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            Quiz Monte Carlo
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full ${
              isDark ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-gray-800'
            } hover:bg-opacity-80 transition-colors fixed top-4 right-4 z-10 md:static`}
          >
            {isDark ? <Sun size={24} /> : <Moon size={24} />}
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:gap-8">
          {showSimulations ? (
            <>
              <div className="w-full md:w-auto overflow-x-auto pb-4 md:pb-0">
                {currentScenario.renderComponent({
                  isPlaying,
                  isDark,
                  scenarioNumber: 1,
                })}
              </div>

              <div className="flex flex-col items-center min-w-[200px] space-y-4">
                {score > 0 && (
                  <div className="text-lg font-semibold">
                    {score === 1 ? '1 pt' : `${score} pts`}
                  </div>
                )}
                {showSimulations && (
                  <div
                    className={`text-4xl md:text-5xl font-bold ${
                      isDark ? 'text-yellow-300' : 'text-blue-600'
                    }`}
                  >
                    {timeLeft.toFixed(1)}s
                  </div>
                )}
              </div>

              <div className="w-full md:w-auto overflow-x-auto pb-4 md:pb-0">
                {currentScenario.renderComponent({
                  isPlaying,
                  isDark,
                  scenarioNumber: 2,
                })}
              </div>
            </>
          ) : (
            !showWelcome && (
              <button
                onClick={handleSimulationToggle}
                className={`w-full md:w-auto px-6 py-3 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Iniciar Simulação
              </button>
            )
          )}
        </div>

        {isModalOpen && !showCongratulations && (
          <FeedbackModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            isSuccess={lastAnswerCorrect}
            score={score}
            isDark={isDark}
          />
        )}

        {showOptions && (
          <div
            className={`max-w-2xl mx-auto px-2 md:px-4 mt-4 md:mt-8 transition-all duration-500 ${
              showOptions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2
              className={`text-lg md:text-xl font-semibold mb-4 text-center ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {currentScenario.config.question}
            </h2>
            <div className="grid gap-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option)}
                  disabled={hasAnswered}
                  className={`p-3 md:p-4 rounded-lg text-left min-h-[60px] md:min-h-[80px] flex items-center text-sm md:text-base ${
                    hasAnswered
                      ? option.isCorrect
                        ? isDark
                          ? 'bg-green-700 border-green-600 text-white'
                          : 'bg-green-600 border-green-700 text-white'
                        : option.id === selectedAnswer
                          ? isDark
                            ? 'bg-red-700 border-red-600 text-white'
                            : 'bg-red-600 border-red-700 text-white'
                          : isDark
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-gray-100 text-gray-700'
                      : isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-white'
                        : 'bg-white hover:bg-gray-50 text-gray-900'
                  } border transition-colors ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <span className="w-[30px] md:w-[40px] font-bold text-base md:text-lg">
                    {option.label}
                  </span>
                  <span className="flex-1">{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      {showSimulations && <Footer isDark={isDark} />}
    </div>
  );
}

App.propTypes = {
  option: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    isCorrect: PropTypes.bool.isRequired,
    label: PropTypes.string,
  }),
};

export default App;
