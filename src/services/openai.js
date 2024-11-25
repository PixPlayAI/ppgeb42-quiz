// src/services/openai.js
import axios from 'axios';

export const generateScenarioContent = async (scenarioPrompt) => {
  console.log('🔑 Verificando API Key:', import.meta.env.OPENAI_API_KEY?.slice(0, 10) + '...');

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

    console.log('📋 Dados da requisição:', requestData);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.OPENAI_API_KEY}`,
      },
    });

    console.log('✅ Resposta bruta da OpenAI:', response.data);

    if (!response.data.choices?.[0]?.message?.content) {
      throw new Error('Resposta da OpenAI não contém o conteúdo esperado');
    }

    const content = response.data.choices[0].message.content;
    console.log('📝 Conteúdo recebido:', content);

    const parsedContent = JSON.parse(content);
    console.log('🎯 JSON parseado com sucesso:', parsedContent);

    return parsedContent;
  } catch (error) {
    console.error('🔴 Erro detalhado:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    // Agora vamos logar o erro antes de retornar o fallback
    console.log('⚠️ Retornando configuração de fallback');

    return {
      id: 'scenario5',
      title: 'Cenário II: Experimento de Rutherford',
      question: 'Analise o experimento e identifique o comportamento das partículas:',
      options: [
        {
          id: 'option1',
          text: 'As partículas alfa têm carga positiva e são atraídas para o polo negativo devido à força elétrica',
          isCorrect: true,
        },
        {
          id: 'option2',
          text: 'As partículas beta têm carga positiva e são atraídas para o polo positivo',
          isCorrect: false,
        },
        {
          id: 'option3',
          text: 'As partículas gama têm carga neutra mas são levemente defletidas',
          isCorrect: false,
        },
        {
          id: 'option4',
          text: 'Todas as partículas sofrem a mesma intensidade de deflexão no campo elétrico',
          isCorrect: false,
        },
      ],
    };
  }
};
