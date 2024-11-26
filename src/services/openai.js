// src/services/openai.js
import axios from 'axios';

export const generateScenarioContent = async (scenarioPrompt) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.error('🔴 API Key não encontrada no ambiente');
    throw new Error('OpenAI API Key não configurada');
  }

  try {
    console.log('🌐 Iniciando requisição para OpenAI');

    const requestData = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a physics teacher creating multiple choice questions. Generate questions and answers in JSON format matching the SCENARIO_CONFIG structure.',
        },
        {
          role: 'user',
          content: scenarioPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    };

    const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Resposta da OpenAI não contém o conteúdo esperado');
    }

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('🔴 Erro ao chamar OpenAI:', error.message);
    if (error.response?.status === 401) {
      console.error('🔑 Erro de autenticação - verifique sua API key');
    }
    throw error;
  }
};
