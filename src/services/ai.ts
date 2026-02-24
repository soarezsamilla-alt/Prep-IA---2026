import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generatePracticeQuestions(subject: string, difficulty: string, count: number = 5, language: string = 'pt') {
  const prompts: Record<string, string> = {
    pt: `Crie um simulado de ${count} questões de múltipla escolha sobre ${subject} para concurso público, nível ${difficulty}.`,
    en: `Create a quiz with ${count} multiple choice questions about ${subject} for civil service exams, difficulty level ${difficulty}.`,
    es: `Crea un simulacro de ${count} preguntas de opción múltiple sobre ${subject} para oposiciones, nivel ${difficulty}.`
  };

  const prompt = prompts[language] || prompts.pt;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["questions"]
        },
        temperature: 0.7, // Slightly creative but focused
        topK: 40,
        topP: 0.95,
      }
    });
    
    // With responseSchema, the output is guaranteed to be valid JSON matching the schema
    const text = response.text || "{}";
    const data = JSON.parse(text);
    return data.questions || [];
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
}

export async function analyzeImageQuestion(base64Image: string, language: string = 'pt') {
  try {
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");
    
    const prompts: Record<string, string> = {
      pt: "Analise esta imagem de uma questão de concurso. Identifique a pergunta, as alternativas (se houver), e forneça a resposta correta com uma explicação detalhada passo a passo. Se for uma questão discursiva, forneça a resposta ideal. Foque em ser didático e preciso juridicamente.",
      en: "Analyze this image of an exam question. Identify the question, options (if any), and provide the correct answer with a detailed step-by-step explanation. If it's an essay question, provide the ideal answer. Focus on being didactic and legally accurate.",
      es: "Analiza esta imagen de una pregunta de examen. Identifica la pregunta, las opciones (si las hay), y proporciona la respuesta correcta con una explicación detallada paso a paso. Si es una pregunta de desarrollo, proporciona la respuesta ideal. Enfócate en ser didáctico y preciso jurídicamente."
    };

    const prompt = prompts[language] || prompts.pt;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: prompt }
        ]
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing image:", error);
    const errorMessages: Record<string, string> = {
      pt: "Desculpe, não consegui analisar a imagem. Tente novamente com uma foto mais clara.",
      en: "Sorry, I couldn't analyze the image. Please try again with a clearer photo.",
      es: "Lo siento, no pude analizar la imagen. Inténtalo de nuevo con una foto más clara."
    };
    return errorMessages[language] || errorMessages.pt;
  }
}

export async function chatWithAI(message: string, history: { role: string, content: string }[], language: string = 'pt') {
  try {
    const systemInstructions: Record<string, string> = {
      pt: "Você é o Prep IA, um assistente especializado em concursos públicos no Brasil (Civil, Penal, Militar, PRF, etc.). Você é didático, motivador e preciso. Suas respostas devem ser focadas em ajudar o aluno a passar no concurso. Use formatação markdown para melhor leitura.",
      en: "You are Prep AI, an assistant specialized in civil service exams in Brazil (Civil, Criminal, Military, etc.). You are didactic, motivating, and precise. Your answers should be focused on helping the student pass the exam. Use markdown formatting for better readability. Answer in English.",
      es: "Eres Prep IA, un asistente especializado en oposiciones en Brasil (Civil, Penal, Militar, etc.). Eres didáctico, motivador y preciso. Tus respuestas deben estar enfocadas en ayudar al estudiante a aprobar el examen. Usa formato markdown para una mejor lectura. Responde en Español."
    };

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: systemInstructions[language] || systemInstructions.pt,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Chat error:", error);
    const errorMessages: Record<string, string> = {
      pt: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.",
      en: "Sorry, I had a problem processing your message. Please try again.",
      es: "Lo siento, tuve un problema al procesar tu mensaje. Inténtalo de nuevo."
    };
    return errorMessages[language] || errorMessages.pt;
  }
}
