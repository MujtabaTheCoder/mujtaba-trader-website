/**
 * /api/health.js — Vercel Serverless Health Check Endpoint
 *
 * Provides uptime monitoring, CI/CD deployment verification,
 * and external health checks (UptimeRobot, Checkly, etc.)
 *
 * Usage:
 *   GET /api/health
 *   Response: { status: "ok", ... }
 */

export default function handler(req, res) {
  // No caching — always a fresh check
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  // Only allow GET
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const payload = {
    status:    'healthy',
    service:   'mujtaba-forex-trader',
    version:   process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || 'local',
    timestamp: new Date().toISOString(),
    region:    process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown',
    env:       process.env.VERCEL_ENV    || 'development',
  };

  return res.status(200).json(payload);
}
