import PropTypes from 'prop-types';
import { PlayIcon, InfoIcon, Target } from 'lucide-react';

const WelcomeModal = ({ isOpen, onStart, isDark }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center p-2 md:p-4 z-50 overflow-y-auto">
      <div
        className={`
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          rounded-lg p-4 md:p-8 w-full max-w-2xl mx-auto shadow-xl transform transition-all
          relative my-4 md:my-0
        `}
      >
        {/* Ícone superior - escondido em mobile */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 hidden md:block">
          <div
            className={`
              ${isDark ? 'bg-gray-700' : 'bg-white'}
              rounded-full p-4 shadow-lg
            `}
          >
            <InfoIcon size={32} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
          </div>
        </div>

        <div className="text-center">
          {/* Cabeçalho com ícone para mobile */}
          <div className="flex items-center justify-center gap-2 mb-4 md:hidden">
            <InfoIcon size={24} className={isDark ? 'text-blue-400' : 'text-blue-500'} />
            <h2 className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Bem-vindo! 🎯
            </h2>
          </div>

          {/* Título para desktop */}
          <h2
            className={`text-2xl font-bold mb-6 hidden md:block ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
          >
            Bem-vindo ao Quiz Monte Carlo!
          </h2>

          <div className="space-y-4 md:space-y-6 text-left">
            <p className="text-sm md:text-base">
              Bem-vindo ao <span className="font-semibold">montecarloquiz.online</span>, um webapp
              que vai testar seus conhecimentos sobre simulação de Monte Carlo aplicado à física
              médica, especialmente desenvolvido para a disciplina PPGEB42 turma 2024/02 Simulação
              de Monte Carlo Aplicada à Medicina e Biologia, do PPGEB da UFU.
            </p>

            <div
              className={`
                p-4 md:p-6 rounded-lg border-2
                ${isDark ? 'border-blue-500 bg-gray-700' : 'border-blue-400 bg-blue-50'}
                transform transition-all hover:scale-105
              `}
            >
              <div className="flex items-center gap-2 md:gap-3 mb-3">
                <Target size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                <h3
                  className={`text-lg md:text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                >
                  Como Funciona o Quiz? 🎮
                </h3>
              </div>

              <div className="space-y-4 text-sm md:text-base">
                <div className="ml-1 md:ml-2">
                  <p className="font-medium mb-2">Dinâmica do jogo:</p>
                  <ul className="space-y-1 md:space-y-2 list-disc list-inside ml-2">
                    <li>Serão apresentados dois cenários de simulação lado a lado</li>
                    <li>Observe atentamente o comportamento das partículas em cada cenário</li>
                    <li>Uma pergunta e quatro alternativas serão geradas por IA</li>
                    <li>Escolha a alternativa que melhor explica os fenômenos observados</li>
                  </ul>
                </div>

                <div className="ml-1 md:ml-2">
                  <p className="font-medium mb-2">Para vencer, você precisa:</p>
                  <ul className="space-y-1 md:space-y-2 list-disc list-inside ml-2">
                    <li>
                      Acertar{' '}
                      <span className={`font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        5 questões consecutivas
                      </span>{' '}
                      🏆
                    </li>
                    <li>
                      Responder cada questão em até{' '}
                      <span className={`font-bold ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        20 segundos
                      </span>{' '}
                      ⏱️
                    </li>
                  </ul>
                </div>

                <div className="mt-3 pt-3 md:mt-4 md:pt-4 border-t border-gray-600">
                  <p
                    className={`font-medium text-sm md:text-base ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}
                  >
                    ⚠️ Importante: Se errar uma questão ou o tempo acabar, a pontuação volta a zero
                    e um novo desafio começará! A geração das perguntas pode levar alguns segundos.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-center font-bold mt-4 md:mt-6 text-base md:text-lg">
              Pronto para o desafio? Boa Sorte! 🍀
            </p>
          </div>

          <button
            onClick={onStart}
            className={`
              w-full md:w-auto px-4 md:px-6 py-3 rounded-lg transition-all
              inline-flex items-center justify-center gap-2
              transform hover:scale-105 mt-4 md:mt-6
              text-base md:text-lg
              ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
            `}
          >
            <PlayIcon size={20} />
            Começar a Jogar
          </button>

          {/* Créditos */}
          <div className="mt-6 pt-4 border-t border-gray-600 text-center text-sm opacity-80">
            <p>
              Desenvolvido pelo aluno Francisco Diego | (34)9.9900-5794 | franciscodnlneto@gmail.com
              <br />
              <span className="text-xs">
                Doutorando no PPGEB - UFU | Projeto apresentado na disciplina PPGEB42 - Simulação de
                Monte Carlo Aplicada à Medicina e Biologia | Programa de Pós-Graduação em Engenharia
                Biomédica - UFU | Nov&apos;2024
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

WelcomeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onStart: PropTypes.func.isRequired,
  isDark: PropTypes.bool.isRequired,
};

export default WelcomeModal;
