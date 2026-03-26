import { ThoughtItem, UserInsights, PersonalizationEntry, MoodEntry } from "../types";
import { callAI } from "./aiClient";

export const generateNextPersonalizationQuestion = async (
  thoughts: ThoughtItem[],
  previousEntries: PersonalizationEntry[]
): Promise<string> => {
  const thoughtSummary = thoughts.map(t => `- [${t.category}] ${t.text}`).join('\n');
  const historySummary = previousEntries.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');

  try {
    const prompt = `You are a professional mental clarity and productivity coach. 
      Your goal is to help the user understand their mental state through thoughtful inquiry.
      
      Based on the user's recent thoughts and previous answers, generate ONE precise, open-ended question that helps them reflect on their mental models, values, or stress patterns.
      
      User's Recent Thoughts:
      ${thoughtSummary || 'No thoughts yet.'}
      
      Previous Personalization History:
      ${historySummary || 'No history yet.'}
      
      Guidelines:
      1. Ask only ONE question.
      2. Be professional, grounded, and empathetic. Avoid "weird" or overly abstract language.
      3. Focus on practical insights (e.g., "What is the most common distraction you face when working on long-term goals?").
      4. Avoid repetition.
      5. The question should encourage a concrete, helpful reflection.`;

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
  personalizationEntries: PersonalizationEntry[] = [],
  moodHistory: MoodEntry[] = []
): Promise<UserInsights | null> => {
  // Require at least some data to analyze
  if (thoughts.length === 0 && personalizationEntries.length === 0 && moodHistory.length === 0) return null;

  const thoughtSummary = thoughts.map(t => `- [${t.category}] ${t.text} (${t.isCompleted ? 'Completed' : 'Pending'})`).join('\n');
  const personalizationSummary = personalizationEntries.map(e => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');
  const moodSummary = moodHistory.map(m => `- [${m.mood}] ${m.note || 'No note'} (${new Date(m.timestamp).toLocaleString()})`).join('\n');

  try {
    const prompt = `You are a professional mental clarity analyst. 
      Analyze the following data from a user's mental clarity app. 
      Provide a precise, professional, and empathetic summary of their current mental state, habits, and focus areas.
      
      User Thoughts:
      ${thoughtSummary || 'No thoughts recorded yet.'}
      
      MindAI Personalization History:
      ${personalizationSummary || 'No personalization history yet.'}

      Mood History:
      ${moodSummary || 'No mood entries recorded yet.'}
      
      Guidelines:
      1. Be objective and grounded. Do not use "weird" or overly poetic language.
      2. Provide a 3-4 sentence summary that is genuinely helpful and insightful, connecting their thoughts, moods, and habits.
      3. Accurately identify the dominant category and overwhelm trend.
      
      Return a JSON object with the following structure:
      {
        "summary": "A 3-4 sentence professional summary of the user's current state.",
        "dominantCategory": "The most frequent category of thoughts.",
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
