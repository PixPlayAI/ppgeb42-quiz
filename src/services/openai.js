import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const RUTHERFORD_CONTEXT = `
Nessa simulação é mostrado o cenário do experimento de Rutherford onde observa-se as partículas alfa, beta e gama,
desviando para os lados positivos e negativos do campo elétrico e batendo em um anteparo.
As partículas gama (que são as verdes na simulação) não desviam,
já as partículas beta (que são as azuis desviam pouco para o lado positivo)
já as partículas alfa (as laranjas) desviam muito para o lado negativo.

Características importantes que DEVEM aparecer em todas as alternativas:
1. As partículas beta são AZUIS, leves, negativas e desviam para o polo positivo
2. As partículas alfa são LARANJAS, pesadas, positivas e desviam para o polo negativo
3. As partículas gama são VERDES e não desviam por não terem carga
4. O experimento mostra um campo elétrico entre duas placas carregadas
5. As partículas são detectadas em um anteparo ao final do percurso

Regras para as alternativas:
- Alternativa correta: deve incluir todos os conceitos acima corretamente
- Plausível 1: deve inverter as cargas e os desvios, mantendo as cores
- Plausível 2: deve focar apenas na massa, ignorando as cargas
- Absurda: deve usar conceitos físicos totalmente errados (ex: colisões, ondas, etc)`;

export async function generateScenarioQuestions(scenarioNumber) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Você é um professor de física especializado em criar questões sobre radiação e física nuclear.

Regras OBRIGATÓRIAS para gerar as questões:

1. SEMPRE gerar uma alternativa CORRETA que:
   - Mencione a cor AZUL para partículas beta
   - Mencione a cor LARANJA para partículas alfa
   - Mencione a cor VERDE para partículas gama
   - Descreva precisamente o desvio de cada partícula
   - Explique a relação entre carga e desvio
   - Explique a relação entre massa e intensidade do desvio

2. SEMPRE gerar duas alternativas PLAUSÍVEIS mas ERRADAS:
   Primeira alternativa plausível:
   - Mantenha as cores corretas
   - Inverta as cargas das partículas
   - Inverta a direção dos desvios

   Segunda alternativa plausível:
   - Mantenha as cores corretas
   - Foque apenas no efeito da massa
   - Ignore o efeito das cargas
   - Mantenha alguma lógica física, mesmo que errada

3. SEMPRE gerar uma alternativa ABSURDA que:
   - Use conceitos completamente errados
   - Misture fenômenos não relacionados
   - Demonstre falta total de compreensão da física
   - Mantenha as cores corretas das partículas`,
        },
        {
          role: 'user',
          content: `Baseado neste contexto do experimento:
${RUTHERFORD_CONTEXT}

Gere uma questão seguindo EXATAMENTE este formato JSON, mantendo os IDs e estrutura:
{
  "id": "scenario${scenarioNumber}",
  "title": "Cenário II: Experimento de Rutherford",
  "question": "Analise as radiações nos cenários e escolha a alternativa correta:",
  "options": [
    {
      "id": "correct",
      "text": "[Resposta 100% correta descrevendo precisamente o comportamento]",
      "isCorrect": true
    },
    {
      "id": "plausible1",
      "text": "[Primeira resposta plausível mas claramente errada]",
      "isCorrect": false
    },
    {
      "id": "plausible2",
      "text": "[Segunda resposta plausível mas claramente errada]",
      "isCorrect": false
    },
    {
      "id": "absurd",
      "text": "[Resposta absurda mostrando falta de conhecimento básico]",
      "isCorrect": false
    }
  ]
}`,
        },
      ],
      temperature: 0.7,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error generating scenario questions:', error);
    throw error;
  }
}
