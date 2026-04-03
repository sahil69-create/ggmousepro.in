import { NextResponse } from 'next/server';

// Configuration for rate limiting
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 60; // 60 requests per minute

// In-memory store for rate limiting (Note: This is per-edge location and not persistent)
// For a production-ready "robust" rate limiter, you should use a KV store like Upstash.
const ipRequestCounts = new Map();

/**
 * Middleware for rate limiting and security headers
 */
export function middleware(request) {
  const ip = request.ip || '127.0.0.1';
  const now = Date.now();
  
  // Clean up old entries periodically (simple way for this example)
  if (ipRequestCounts.size > 1000) {
    for (const [key, value] of ipRequestCounts.entries()) {
      if (now - value.startTime > RATE_LIMIT_WINDOW_MS) {
        ipRequestCounts.delete(key);
      }
    }
  }

  // Get current rate limit data for this IP
  let rateLimitData = ipRequestCounts.get(ip);

  if (!rateLimitData || now - rateLimitData.startTime > RATE_LIMIT_WINDOW_MS) {
    // New window or first request
    rateLimitData = {
      count: 1,
      startTime: now
    };
    ipRequestCounts.set(ip, rateLimitData);
  } else {
    // Increment count in current window
    rateLimitData.count++;
  }

  // Check if limit exceeded
  if (rateLimitData.count > MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((rateLimitData.startTime + RATE_LIMIT_WINDOW_MS - now) / 1000);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfterSeconds: retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (rateLimitData.startTime + RATE_LIMIT_WINDOW_MS).toString()
        }
      }
    );
  }

  // Proceed with the request
  const response = NextResponse.next();

  // Add rate limit headers to successful responses
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString());
  response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS_PER_WINDOW - rateLimitData.count).toString());
  response.headers.set('X-RateLimit-Reset', (rateLimitData.startTime + RATE_LIMIT_WINDOW_MS).toString());

  return response;
}

export const config = {
  matcher: '/api/:path*', // Apply rate limiting specifically to API routes
};
