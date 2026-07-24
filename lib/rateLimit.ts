// Simple in-memory sliding-window-ish limiter. Honest limitation: this only
// holds state for a single running server process — fine for one instance,
// but won't share limits across multiple instances in a real horizontally
// scaled deployment (that would need something like Upstash Redis instead).
interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Shared across every AI-cost action (discover, research, pitch, proposal,
// follow-up, agent run, meeting parsing, chat) so a user can't dodge the
// limit by spreading requests across different endpoints.
export function checkAiRateLimit(userId: string) {
  return checkRateLimit(`ai:${userId}`, 30, 10 * 60 * 1000);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
