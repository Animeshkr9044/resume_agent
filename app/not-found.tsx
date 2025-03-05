import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12 space-y-4 text-center">
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="text-lg text-muted-foreground">
        The page you're looking for doesn't exist or the session has expired.
      </p>
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}

