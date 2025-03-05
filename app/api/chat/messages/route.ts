import { getChatMessages, saveChatMessage } from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const messages = getChatMessages(sessionId);
    return Response.json({ messages });
  } catch (error) {
    console.error("Error getting chat messages:", error);
    return Response.json(
      { error: "Failed to get chat messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return Response.json(
        { error: "Message and session ID are required" },
        { status: 400 }
      );
    }

    saveChatMessage({
      id: message.id,
      sessionId,
      role: message.role,
      content: message.content,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error saving chat message:", error);
    return Response.json(
      { error: "Failed to save chat message" },
      { status: 500 }
    );
  }
}
