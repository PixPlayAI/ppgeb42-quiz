// src/components/FeedbackModal.jsx
import PropTypes from 'prop-types';
import { Trophy, XCircle } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, isSuccess, score, isDark, scenarioConfig }) => {
  if (!isOpen) return null;

  // Log para debug
  console.log('Scenario Config in Modal:', scenarioConfig);

  const handleClose = () => {
    if (!isSuccess) {
      window.location.reload();
    } else {
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
          overflow-y-auto max-h-[90vh]
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

          {/* Mensagem Personalizada */}
          <div className="text-sm md:text-base px-2 md:px-4 text-left">
            {isSuccess ? (
              <>
                {scenarioConfig?.successMessage ? (
                  <p className="mb-4">{scenarioConfig.successMessage}</p>
                ) : (
                  <p className="mb-4">
                    Excelente compreensão dos conceitos físicos! Continue assim!
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mb-4 font-semibold">Vamos entender melhor este conceito:</p>
                {scenarioConfig?.detailedExplanation ? (
                  <p className="mb-4">{scenarioConfig.detailedExplanation}</p>
                ) : (
                  <p className="mb-4">
                    Revise os conceitos de cargas elétricas e sua interação com campos elétricos.
                    Lembre-se que cargas de sinais opostos se atraem, enquanto cargas de mesmo sinal
                    se repelem.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Pontuação */}
          <div className="flex items-center justify-center gap-2 text-base md:text-lg">
            {isSuccess ? (
              <>
                <span className="font-bold">Pontuação atual:</span>
                <span className="font-bold text-xl text-green-500">{score}</span>
              </>
            ) : (
              <span className="font-bold text-yellow-500">
                Não desanime! Você pode tentar novamente.
              </span>
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
            {isSuccess ? 'Continuar' : 'Tentar Novamente'}
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
  scenarioConfig: PropTypes.shape({
    successMessage: PropTypes.string,
    detailedExplanation: PropTypes.string,
  }),
};

export default FeedbackModal;
