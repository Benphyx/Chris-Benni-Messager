import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getSmartReplies(conversationHistory: Message[]): Promise<string[]> {
  try {
    const lastMessage = conversationHistory[conversationHistory.length - 1]?.text || '';
    const prompt = `Basierend auf der letzten Nachricht "${lastMessage}", generiere 3 kurze, prägnante Antwortvorschläge auf Deutsch. Gib nur ein JSON-Array von Strings zurück, sonst nichts. Beispiel: ["Ja, gerne!", "Vielleicht später.", "Ich bin mir nicht sicher."]\n`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-flash-lite-latest',
        contents: prompt
    });

    const jsonString = response.text.trim().replace(/```json|```/g, '');
    const replies = JSON.parse(jsonString);
    return Array.isArray(replies) ? replies.slice(0, 3) : [];
  } catch (error) {
    console.error("Error getting smart replies:", error);
    return [];
  }
}

export async function rewriteMessage(message: string, tone: 'formeller' | 'legerer'): Promise<string> {
    try {
        const prompt = `Schreibe die folgende Nachricht ${tone} um. Gib nur den umgeschriebenen Text zurück, ohne zusätzliche Erklärung oder Anführungszeichen:\n\n"${message}"`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error rewriting message:", error);
        return "Fehler beim Umschreiben der Nachricht.";
    }
}

export async function summarizeConversation(messages: Message[]): Promise<string> {
    try {
        const conversationText = messages.map(m => `Sprecher ${m.senderId}: ${m.text}`).join('\n');
        const prompt = `Fasse die folgende Konversation auf Deutsch in einem kurzen Absatz zusammen:\n\n${conversationText}`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing conversation:", error);
        return "Zusammenfassung konnte nicht erstellt werden.";
    }
}
