import PropTypes from 'prop-types';
import { Trophy, Star, Crown, Medal, PartyPopper } from 'lucide-react';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const CONGRATULATION_MESSAGES = [
  '🎯 Extraordinário! Três acertos seguidos demonstram seu domínio impressionante da Simulação de Monte Carlo. Com certeza o Prof. William ficará orgulhoso desse desempenho excepcional!',
  '🎓 Brilhante! Três respostas perfeitas! Não preciso nem fazer simulações de Monte Carlo para saber que você vai tirar nota máxima na disciplina PPGEB42. Seu conhecimento é notável!',
  '⚡ Fenomenal! Sua sequência de três acertos mostra que sua compreensão dos conceitos de Monte Carlo é tão precisa quanto os resultados das nossas simulações. Parabéns pelo desempenho extraordinário!',
  '🌟 Impressionante! Com três acertos consecutivos, você provou que domina a física médica e Monte Carlo como poucos. A turma 2024/02 tem um verdadeiro especialista!',
  '🏆 Excepcional! Três respostas corretas seguidas mostram que seu entendimento sobre transporte de radiação e Monte Carlo é digno de aplausos. Continue brilhando assim!',
  '🎨 Magnífico! Você interpretou cada cenário com maestria e alcançou três acertos perfeitos. Sua compreensão da Simulação de Monte Carlo na medicina é verdadeiramente notável!',
];

const CongratulationModal = ({ isOpen, onClose, isDark }) => {
  const [message, setMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const fireConfetti = () => {
    // Primeiro estouro
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
    };

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });

    // Confetti contínuo
    setTimeout(() => {
      const end = Date.now() + 3 * 1000; // 3 segundos de duração

      const interval = setInterval(() => {
        if (Date.now() > end) {
          clearInterval(interval);
          return;
        }

        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff0000', '#00ff00', '#0000ff'],
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff0000', '#00ff00', '#0000ff'],
        });
      }, 50);
    }, 500);
  };

  useEffect(() => {
    if (isOpen) {
      setMessage(
        CONGRATULATION_MESSAGES[Math.floor(Math.random() * CONGRATULATION_MESSAGES.length)]
      );
      setIsAnimating(true);
      fireConfetti();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div
        className={`
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-2xl p-6 md:p-8 w-full max-w-2xl mx-auto shadow-2xl
          transform transition-all duration-500
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
          relative overflow-hidden
        `}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="relative">
          {/* Header section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Crown
                size={48}
                className={`${isDark ? 'text-yellow-400' : 'text-yellow-500'} animate-bounce`}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
            </div>

            <h2
              className={`text-3xl md:text-4xl font-bold mt-4 mb-2 text-center ${
                isDark ? 'text-yellow-400' : 'text-yellow-500'
              }`}
            >
              🎉 Vitória Extraordinária! 🎉
            </h2>
          </div>

          {/* Achievement icons */}
          <div className="flex justify-center gap-4 mb-6">
            <Trophy
              size={32}
              className={`${isDark ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`}
            />
            <Star
              size={32}
              className={`${isDark ? 'text-blue-400' : 'text-blue-500'} animate-pulse`}
            />
            <Medal
              size={32}
              className={`${isDark ? 'text-green-400' : 'text-green-500'} animate-pulse`}
            />
            <PartyPopper
              size={32}
              className={`${isDark ? 'text-purple-400' : 'text-purple-500'} animate-pulse`}
            />
          </div>

          {/* Congratulation message */}
          <div
            className={`
            p-6 rounded-xl mb-6
            ${isDark ? 'bg-gray-700' : 'bg-blue-50'}
            transform transition-all duration-300 hover:scale-105
          `}
          >
            <p className="text-lg md:text-xl text-center leading-relaxed">{message}</p>
          </div>

          {/* Score display */}
          <div className="flex justify-center items-center gap-2 mb-6">
            <div
              className={`
              px-6 py-3 rounded-full font-bold text-xl
              ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}
            `}
            >
              Pontuação Máxima: 3/3 ⭐
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className={`
                px-6 py-3 rounded-lg flex-1 sm:flex-initial
                transition-all transform hover:scale-105
                text-base md:text-lg font-medium
                flex items-center justify-center gap-2
                ${
                  isDark
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }
              `}
            >
              <Trophy size={20} />
              Jogar Novamente
            </button>

            <button
              onClick={onClose}
              className={`
                px-6 py-3 rounded-lg flex-1 sm:flex-initial
                transition-all transform hover:scale-105
                text-base md:text-lg font-medium
                ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }
              `}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

CongratulationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default CongratulationModal;
