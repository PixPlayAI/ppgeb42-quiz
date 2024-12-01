import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateScenarioContent } from '../../services/openai';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Configuração inicial sempre com "Carregando..."
let SCENARIO_CONFIG = {
  id: 'scenario12',
  title: 'Cenário 12: Espectros de Energia de Radioisótopos',
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
    id: 'scenario12',
    title: 'Cenário 12: Espectros de Energia de Radioisótopos',
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

// Atualização do cenárioPrompt baseado no scenarioNumber
const getScenarioPrompt = (scenarioNumber) => {
  const scenarioDescription =
    scenarioNumber === 1
      ? `
Neste cenário, é apresentado um gráfico de espectro de energia de um radioisótopo utilizado em **radioterapia**. O gráfico mostra picos de energia mais elevados, sem revelar o nome do composto. As energias características deste radioisótopo estão na faixa de **200 keV a 500 keV**.
`
      : `
Neste cenário, é apresentado um gráfico de espectro de energia de um radioisótopo utilizado em **diagnóstico por imagem**. O gráfico mostra picos de energia mais baixos, sem revelar o nome do composto. As energias características deste radioisótopo estão na faixa de **100 keV a 200 keV**.
`;

  return `Gere uma questão de múltipla escolha sobre o seguinte cenário:
${scenarioDescription}

A questão deve avaliar se o aluno compreende a relação entre as energias dos cenários e suas aplicações clínicas em diagnóstico e terapia, identificando qual cenário é mais adequado para determinado uso com base em seu espectro de energia.

IMPORTANTE: Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

Requisitos:
- A questão deve ter 4 alternativas.
- Apenas uma alternativa deve estar correta.
- As alternativas incorretas devem ser plausíveis mas claramente distinguíveis, e necessariamente uma alternativa deve ser absurda e totalmente nada a ver, irônica ou engraçada.
- As alternativas devem mencionar "Cenário 1" e "Cenário 2" conforme apropriado.
- Foque em aplicações práticas e na escolha adequada de diferentes cenários com base no espectro de energia.
- Inclua uma mensagem de parabéns que reforce o conceito específico que o aluno demonstrou dominar.
- Inclua uma explicação detalhada da resposta correta e por que as outras alternativas estão erradas.
- Os textos devem ser curtos pois o candidato terá aproximadamente 20 segundos para ver o cenário, ler tudo e marcar a resposta correta.

Retorne a resposta EXATAMENTE neste formato JSON:
{
  "id": "scenario12",
  "title": "Cenário 12: Espectros de Energia de Radioisótopos",
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
  "successMessage": "[Mensagem de parabéns explicando porque a resposta está correta e reforçando o conceito que o aluno dominou], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas",
  "detailedExplanation": "[Explicação detalhada da resposta correta e análise de por que cada uma das outras alternativas está incorreta], não cite alternativa a, b, c, d ou 1, 2, 3, 4 pois elas são embaralhadas"
}`;
};

const Scenario12 = ({ isDark, scenarioNumber = 1 }) => {
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
        const generatedContent = await generateScenarioContent(getScenarioPrompt(scenarioNumber));

        // Verifica se o conteúdo foi gerado corretamente
        if (
          !generatedContent ||
          !generatedContent.successMessage ||
          !generatedContent.detailedExplanation
        ) {
          generatedContent.successMessage =
            'Parabéns! Você compreendeu como as energias dos cenários influenciam suas aplicações clínicas.';
          generatedContent.detailedExplanation =
            'A resposta correta relaciona o espectro de energia dos cenários com suas aplicações práticas em diagnóstico ou terapia. Cenários com energias mais altas são adequados para terapia, enquanto aqueles com energias mais baixas são ideais para diagnóstico. As outras alternativas não consideram corretamente essa relação.';
        }

        // Atualiza a configuração
        SCENARIO_CONFIG = {
          ...generatedContent,
          id: 'scenario12',
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
            'Parabéns! Você compreendeu como as energias dos cenários influenciam suas aplicações clínicas.',
          detailedExplanation:
            'A resposta correta relaciona o espectro de energia dos cenários com suas aplicações práticas em diagnóstico ou terapia. Cenários com energias mais altas são adequados para terapia, enquanto aqueles com energias mais baixas são ideais para diagnóstico. As outras alternativas não consideram corretamente essa relação.',
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
  }, [updateConfig, scenarioNumber]);

  // Dados específicos para cada cenário
  const getScenarioData = () => {
    if (scenarioNumber === 1) {
      // Cenário 1 - Terapia (energias mais altas)
      return {
        energyData: Array.from({ length: 800 }, (_, i) => ({
          energia: i,
          atividade:
            (i === 316 ? 1000 : i === 468 ? 900 : 100 * Math.exp(-(Math.pow(i - 375, 2) / 400))) +
            Math.random() * 20,
        })),
      };
    } else {
      // Cenário 2 - Diagnóstico (energias mais baixas)
      return {
        energyData: Array.from({ length: 800 }, (_, i) => ({
          energia: i,
          atividade:
            i === 140
              ? 1000
              : i === 159
                ? 900
                : 100 * Math.exp(-(Math.pow(i - 150, 2) / 200)) + Math.random() * 20,
        })),
      };
    }
  };

  const { energyData } = getScenarioData();
  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const gridColor = isDark ? '#374151' : '#e5e7eb';

  return (
    <div className="space-y-4">
      <div className="h-72 border rounded-lg shadow-md p-6">
        <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>
          Espectro de Energia - Cenário {scenarioNumber}
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={energyData} margin={{ top: 20, right: 35, bottom: 40, left: 35 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="energia"
              label={{
                value: 'Energia (keV)',
                position: 'insideBottom',
                offset: -25,
                fill: isDark ? '#e5e7eb' : '#1f2937',
                fontSize: 12,
              }}
              stroke={isDark ? '#e5e7eb' : '#1f2937'}
              tick={{ fontSize: 11 }}
              domain={[scenarioNumber === 1 ? 200 : 100, scenarioNumber === 1 ? 500 : 200]}
            />
            <YAxis
              label={{
                value: 'Contagens Relativas',
                angle: -90,
                position: 'insideLeft',
                offset: 15,
                fill: isDark ? '#e5e7eb' : '#1f2937',
                fontSize: 12,
              }}
              stroke={isDark ? '#e5e7eb' : '#1f2937'}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                fontSize: '12px',
                padding: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="atividade"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

Scenario12.propTypes = {
  isDark: PropTypes.bool.isRequired,
  scenarioNumber: PropTypes.number,
};
// Função para obter a configuração do cenário
export const getScenarioConfig = () => SCENARIO_CONFIG;

// Exporta a configuração como constante
export { SCENARIO_CONFIG };

// Exporta o componente memoizado
export default React.memo(Scenario12);
