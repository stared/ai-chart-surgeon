import Anthropic from "@anthropic-ai/sdk";
import type { ChartFeedback } from "../types"; // Corrected import path
import JSON5 from "json5";

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

/**
 * Parse and format the AI response
 */
function parseAIResponse(rawResponse: string): ChartFeedback {
  try {
    // Try standard JSON parse first
    const parsedResponse = JSON.parse(rawResponse);
    return formatParsedResponse(parsedResponse);
  } catch (error) {
    console.log("Standard JSON parsing failed, trying JSON5...");

    try {
      // Attempt to parse with JSON5 which is more forgiving
      const parsedResponse = JSON5.parse(rawResponse);
      return formatParsedResponse(parsedResponse);
    } catch (error) {
      console.error("JSON5 parsing failed too:", error);

      // If all parsing fails, try to construct a response from regex extraction
      console.log("Attempting direct field extraction...");

      const extracted = {
        strengths: extractArrayOrString(rawResponse, "strengths"),
        weaknesses: extractArrayOrString(rawResponse, "weaknesses"),
        suggestions: extractArrayOrString(rawResponse, "suggestions"),
        roast: extractRoast(rawResponse),
        plotCode: extractPlotCode(rawResponse),
      };

      if (
        extracted.strengths &&
        extracted.weaknesses &&
        extracted.suggestions &&
        extracted.roast &&
        extracted.plotCode
      ) {
        console.log("Successfully extracted data through regex");
        return extracted;
      }

      throw new Error("Could not parse AI response");
    }
  }
}

/**
 * Format parsed response with bullet points for arrays
 */
function formatParsedResponse(parsedResponse: any): ChartFeedback {
  return {
    strengths: formatField(parsedResponse.strengths),
    weaknesses: formatField(parsedResponse.weaknesses),
    suggestions: formatField(parsedResponse.suggestions),
    roast: parsedResponse.roast,
    plotCode: parsedResponse.plotCode,
  };
}

/**
 * Format a field value, converting arrays to bulleted lists
 */
function formatField(value: string | string[]): string {
  if (Array.isArray(value)) {
    return "• " + value.join("\n• ");
  }
  return value;
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
      roast: "// API key missing",
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

    const systemPrompt = `You are a data visualization expert. Your task is to analyze charts critically ("roast" them), provide constructive feedback, and generate code for an improved version using Observable Plot (JavaScript).

Respond ONLY with a valid JSON object containing the keys:
- "strengths": An array of string points about what works well in the chart.
- "weaknesses": An array of string points about what doesn't work well  
- "suggestions": An array of string points about how to improve the chart
- "roast": A brief Reddit-style roast of the chart (1-3 sentences) with a killer punchline. Be brutal, edgy, witty, and clever. Refer to the topic graph is about, which you use as the base of your roast metaphors (and the opening phrase). Roast of the chart focusing on its specific flaws, design choices, missed intentions, and implied problems with its creator. Write it in a way that will make good laughs.
- "plotCode": A string containing JavaScript code for Observable Plot. Inline extracted data.

IMPORTANT: For the "plotCode" value, use double-quoted strings and properly escape any internal quotes. Line breaks must be escaped with \\n. This is crucial for valid JSON format.

Example response format:
{
  "strengths": ["Point 1", "Point 2"],
  "weaknesses": ["Issue 1", "Issue 2"],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "plotCode": "Plot.plot({ ... })"
}

The plotCode should assume data is implicitly available and focus on the plotting code itself.`;

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

    try {
      // Use our robust parsing function
      return parseAIResponse(rawJson);
    } catch (error) {
      console.error("All parsing methods failed:", error);
      return {
        strengths: "Error: Could not process AI response.",
        weaknesses:
          "Failed to parse the response from the AI. Please try again.",
        suggestions:
          "The AI provided an invalid format. Check the console logs for details.",
        roast:
          "// Error parsing AI response: " +
          (error instanceof Error ? error.message : String(error)),
        plotCode:
          "// Error parsing AI response: " +
          (error instanceof Error ? error.message : String(error)),
      };
    }
  } catch (error) {
    console.error("Error in analyzeChart function:", error);
    // Ensure a ChartFeedback object is returned even in case of errors before API call (e.g., file type error)
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      strengths: "Error: Analysis failed.",
      weaknesses: `An error occurred: ${errorMessage}`,
      suggestions: "Please check the file or console logs and try again.",
      roast: "// Analysis error: " + errorMessage,
      plotCode: "// Analysis error: " + errorMessage,
    };
  }
}

// Helper function to extract array or string from JSON using regex
function extractArrayOrString(json: string, key: string): string {
  // Try to match an array of strings
  const arrayMatch = new RegExp(`"${key}"\\s*:\\s*\\[(.*?)\\]`, "s").exec(json);
  if (arrayMatch && arrayMatch[1]) {
    // Extract individual strings from the array
    const stringMatches = arrayMatch[1].match(/"([^"]*?)"/g);
    if (stringMatches) {
      // Remove quotes and join with bullet points
      return "• " + stringMatches.map((s) => s.replace(/"/g, "")).join("\n• ");
    }
  }

  // Try to match a simple string
  const stringMatch = new RegExp(`"${key}"\\s*:\\s*"(.*?)"`, "s").exec(json);
  if (stringMatch && stringMatch[1]) {
    return stringMatch[1];
  }

  return "";
}

// Helper function to extract roast from JSON using regex
function extractRoast(json: string): string {
  // First try to match code inside backticks
  const backtickMatch = new RegExp(
    `"roast"\\s*:\\s*\`([\\s\\S]*?)\``,
    "s"
  ).exec(json);
  if (backtickMatch && backtickMatch[1]) {
    return backtickMatch[1];
  }

  // Try to match multiline code inside quotes
  const multilineMatch = new RegExp(
    `"roast"\\s*:\\s*"([\\s\\S]*?)"(?=,|\\s*\\})`,
    "s"
  ).exec(json);
  if (multilineMatch && multilineMatch[1]) {
    return multilineMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  // Try to match single line code
  const singleLineMatch = new RegExp(`"roast"\\s*:\\s*"(.*?)"`, "s").exec(json);
  if (singleLineMatch && singleLineMatch[1]) {
    return singleLineMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  return "";
}

// Helper function to extract plot code from JSON using regex
function extractPlotCode(json: string): string {
  // First try to match code inside backticks
  const backtickMatch = new RegExp(
    `"plotCode"\\s*:\\s*\`([\\s\\S]*?)\``,
    "s"
  ).exec(json);
  if (backtickMatch && backtickMatch[1]) {
    return backtickMatch[1];
  }

  // Try to match multiline code inside quotes
  const multilineMatch = new RegExp(
    `"plotCode"\\s*:\\s*"([\\s\\S]*?)"(?=,|\\s*\\})`,
    "s"
  ).exec(json);
  if (multilineMatch && multilineMatch[1]) {
    return multilineMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  // Try to match single line code
  const singleLineMatch = new RegExp(`"plotCode"\\s*:\\s*"(.*?)"`, "s").exec(
    json
  );
  if (singleLineMatch && singleLineMatch[1]) {
    return singleLineMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  return "";
}
