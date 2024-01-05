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
} from "../utils/cloudinary.js";
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

  // checking if the password is valid
  if (!passwordIsValid(password)) {
    throw new ApiError(
      400,
      "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and one number"
    );
  }

  // Check if existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new ApiError(409, "Email or Username already exists");
  }



  let avatarLocalPath = "";
  let coverImageLocalPath = "";
  
  if(req.files?.avatar && req.files?.avatar[0]) {
    avatarLocalPath = req.files?.avatar[0]?.path;
  }
  if(req.files?.coverImage && req.files?.coverImage[0]) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

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

export { registerUser };
