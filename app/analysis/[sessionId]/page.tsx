import { getSessionData } from "@/app/actions"
import ChatInterface from "@/components/chat-interface"
import ResumeAnalysis from "@/components/resume-analysis"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Resume Analysis",
  description: "AI-powered resume analysis and career guidance",
}

export default async function AnalysisPage({
  params,
}: {
  params: { sessionId: string }
}) {
  const resolvedParams = await params
  const sessionData = await getSessionData(resolvedParams.sessionId)

  if (!sessionData) {
    notFound()
  }

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Resume Analysis</h1>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="chat">Career Guidance Chat</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-6">
          <ResumeAnalysis analysis={sessionData.analysis} fileName={sessionData.fileName} />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ChatInterface sessionId={resolvedParams.sessionId} resumeText={sessionData.text} analysis={sessionData.analysis} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

