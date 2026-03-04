import { ThoughtItem, Category } from "../types";
import { callAI } from "./aiClient";

export interface OrganizationResult {
  items: Partial<ThoughtItem>[];
  clarificationQuestion?: string;
}

export async function organizeThoughts(input: string, context?: string): Promise<OrganizationResult> {
  try {
    const prompt = `Organize the following brain dump into structured items. 
    Input: "${input}"
    ${context ? `Additional Context from user's previous answer: "${context}"` : ""}
    
    Rules:
    1. Break long sentences into individual actionable items or worries.
    2. Categorize accurately.
    3. Determine if it's within the user's control.
    4. For actionable items, provide a clear, tiny next step.
    5. If the input is extremely vague (e.g., just "work" or "stuff"), ask for more detail using the clarificationQuestion field.

    Return a JSON object with this structure:
    {
      "items": [
        {
          "text": "The individual thought or task",
          "category": "urgent" | "long-term" | "worry" | "reminder" | "outside-control",
          "controllable": boolean,
          "actionPlan": {
            "nextStep": "The very next tiny step",
            "timeEstimate": "e.g. 5 mins",
            "difficulty": "easy" | "medium" | "hard"
          }
        }
      ],
      "clarificationQuestion": "Optional question if input is too vague"
    }`;

    const responseText = await callAI({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const data = JSON.parse(responseText || '{"items": []}');
    return {
      items: data.items || [],
      clarificationQuestion: data.clarificationQuestion || undefined
    };
  } catch (error) {
    console.error("AI Organization Error:", error);
    return {
      items: [{
        text: input,
        category: 'worry',
        controllable: true,
        actionPlan: { nextStep: "Break this down further", timeEstimate: "5 mins", difficulty: "easy" }
      }]
    };
  }
}

export function calculateOverwhelmScore(items: ThoughtItem[]): number {
  if (items.length === 0) return 0;
  
  let score = 0;
  items.forEach(item => {
    // Weighting factors
    if (item.category === 'urgent') score += 15;
    if (item.category === 'worry') score += 10;
    if (item.category === 'long-term') score += 5;
    if (!item.controllable) score += 8; // Things we can't control add mental load
  });

  return Math.min(100, Math.round(score));
}
