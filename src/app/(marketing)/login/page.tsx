"use client"

import { Suspense, useState } from "react"
import { getProviders, signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { CivicSignalIcon, WorkforcePulseMark } from "@/components/branding/workforce-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"signin" | "register">("signin")
  const { data: providers } = useQuery({
    queryKey: ["authProviders"],
    queryFn: () => getProviders(),
  })
  const oauthProviders = Object.values(providers ?? {}).filter((provider) => provider.id !== "credentials")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password: password.trim(),
        redirect: false,
      })
      if (result?.error) {
        setError("Invalid email or password.")
        setLoading(false)
        return
      }
      // Full navigation ensures the session cookie is sent and middleware sees the new session
      window.location.href = callbackUrl
    } catch {
      setError("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none absolute inset-0 glass-page-bg" aria-hidden />
      <div className="pointer-events-none absolute left-[-6rem] top-[-5rem] h-64 w-64 rounded-full bg-white/30 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(209,154,71,0.18)_0%,rgba(0,89,142,0.14)_54%,transparent_74%)] blur-3xl" aria-hidden />

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <div className="relative overflow-hidden rounded-[32px] border border-white/45 bg-white/38 p-8 shadow-[0_16px_34px_rgba(209,154,71,0.1),0_28px_90px_rgba(0,46,61,0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6">
            <div className="absolute inset-0 montgomery-hero-photo montgomery-hero-photo-1 opacity-26" aria-hidden />
            <div className="absolute inset-0 montgomery-hero-photo montgomery-hero-photo-2 opacity-22 mix-blend-soft-light" aria-hidden />
            <div className="absolute inset-0 montgomery-hero-skyline opacity-28" aria-hidden />
            <div className="absolute inset-0 montgomery-hero-vignette opacity-80" aria-hidden />
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.18),transparent_32%),radial-gradient(circle_at_84%_12%,rgba(209,154,71,0.24),transparent_34%),linear-gradient(160deg,rgba(8,19,28,0.34)_0%,rgba(8,19,28,0.18)_40%,rgba(8,19,28,0.46)_100%)] backdrop-blur-[2px]"
              aria-hidden
            />
            <div className="relative z-10 space-y-6 text-white">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
                  <WorkforcePulseMark className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-white">Workforce Pulse</p>
                  <p className="text-sm uppercase tracking-[0.22em] text-white/80">Civic workforce intelligence</p>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="font-display text-4xl leading-tight text-white">
                  A focused entry point for Montgomery&apos;s workforce command view.
                </h2>
                <p className="max-w-md text-sm leading-7 text-white/85">
                  Secure access to local hiring pressure, sector health, and training demand without burying the signal in noise.
                </p>
              </div>

              <div className="rounded-2xl border border-white/35 bg-white/20 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <CivicSignalIcon className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold text-white">Small civic branding, deliberate placement</p>
                <p className="mt-1 text-sm text-white/80">The city mark stays present, but restrained across access points.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-sm justify-self-center space-y-6 overflow-hidden rounded-[32px] border border-white/60 bg-white/92 p-6 shadow-[0_16px_34px_rgba(209,154,71,0.08),0_28px_90px_rgba(0,46,61,0.09)] dark:border-white/10 dark:bg-slate-950/78 sm:p-8">

          <div className="relative z-10 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {mode === "signin" ? "Sign in" : "Create account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to access Workforce Pulse."
                  : "Register with a trusted provider to securely create your account."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/70 p-1">
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${mode === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          {mode === "register" && (
            <div className="space-y-3">
              {oauthProviders.map((provider) => (
                <Button
                  key={provider.id}
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl"
                  onClick={() => signIn(provider.id, { callbackUrl })}
                >
                  Continue with {provider.name}
                </Button>
              ))}
              {oauthProviders.length === 0 && (
                <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">
                  No external providers are configured yet. Add Google, LinkedIn, or GitHub keys to enable secure registration.
                </p>
              )}
            </div>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-muted-foreground">
                {mode === "signin" ? "Or use demo credentials" : "Or sign in with demo credentials"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg bg-destructive/10 py-2 text-center text-sm text-destructive">
                {error}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@montgomery.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="space-y-1 text-center text-xs text-muted-foreground">
            <p>Admin: admin@montgomery.gov / demo123</p>
            <p>Citizen: citizen@montgomery.gov / demo123</p>
          </div>

          <p className="text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
