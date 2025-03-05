import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-4">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-lg font-medium">Loading resume analysis...</p>
    </div>
  )
}

