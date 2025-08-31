import { GoogleGenAI } from "@google/genai";

// FIX: Refactor API key handling to align with coding guidelines.
// Assume API_KEY is available in the environment and use it directly, removing redundant checks.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateContent = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.8,
                topP: 0.9,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error generating content:", error);
        return "Error: Could not generate response. Please check your connection... or your humanity.";
    }
};

export const generateTaunt = async (level: number, attempts: number): Promise<string> => {
    const prompt = `You are a sarcastic and condescending CAPTCHA system. The user has failed challenge number ${level} ${attempts} times. Generate a short, frustrating message (under 15 words) that questions their humanity and accuses them of being a robot.`;
    return generateContent(prompt);
};

export const generateVagueInstruction = async (): Promise<string> => {
    const prompt = `Generate a short, single-sentence, confusing, and nonsensical CAPTCHA instruction. It should sound plausible but be impossible to solve logically. Examples: "Select all images that contain the concept of Tuesday." or "Click the squares that feel warm."`;
    return generateContent(prompt);
};

export const generateMathTaunt = async (wrongAnswer: string): Promise<string> => {
    const prompt = `You are a condescending CAPTCHA system. The user provided a wrong answer "${wrongAnswer}" for a simple math problem. Generate a short, mocking message (under 12 words) that questions their intelligence. Be sarcastic. Examples: "Seriously? That's your answer?", "My calculator is laughing at you.", "Even a robot could solve this."`;
    return generateContent(prompt);
}

export const generateAdminCode = async (): Promise<string> => {
    const prompt = `Generate a unique, official-looking service ticket that is also an "admin r-ID/L-code". The code should be a single-line, alphanumeric string between 15 and 25 characters. It must contain the characters for "ADMIN", "RIDL", and "CODE", but broken up and mixed with numbers and other letters to look like a system-generated ID. Example format: ADM7-R1DL-C0DE-9XYZ. Be creative. Only return the code itself.`;
    const code = await generateContent(prompt);
    // Sanitize response to ensure it's a single, valid-looking code
    return code.trim().replace(/ /g, '-').replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
}