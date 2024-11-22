import PropTypes from 'prop-types';
import { Github } from 'lucide-react';

const Footer = ({ isDark }) => {
  return (
    <footer
      className={`mt-8 py-6 px-4 border-t ${isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-gray-50/50'}`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Website Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <h3 className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                MonteCarloQuiz.online 🎲
              </h3>
              <a
                href="https://github.com/PixPlayAI/ppgeb42-quiz"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-base
      ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white hover:bg-gray-100 text-gray-700'}
      border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <Github size={20} />
                <span>Ver código no GitHub</span>
              </a>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Plataforma gamificada que avalia, de modo descontraído e divertido, o conhecimento dos
              alunos sobre Simulação de Monte Carlo Aplicada à Medicina e Biologia, apresentados na
              disciplina PPGEB42, demonstrando conceitos teóricos em cenários simulados 🎮✨
            </p>
          </div>
          {/* Author Info */}
          <div
            className={`text-center md:text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
          >
            <h4 className="font-bold mb-2">
              Desenvolvido pelo aluno Francisco Diego Negrão Lopes Neto 👨‍💻
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-center md:justify-end gap-x-4">
                <p>
                  <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>🎓 Doutorando</span>{' '}
                  no PPGEB - UFU
                </p>
                <p>
                  <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>📅 Data:</span>{' '}
                  Nov/2024
                </p>
              </div>
              <p>
                <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>📚 Disciplina:</span>{' '}
                PPGEB42 - Simulação de Monte Carlo Aplicada à Medicina e Biologia
              </p>
              <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-1">
                <p>
                  <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>📱</span>{' '}
                  <a href="tel:+5534999005794" className="hover:underline">
                    (34) 99900-5794
                  </a>
                </p>
                <p>
                  <span className={isDark ? 'text-blue-400' : 'text-blue-600'}>📧</span>{' '}
                  <a href="mailto:franciscodnlneto@gmail.com" className="hover:underline">
                    franciscodnlneto@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  isDark: PropTypes.bool.isRequired,
};

export default Footer;
