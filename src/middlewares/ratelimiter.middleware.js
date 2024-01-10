import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { maxRequests } from "../constants.js";
import { cache } from "../db/NodeCacher/index.js";

const rateLimit = asyncHandler(async (req, res, next) => {
  const clientIP = req.ip;
  let data = cache.get(clientIP);

  if (!data) {
    data = { count: 1 };
    cache.set(clientIP, data);
  } else if (data.count >= maxRequests) {
    throw new ApiError(429, "Too many requests. Please try again later.");
  } else {
    data.count++;
    cache.set(clientIP, data);
  }
  next();
});
export { rateLimit };
