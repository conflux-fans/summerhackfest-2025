const { RateLimiterMemory } = require('rate-limiter-flexible');

// Rate limiter configurations
const rateLimiters = {
  // General API rate limiting
  general: new RateLimiterMemory({
    points: 100, // Number of requests
    duration: 60, // Per 60 seconds
    execEvenly: true, // Execute requests evenly
  }),
  
  // Strict rate limiting for sensitive operations
  strict: new RateLimiterMemory({
    points: 10, // Number of requests
    duration: 60, // Per 60 seconds
    execEvenly: true,
  }),
  
  // Upload rate limiting
  upload: new RateLimiterMemory({
    points: 20, // Number of uploads
    duration: 300, // Per 5 minutes
    execEvenly: true,
  }),
  
  // Verification rate limiting
  verification: new RateLimiterMemory({
    points: 50, // Number of verifications
    duration: 60, // Per 60 seconds
    execEvenly: true,
  }),
  
  // Pairing rate limiting
  pairing: new RateLimiterMemory({
    points: 5, // Number of pairing attempts
    duration: 300, // Per 5 minutes
    execEvenly: true,
  }),
};

// Generic rate limiter middleware factory
const createRateLimiter = (limiterName = 'general') => {
  const limiter = rateLimiters[limiterName];
  
  if (!limiter) {
    throw new Error(`Rate limiter '${limiterName}' not found`);
  }
  
  return async (req, res, next) => {
    try {
      // Use IP address as the key, but also consider user agent for additional security
      const key = `${req.ip}_${req.get('User-Agent') || 'unknown'}`;
      
      await limiter.consume(key);
      next();
    } catch (rejRes) {
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1;
      
      res.set('Retry-After', String(secs));
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Please try again in ${secs} seconds.`,
        retryAfter: secs
      });
    }
  };
};

// Export specific rate limiters
module.exports = {
  rateLimiter: createRateLimiter('general'),
  strictRateLimiter: createRateLimiter('strict'),
  uploadRateLimiter: createRateLimiter('upload'),
  verificationRateLimiter: createRateLimiter('verification'),
  pairingRateLimiter: createRateLimiter('pairing'),
  createRateLimiter,
  rateLimiters
};