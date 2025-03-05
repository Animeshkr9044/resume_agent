import Database from "better-sqlite3";
import { join } from "path";

// Define types
interface SessionData {
  text: string;
  analysis: any;
  fileName: string;
}

interface SessionRow {
  id: string;
  text: string;
  analysis: string;
  fileName: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

// Initialize database
const db = new Database(join(process.cwd(), "sessions.db"));

// Create sessions table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    analysis TEXT NOT NULL,
    fileName TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create chat_messages table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  )
`);

// Helper functions for session management
export function saveSession(sessionId: string, data: SessionData) {
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO sessions (id, text, analysis, fileName) VALUES (?, ?, ?, ?)"
  );
  stmt.run(sessionId, data.text, JSON.stringify(data.analysis), data.fileName);
  return sessionId;
}

export function getSession(sessionId: string): SessionData | null {
  const stmt = db.prepare("SELECT * FROM sessions WHERE id = ?");
  const session = stmt.get(sessionId) as SessionRow | undefined;

  if (!session) {
    return null;
  }

  return {
    text: session.text,
    analysis: JSON.parse(session.analysis),
    fileName: session.fileName,
  };
}

// Helper functions for chat message management
export function saveChatMessage(message: Omit<ChatMessage, "created_at">) {
  const stmt = db.prepare(
    "INSERT INTO chat_messages (id, session_id, role, content) VALUES (?, ?, ?, ?)"
  );
  stmt.run(message.id, message.sessionId, message.role, message.content);
  return message.id;
}

export function getChatMessages(sessionId: string): ChatMessage[] {
  const stmt = db.prepare(
    "SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC"
  );
  return stmt.all(sessionId) as ChatMessage[];
}

// Optional: Clean up old sessions (older than 24 hours)
export function cleanupOldSessions() {
  const stmt = db.prepare(
    'DELETE FROM sessions WHERE created_at < datetime("now", "-24 hours")'
  );
  stmt.run();
}

// Run cleanup every hour
setInterval(cleanupOldSessions, 1000 * 60 * 60);
