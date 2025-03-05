import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, messages, resumeAnalysis } = await req.json();

    // Create a context from the resume analysis
    const resumeContext = `
You are a career coach and resume expert. You have analyzed the user's resume and have the following information:

Profile Summary: ${resumeAnalysis.profileSummary}

Key Skills: ${resumeAnalysis.keySkills.join(", ")}

Experience Highlights: 
${resumeAnalysis.experienceHighlights.join("\n")}

Education: 
${resumeAnalysis.education.join("\n")}

Strengths: 
${resumeAnalysis.strengths.join("\n")}

Areas for Improvement: 
${resumeAnalysis.areasForImprovement.join("\n")}

Suggested Career Paths: 
${resumeAnalysis.suggestedCareerPaths.join("\n")}

Recommended Skills to Develop: 
${resumeAnalysis.recommendedSkills.join("\n")}

Recommended Certifications: 
${resumeAnalysis.recommendedCertifications.join("\n")}

Your job is to help the user understand their career options, provide guidance on skill development, and answer questions about their resume or career path. Be supportive, specific, and actionable in your advice.`;

    // Create a conversation history from previous messages
    const conversationHistory = messages
      .filter((m: any) => m.id !== "welcome") // Skip the welcome message
      .map(
        (m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
      )
      .join("\n\n");

    // Construct the prompt with context and conversation history
    const prompt = `
${resumeContext}

${
  conversationHistory
    ? `Previous conversation:\n${conversationHistory}\n\n`
    : ""
}

User: ${message}
Assistant: `;

    // Call OpenAI API or your preferred AI service here
    // For example:
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: resumeContext,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    return Response.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error("Error in chat API:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
