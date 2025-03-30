import Anthropic from "@anthropic-ai/sdk";
import type { ChartFeedback } from "../types"; // Corrected import path

/**
 * A placeholder service for Anthropic API integration.
 * In a production app, this would actually call the Anthropic API.
 */

// Define the specific media types supported by Anthropic API for images
type SupportedMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

// Define the specific structure returned by our helper, conforming to Anthropic.Base64ImageSource
type Base64ImageInput = {
  type: "base64";
  media_type: SupportedMediaType;
  data: string;
};

// Helper function to convert File object to Base64 and get media type
async function fileToGenerativePart(file: File): Promise<Base64ImageInput> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(",")[1]); // Remove the data:image/...;base64, prefix
    reader.onerror = (error) => reject(error);
  });

  // Validate that the file type is one supported by the API
  const supportedTypes: SupportedMediaType[] = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  if (!supportedTypes.includes(file.type as SupportedMediaType)) {
    const errorMsg = `Unsupported file type: ${file.type}. Please use JPEG, PNG, GIF, or WebP.`;
    console.error(errorMsg);
    // Throw an error to prevent an invalid API call
    throw new Error(errorMsg);
  }

  return {
    type: "base64",
    media_type: file.type as SupportedMediaType,
    data: base64,
  };
}

export async function analyzeChart(file: File): Promise<ChartFeedback> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error(
      "Anthropic API key is missing. Please set VITE_ANTHROPIC_API_KEY in your .env file."
    );
    // In a real app, you might want to throw a more specific error or handle this state differently.
    // For now, we'll return a dummy error response to avoid crashing the app.
    return {
      strengths: "Error: API Key missing.",
      weaknesses:
        "Please configure the VITE_ANTHROPIC_API_KEY environment variable.",
      suggestions: "Refer to the project documentation.",
      plotCode: "// API key missing",
    };
    // throw new Error("Anthropic API key is missing. Set VITE_ANTHROPIC_API_KEY environment variable.");
  }

  // Add dangerouslyAllowBrowser flag to acknowledge the risk of exposing API key in browser
  const anthropic = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  try {
    const imagePart = await fileToGenerativePart(file);

    const systemPrompt = `You are a data visualization expert. Your task is to analyze charts critically ("roast" them), provide constructive feedback, and generate code for an improved version using Observable Plot (JavaScript). Respond ONLY with a valid JSON object containing the keys "strengths", "weaknesses", "suggestions", and "plotCode". Do not include any other text, explanations, or markdown formatting outside the JSON structure. The plotCode should be JavaScript code ready to be used with Observable Plot. Assume the data is implicitly available or part of the chart context; focus on the plotting code itself.`;

    const userMessage: Anthropic.Messages.MessageParam = {
      role: "user",
      content: [
        {
          type: "image",
          source: imagePart,
        },
        {
          type: "text",
          text: "Analyze this chart. Provide feedback (strengths, weaknesses, suggestions) and generate JavaScript code for an improved version using Observable Plot. Respond strictly in the JSON format specified in the system prompt.",
        },
      ],
    };

    console.log("Sending request to Anthropic API..."); // Logging start

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Updated to Claude 3.5 Sonnet
      max_tokens: 2048,
      system: systemPrompt,
      messages: [userMessage],
    });

    console.log("Received response from Anthropic API."); // Logging success

    // Ensure response content is valid and text-based
    if (
      !response.content ||
      response.content.length === 0 ||
      response.content[0].type !== "text"
    ) {
      throw new Error("Invalid response format from Anthropic API.");
    }

    const rawJson = response.content[0].text;
    console.log("Raw API Response Text:", rawJson); // Log the raw response text

    // Attempt to parse the JSON response
    try {
      const parsedResponse = JSON.parse(rawJson);

      // Basic validation of the parsed structure
      if (
        typeof parsedResponse.strengths !== "string" ||
        typeof parsedResponse.weaknesses !== "string" ||
        typeof parsedResponse.suggestions !== "string" ||
        typeof parsedResponse.plotCode !== "string"
      ) {
        throw new Error(
          "Parsed JSON response does not match the expected structure."
        );
      }

      // Assuming ChartFeedback type matches the JSON structure { strengths, weaknesses, suggestions, plotCode }
      // If not, this cast needs adjustment or the type needs updating.
      return parsedResponse as ChartFeedback;
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.error("Raw response that failed parsing:", rawJson);
      // Provide a structured error feedback if parsing fails
      return {
        strengths: "Error: Could not process AI response.",
        weaknesses: `Failed to parse the response from the AI. Raw response: ${rawJson.substring(
          0,
          200
        )}...`, // Show partial raw response for debugging
        suggestions:
          "The AI might have provided an invalid JSON format. Check the console logs for details.",
        plotCode: `// Error parsing AI response: ${
          parseError instanceof Error ? parseError.message : String(parseError)
        }`,
      };
      // throw new Error(`Failed to parse JSON response from Anthropic API: ${parseError}`);
    }
  } catch (error) {
    console.error("Error in analyzeChart function:", error);
    // Ensure a ChartFeedback object is returned even in case of errors before API call (e.g., file type error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      strengths: "Error: Analysis failed.",
      weaknesses: `An error occurred: ${errorMessage}`,
      suggestions: "Please check the file or console logs and try again.",
      plotCode: `// Analysis error: ${errorMessage}`,
    };
  }
}
