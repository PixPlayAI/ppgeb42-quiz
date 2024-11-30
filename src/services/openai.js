// src/services/openai.js
import axios from 'axios';

export const generateScenarioContent = async (scenarioPrompt) => {
  //Temporariamente aqui a chave, mas o correto é deixar sem o prefixo vite
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
          content: `You are a physics teacher creating multiple choice questions about Rutherford's experiment.
                    For each question, you must provide:
                    1. A clear explanation of why the correct answer is right (successMessage)
                    2. A detailed analysis of why each incorrect option is wrong (detailedExplanation)
                    3. Focus on helping students understand particle behavior in electric fields
                    In Portuguese pt-br`,
        },
        {
          role: 'user',
          content: scenarioPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
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
