import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { bodyDataExists, emailIsValid } from "../utils/validation/bodyData.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { User } from "../models/user.model.js";

const registerUser = asyncHandler(async (req, res) => {
  // extracting data from the request body
  const { fullName, email, username, password } = req.body;
  // checking if the required fields are provided
  if (bodyDataExists(fullName, email, username, password)) {
    throw new ApiError(400, "Please provide all the required fields");
  }
  // checking if the email is valid
  if (!emailIsValid(email)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  // Check if existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or Username already exists");
  }

  const avatarLocalPath = req.file?.avatar[0]?.path;
  const coverImageLocalPath = req.file?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload avatar and coverImage to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar upload failed");
  }

  // create new user
  const newUser = new User({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // check if user was created and deselect password and refreshToken
 const createdUser =await User.findById({
    _id: newUser._id,
  }).select("-password -refreshToken");

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }
 

  res.status(200).json(
    new ApiResponse(200,createdUser, "User created successfully")
  );
});

export { registerUser };
