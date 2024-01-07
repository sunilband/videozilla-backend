import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  bodyDataExists,
  emailIsValid,
  passwordIsValid,
} from "../utils/validation/bodyData.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/services/cloudinary.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../constants.js";

const generateAuthAndRefreshTokens = async (_id, user) => {
  try {
    // user is optional
    let fetchedUser = user ? user : await User.findById(_id);
    const accessToken = await fetchedUser.generateAuthToken();
    const refreshToken = await fetchedUser.generateRefreshToken();
    fetchedUser.refreshToken = refreshToken;
    await fetchedUser.save({
      validateBeforeSave: false,
    });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

// --------------Register User--------------
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (bodyDataExists(fullName, email, username, password)) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  if (!emailIsValid(email)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  if (!passwordIsValid(password)) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and one number"
    );
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or Username already exists");
  }

  let avatarLocalPath = "";
  let coverImageLocalPath = "";

  if (req.files?.avatar && req.files?.avatar[0]) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }
  if (req.files?.coverImage && req.files?.coverImage[0]) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check if user was created and deselect password and refreshToken
  const createdUser = await User.findById({
    _id: newUser._id,
  }).select("-password -refreshToken");

  if (!createdUser) {
    await deleteFromCloudinary(avatar.public_id);
    await deleteFromCloudinary(coverImage.public_id);
    throw new ApiError(500, "User creation failed");
  }

  res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

// --------------Login User--------------
const loginUser = asyncHandler(async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (bodyDataExists(usernameOrEmail, password)) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  // find user
  const loggedInUser = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  }).select("+password");

  if (!loggedInUser) {
    throw new ApiError(404, "User Does Not Exist");
  }
  // password check
  const isPasswordCorrect = await loggedInUser.ispasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }
  // create tokens
  const { accessToken, refreshToken } = await generateAuthAndRefreshTokens(
    loggedInUser._id,
    loggedInUser
  );

  // send secure cookies and response
  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// --------------Logout User--------------
const logoutUser = asyncHandler(async (req, res) => {
  // we have req.user from the auth middleware
  const { _id } = req.user;
  await User.findByIdAndUpdate(
    {
      _id,
    },
    { refreshToken: "" },
    { new: true }
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const user = req.user;
    let { refreshToken } = req.body;
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user?.refreshToken !== refreshToken) {
      throw new ApiError(401, "Refresh Token Expired or Invalid");
    }

    const newTokens = await generateAuthAndRefreshTokens(user._id, user);

    const authToken = newTokens.accessToken;
    refreshToken = newTokens.refreshToken;

    res
      .status(200)
      .cookie("accessToken", authToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { user, authToken, refreshToken },
          "Access token refreshed successfully"
        )
      );

});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
