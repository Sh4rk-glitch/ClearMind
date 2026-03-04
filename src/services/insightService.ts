import { ThoughtItem, UserInsights, PersonalizationEntry } from "../types";
import { callAI } from "./aiClient";

export const generateNextPersonalizationQuestion = async (
  thoughts: ThoughtItem[],
  previousEntries: PersonalizationEntry[]
): Promise<string> => {
  const thoughtSummary = thoughts.map(t => `- [${t.category}] ${t.text}`).join('\n');
  const historySummary = previousEntries.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');

  try {
    const prompt = `You are MindAI, a mental clarity assistant. Your goal is to get to know the user better to provide more personalized support.
      
      Based on the user's recent thoughts and previous personalization answers, generate ONE thoughtful, open-ended question that will help you understand their mental models, values, or specific stress patterns better.
      
      User's Recent Thoughts:
      ${thoughtSummary || 'No thoughts yet.'}
      
      Previous Personalization History:
      ${historySummary || 'No history yet.'}
      
      Rules:
      1. Ask only ONE question.
      2. Keep it concise, warm, and empathetic.
      3. Make it specific to what you've learned about them so far.
      4. Avoid repeating previous questions.
      5. Focus on things that help you provide better advice (e.g., "What does a successful day look like to you?" or "When you're overwhelmed, what's the first thing you tend to drop?").`;

    const responseText = await callAI({
      messages: [{ role: "user", content: prompt }]
    });

    return responseText?.trim() || "What's one thing you'd like to improve about your daily routine?";
  } catch (error) {
    console.error("Question Generation Error:", error);
    return "What's one thing you'd like to focus on today?";
  }
};

export const generateUserInsights = async (
  thoughts: ThoughtItem[],
  personalizationEntries: PersonalizationEntry[] = []
): Promise<UserInsights | null> => {
  // Require at least some data to analyze
  if (thoughts.length === 0 && personalizationEntries.length === 0) return null;

  const thoughtSummary = thoughts.map(t => `- [${t.category}] ${t.text} (${t.isCompleted ? 'Completed' : 'Pending'})`).join('\n');
  const personalizationSummary = personalizationEntries.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');

  try {
    const prompt = `Analyze the following data from a user's mental clarity app. 
      Provide a concise, empathetic summary of what "MindAI" thinks of the user's current mental state, habits, and focus areas.
      
      User Thoughts:
      ${thoughtSummary || 'No thoughts recorded yet.'}
      
      MindAI Personalization History:
      ${personalizationSummary || 'No personalization history yet.'}
      
      Return a JSON object with the following structure:
      {
        "summary": "A 2-3 sentence empathetic summary of the user's current state.",
        "dominantCategory": "The most frequent category of thoughts (or 'Personal Growth' if based mainly on personalization).",
        "overwhelmTrend": "improving" | "stable" | "increasing"
      }`;

    const responseText = await callAI({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(responseText || '{}');
    return {
      ...data,
      lastUpdated: Date.now()
    };
  } catch (error) {
    console.error("Insight Generation Error:", error);
    return null;
  }
};
