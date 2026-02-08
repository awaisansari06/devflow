// Type definitions for code explanation

export interface LineExplanation {
    line: number;
    explanation: string;
}

export interface Concept {
    name: string;
    explanation: string;
}

export interface BestPractice {
    title: string;
    description: string;
    severity?: "info" | "warning" | "suggestion";
}

export interface CodeExplanation {
    overview: string;
    lineByLine: LineExplanation[];
    concepts: Concept[];
    bestPractices: BestPractice[];
}

/**
 * Generate AI prompt for code explanation
 */
export function generateExplainCodePrompt(
    code: string,
    language: string
): string {
    return `Analyze this ${language} code and provide a comprehensive explanation.

Code:
\`\`\`${language}
${code}
\`\`\`

Provide your response in the following JSON format:
{
  "overview": "Brief 2-3 sentence summary of what the code does",
  "lineByLine": [
    {
      "line": 1,
      "explanation": "Explanation of what this line does"
    }
  ],
  "concepts": [
    {
      "name": "Concept name (e.g., 'React Hooks', 'Async/Await')",
      "explanation": "Brief explanation of the concept and how it's used here"
    }
  ],
  "bestPractices": [
    {
      "title": "Best practice title",
      "description": "Explanation of the best practice or improvement suggestion",
      "severity": "info" | "warning" | "suggestion"
    }
  ]
}

Guidelines:
- Only explain significant lines (skip simple variable declarations)
- Focus on key concepts used in the code
- Provide actionable best practices
- Keep explanations concise but clear
- Use beginner-friendly language`;
}

/**
 * Parse AI response into CodeExplanation
 */
export function parseExplanationResponse(response: any): CodeExplanation {
    try {
        console.log("Parsing response:", response);

        // Handle array response from inngest agent
        if (Array.isArray(response) && response.length > 0) {
            const firstItem = response[0];

            // Check if it has a content field
            if (firstItem.content) {
                const content = firstItem.content;

                // Extract JSON from markdown code blocks
                const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const jsonString = jsonMatch[1] || jsonMatch[0];
                    const parsed = JSON.parse(jsonString);

                    return {
                        overview: parsed.overview || "No overview available",
                        lineByLine: parsed.lineByLine || [],
                        concepts: parsed.concepts || [],
                        bestPractices: parsed.bestPractices || [],
                    };
                }
            }
        }

        // If response is already an object with the right structure, use it directly
        if (typeof response === 'object' && response !== null && 'overview' in response) {
            return {
                overview: response.overview || "No overview available",
                lineByLine: response.lineByLine || [],
                concepts: response.concepts || [],
                bestPractices: response.bestPractices || [],
            };
        }

        // If response is a string, try to parse it as JSON
        if (typeof response === 'string') {
            // Try to extract JSON from markdown code blocks if present
            const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const jsonString = jsonMatch[1] || jsonMatch[0];
                const parsed = JSON.parse(jsonString);

                return {
                    overview: parsed.overview || "No overview available",
                    lineByLine: parsed.lineByLine || [],
                    concepts: parsed.concepts || [],
                    bestPractices: parsed.bestPractices || [],
                };
            }
        }

        console.error("Could not parse response format");
        throw new Error("Unsupported response format");
    } catch (error) {
        console.error("Failed to parse explanation response:", error);
        console.error("Response was:", response);

        // Return fallback structure
        return {
            overview: "Failed to parse explanation. Please try again.",
            lineByLine: [],
            concepts: [],
            bestPractices: [],
        };
    }
}
