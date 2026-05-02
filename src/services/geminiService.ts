import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are "Healthu", a dedicated digital health assistant for MedVault. 
Your goal is to help users understand their health, provide wellness tips, and explain medical terms.
Guidelines:
1. Be professional, empathetic, and clear.
2. Always include a disclaimer: "I am an AI assistant, not a doctor. For emergencies, contact your local emergency services or a qualified physician."
3. Keep responses concise and scannable (use bullets where appropriate).
4. Do not diagnose specific conditions or prescribe medications.
5. If a user asks about their MedVault records, explain that you can provide general guidance on health data management.`;

export async function getHealthChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: h.parts })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm sorry, I'm having trouble connecting right now. Please try again later.";
  }
}
