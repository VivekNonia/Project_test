import { GoogleGenAI, Type } from "@google/genai";
import { Message, GeminiResponse, Intent, GrievanceCategory } from '../types';

// Fix: Use process.env.API_KEY as required by the coding guidelines.
// This is enabled by a configuration change in vite.config.ts.
const API_KEY = process.env.API_KEY; 
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a mock service.");
}
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Fix: Replaced multiple schemas and unsupported `oneOf` with a single, unified schema.
// This simplifies the schema definition and makes it compliant with the Gemini API.
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        intent: {
            type: Type.STRING,
            enum: Object.values(Intent),
            description: "Classify the user's intent."
        },
        grievance: {
            type: Type.OBJECT,
            description: "Include this object ONLY if the intent is GRIEVANCE_FILING.",
            properties: {
                category: { type: Type.STRING, enum: Object.values(GrievanceCategory), description: "The category of the grievance." },
                location: { type: Type.STRING, description: 'The city, village, or specific address mentioned by the user.' },
                summary: { type: Type.STRING, description: 'A concise summary of the user\'s complaint.' },
            },
            required: ['category', 'location', 'summary']
        },
        ticketId: {
            type: Type.STRING,
            description: 'The grievance ID (e.g., "JSS-1234"). Include this ONLY if the intent is STATUS_CHECK.'
        },
        response: {
            type: Type.STRING,
            description: 'A polite, conversational response for the user. If filing a grievance, include the placeholder "{{TICKET_ID}}" for the ticket number.'
        }
    },
    required: ['intent', 'response']
};

const MOCK_RESPONSE: GeminiResponse = {
    intent: Intent.GRIEVANCE_FILING,
    grievance: {
        category: GrievanceCategory.PIPELINE_LEAKAGE,
        location: 'Kharadi, Pune',
        summary: 'Water pipe leaking on the main road for 2 days.'
    },
    response: 'Thank you for reporting the pipeline leakage in Kharadi, Pune. Your grievance has been registered with ID {{TICKET_ID}}. We will look into it shortly.'
};

export const processUserMessage = async (
  message: string,
  history: Message[]
): Promise<GeminiResponse> => {
    
    if (!ai) {
        console.log("Using mock Gemini response.");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (message.toLowerCase().includes('status')) {
            const match = message.match(/JSS-\d+/i);
            return {
                intent: Intent.STATUS_CHECK,
                ticketId: match ? match[0] : 'JSS-5821',
                response: `Checking status for ${match ? match[0] : 'JSS-5821'}.`
            };
        }
        return MOCK_RESPONSE;
    }

    const systemInstruction = `You are "Jal Shakti Sahayak", an AI assistant for India's Ministry of Jal Shakti. Your role is to help citizens with water-related issues.
    1.  First, determine the user's intent: Are they filing a new grievance, checking the status of an old one, or asking a general question?
    2.  If filing a grievance, you MUST extract the category, location, and a summary. If the user doesn't provide enough information, ask clarifying questions. Categories are: ${Object.values(GrievanceCategory).join(', ')}.
    3.  If checking status, you MUST extract the ticket ID, which looks like "JSS-1234".
    4.  Always be polite, empathetic, and professional. Respond in simple language.
    5.  Strictly follow the provided JSON schema for your response.
    `;

    // A simplified history for the prompt
    const recentHistory = history.slice(-4).map(h => `${h.sender}: ${h.text}`).join('\n');
    const prompt = `Chat History:\n${recentHistory}\n\nNew user message: "${message}"\n\nAnalyze the new message and respond in the required JSON format.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                // Fix: Use the single, unified schema.
                responseSchema: responseSchema,
            }
        });

        // Fix: Simplified response parsing by removing the need to handle a nested object.
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        return parsedResponse as GeminiResponse;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to get a response from the AI model.");
    }
};