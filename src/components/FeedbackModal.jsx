import PropTypes from 'prop-types';
import { Trophy, XCircle } from 'lucide-react';

const successMessages = [
  'Nossa, parabéns! Você realmente entende de Monte Carlo. Vamos para a próxima? Seu objetivo é acertar 5 seguidas!',
  'Excelente! Seus conhecimentos em física das radiações são impressionantes. Continue assim!',
  'Perfeito! Você domina bem os conceitos de atenuação e transporte de radiação. Próximo desafio?',
];

const failureMessages = [
  'Ahh que pena, parece que você precisa estudar mais... sua pontuação vai zerar :(',
  'Ops! Não foi dessa vez. Que tal revisar os conceitos de coeficiente de atenuação linear?',
  'Quase lá! Mas vamos precisar zerar sua pontuação. Tente observar melhor o comportamento das partículas.',
];

const FeedbackModal = ({ isOpen, onClose, isSuccess, score, isDark }) => {
  if (!isOpen) return null;

  const messages = isSuccess ? successMessages : failureMessages;
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  const handleClose = () => {
    if (!isSuccess) {
      // Se perdeu, faz reload completo da página
      window.location.reload();
    } else {
      // Se ganhou, continua normal
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className={`
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-lg p-4 md:p-6 w-full max-w-md mx-auto shadow-xl
          transform transition-all scale-95 md:scale-100
        `}
      >
        <div className="text-center space-y-4">
          {/* Ícone e Título */}
          <div className="flex flex-col items-center">
            {isSuccess ? (
              <Trophy size={32} className="text-green-500 mb-2" />
            ) : (
              <XCircle size={32} className="text-yellow-500 mb-2" />
            )}
            <div
              className={`text-xl md:text-2xl font-bold ${
                isSuccess ? 'text-green-500' : 'text-yellow-500'
              }`}
            >
              {isSuccess ? '🎉 Parabéns!' : '😔 Não foi dessa vez!'}
            </div>
          </div>

          {/* Mensagem */}
          <p className="text-sm md:text-base px-2 md:px-4">{randomMessage}</p>

          {/* Pontuação */}
          <div className="flex items-center justify-center gap-2 text-base md:text-lg">
            {isSuccess ? (
              <>
                <span className="font-bold">Pontuação atual:</span>
                <span className="font-bold text-xl text-green-500">{score}</span>
              </>
            ) : (
              <span className="font-bold text-yellow-500">Infelizmente sua pontuação zerou</span>
            )}
          </div>

          {/* Botão */}
          <button
            onClick={handleClose}
            className={`
              w-full md:w-auto px-6 py-3 rounded-lg
              transition-all transform hover:scale-105
              text-base md:text-lg font-medium
              ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            `}
          >
            {isSuccess ? 'Continuar' : 'Recomeçar'}
          </button>
        </div>
      </div>
    </div>
  );
};

FeedbackModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isSuccess: PropTypes.bool.isRequired,
  score: PropTypes.number.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default FeedbackModal;
