import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const accessToken =
      req?.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    const refreshToken =
      req?.cookies?.refreshToken ||
      req.header("x-refresh-token")?.replace("Bearer ", "") || req.body.refreshToken;
    if (!(accessToken || refreshToken)) {
      throw new ApiError(401, "Middleware: No token, authorization denied");
    }

    const {_id} = accessToken?jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET):jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!_id) {
      throw new ApiError(401, "Middleware: Invalid token");
    }

    const user = await User.findById(_id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Middleware: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Middleware: Invalid token");
  }
});

export { verifyJWT };
