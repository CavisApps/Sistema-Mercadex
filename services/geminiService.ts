import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Erro: Chave de API não configurada.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Escreva uma descrição curta, atraente e comercial (máximo 20 palavras) para um produto de mini-mercado. 
      Produto: ${productName}. 
      Categoria: ${category}.`,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível gerar a descrição.";
  }
};

export const analyzeSalesTrends = async (salesData: string): Promise<string> => {
  const client = getClient();
  if (!client) return "Erro: Chave de API não configurada.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analise estes dados de vendas resumidos e me dê uma dica curta (máximo 1 parágrafo) para aumentar o lucro: ${salesData}`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Análise indisponível no momento.";
  }
};
