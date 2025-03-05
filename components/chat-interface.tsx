"use client"

import { CardDescription } from "@/components/ui/card"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { Loader2, SendHorizontal } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  sessionId: string
  resumeText: string
  analysis: any
}

export default function ChatInterface({ sessionId, resumeText, analysis }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load messages from database on mount
  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`)
        if (!response.ok) throw new Error('Failed to load messages')
        const data = await response.json()

        // If no messages exist, add welcome message
        if (data.messages.length === 0) {
          const welcomeMessage = {
            id: "welcome",
            role: "assistant" as const,
            content: "Hi there! I've analyzed your resume and I'm here to help with career guidance. Feel free to ask me about your career options, skills to develop, or how to improve your resume.",
          }
          setMessages([welcomeMessage])
          // Save welcome message to database
          await fetch('/api/chat/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: welcomeMessage,
              sessionId
            })
          })
        } else {
          setMessages(data.messages)
        }
        setIsInitialized(true)
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }
    loadMessages()
  }, [sessionId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading || !isInitialized) return

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Save user message to database
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId
        })
      })

      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          sessionId,
          messages,
          resumeAnalysis: analysis,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant response to chat
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Save assistant message to database
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: assistantMessage,
          sessionId
        })
      })
    } catch (error) {
      console.error("Error sending message:", error)

      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
      }

      setMessages((prev) => [...prev, errorMessage])

      // Save error message to database
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: errorMessage,
          sessionId
        })
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isInitialized) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Career Guidance Chat</CardTitle>
        <CardDescription>Chat with our AI career coach about your resume and career options</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px] overflow-y-auto pr-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-4",
                message.role === "user"
                  ? "ml-auto bg-primary text-primary-foreground w-4/5 md:w-3/5"
                  : "bg-muted w-4/5 md:w-3/5",
              )}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>AI</AvatarFallback>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                </Avatar>
              )}
              <div className="text-sm">{message.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Textarea
            placeholder="Ask about your career options, skills to develop, or resume improvements..."
            value={input}
            onChange={handleInputChange}
            className="min-h-12 flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !isInitialized}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

