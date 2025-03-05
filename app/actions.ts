"use server";
import { getSession, saveSession } from "@/lib/db";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import * as mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { v4 as uuidv4 } from "uuid";

export async function uploadResume(formData: FormData) {
  try {
    const file = formData.get("resume") as File;

    if (!file) {
      throw new Error("No file provided");
    }

    // Generate a unique session ID
    const sessionId = uuidv4();

    // In a production app, you would store the fil
    // e in a storage service
    // For this demo, we'll extract text from the file
    const fileText = await extractTextFromFile(file);

    // Analyze the resume using AI
    const analysis = await analyzeResume(fileText);

    // Store the session data in the database
    await saveSession(sessionId, {
      text: fileText,
      analysis,
      fileName: file.name,
    });

    return sessionId;
  } catch (error) {
    console.error("Error processing resume:", error);
    throw error;
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();

  try {
    const fileType = file.type;

    if (fileType === "application/pdf") {
      // For PDF files, we need to convert ArrayBuffer to Buffer
      const buffer = Buffer.from(new Uint8Array(arrayBuffer));
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      // For Word documents, we can use the arrayBuffer directly
      const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
      return result.value;
    } else {
      throw new Error("Unsupported file type");
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw new Error(
      "Failed to extract text from file. Please try again with a different file."
    );
  }
}

async function analyzeResume(resumeText: string) {
  try {
    const prompt = `
You are an expert resume reviewer and career coach. Analyze the following resume and provide:
1. A summary of the candidate's profile
2. Key skills identified
3. Experience highlights
4. Education details (format each education entry as a single string, e.g. "Bachelor of Science in Computer Science, Stanford University, 3.8 GPA, 2020")
5. Strengths of the resume
6. Areas for improvement
7. Suggested career paths based on their experience and skills
8. Recommended skills to develop
9. Potential certifications to pursue

Resume:
${resumeText}

Format your response as a JSON object with the following keys:
- profileSummary (string)
- keySkills (array of strings)
- experienceHighlights (array of strings)
- education (array of strings, each string containing the full education details)
- strengths (array of strings)
- areasForImprovement (array of strings)
- suggestedCareerPaths (array of strings)
- recommendedSkills (array of strings)
- recommendedCertifications (array of strings)

IMPORTANT: 
- Return ONLY the JSON object with no markdown formatting, no code blocks, and no additional text
- Make sure education entries are strings, not objects
- Example education entry: "Master of Science in Data Science, MIT, 3.9 GPA, 2021"
`;

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
    });

    // Extract JSON from the response
    // This handles cases where the AI might wrap the response in markdown code blocks
    let jsonStr = text;

    // Remove markdown code blocks if present
    const jsonMatch = text.match(/```(?:json)?([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1].trim();
    }

    // Try to parse the JSON
    try {
      return JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);

      // Fallback: Return a default structure with error information
      return {
        profileSummary: "Could not analyze resume properly. Please try again.",
        keySkills: ["Not available"],
        experienceHighlights: ["Not available"],
        education: ["Not available"],
        strengths: ["Not available"],
        areasForImprovement: ["Not available"],
        suggestedCareerPaths: ["Not available"],
        recommendedSkills: ["Not available"],
        recommendedCertifications: ["Not available"],
        error: "Failed to parse AI response",
      };
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
}

export async function getSessionData(sessionId: string) {
  return getSession(sessionId);
}
