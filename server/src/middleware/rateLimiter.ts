import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const windowMs = 60 * 1000; // 1 minute window
const maxRequests = 100; // 100 requests per minute per IP
const clients = new Map<string, RateLimitRecord>();

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();

  const record = clients.get(ip);

  if (!record || now > record.resetTime) {
    clients.set(ip, {
      count: 1,
      resetTime: now + windowMs,
    });
    return next();
  }

  record.count += 1;

  if (record.count > maxRequests) {
    res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait a minute before making more requests.',
      statusCode: 429,
    });
  }

  next();
}
