import { AssistantResponse } from "ai"
import OpenAI from "openai"

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { threadId, message, resumeContext } = await req.json()

    // Create a thread if needed
    const threadIdToUse = threadId ?? (await openai.beta.threads.create({})).id

    // Add a message to the thread
    const createdMessage = await openai.beta.threads.messages.create(threadIdToUse, {
      role: "user",
      content: message,
    })

    return AssistantResponse({ threadId: threadIdToUse, messageId: createdMessage.id }, async ({ forwardStream }) => {
      // Create a system message with the resume context if this is a new thread
      if (!threadId) {
        await openai.beta.threads.messages.create(threadIdToUse, {
          role: "user",
          content: `This is context about the user's resume for you to reference: ${resumeContext}`,
        })
      }

      // Run the assistant on the thread
      const runStream = openai.beta.threads.runs.stream(threadIdToUse, {
        assistant_id: process.env.ASSISTANT_ID || "asst_abc123", // Replace with your actual Assistant ID
        instructions: `You are a career coach and resume expert. Help the user with career guidance based on their resume. ${resumeContext}`,
      })

      // Forward the stream to the client
      await forwardStream(runStream)
    })
  } catch (error) {
    console.error("Error in assistant API:", error)
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

