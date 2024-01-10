import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { redis } from "../db/redisClient/index.js";
import { maxRequests, timeWindow } from "../constants.js";

const rateLimit = asyncHandler(async (req, res, next) => {
  const clientIP = req.ip;
  const currentRequestCount = await redis.incr(clientIP);
  if (currentRequestCount === 1) {
    await redis.expire(clientIP, timeWindow);
  }
  if (currentRequestCount > maxRequests) {
    throw new ApiError(429, "Too many requests. Please try again later.");
  } else {
    next();
  }
});

export { rateLimit };
