/**
 * Resolve external backend API base safely for browser/server usage.
 * In production browser sessions, ignore localhost URLs to avoid broken fetches.
 */
export function getExternalApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (!configured) return "";

  if (typeof window !== "undefined") {
    const targetsLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(configured);
    const runningOnLocalhost = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);

    if (targetsLocalhost && !runningOnLocalhost) {
      return "";
    }
  }

  return configured.replace(/\/$/, "");
}
