import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md space-y-6">
        <p className="text-8xl font-display font-bold text-primary/30">404</p>
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2 rounded-xl">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button asChild className="gap-2 rounded-xl">
            <Link href="/login">
              <Home className="h-4 w-4" />
              Sign in
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
