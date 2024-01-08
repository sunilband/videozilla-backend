import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      lowercase: true,
      // index optimizes search queries
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      index: true,
    },
    avatar: {
      type: String, //Cloudnary url
      required: true,
    },
    coverImage: {
      type: String, //Cloudnary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      validate: {
        validator: function (v) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(v);
        },
        message: (props) =>
          `Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter and one number`,
      },
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// we are not using arrow function here because we need access to "this"
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// custom method to generate authToken
userSchema.methods.ispasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// custom method to generate authToken
userSchema.methods.generateAuthToken = async function () {
  const token = await jwt.sign(
    {
      _id: this._id,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  return token;
};

// custom method to generate refreshToken
userSchema.methods.generateRefreshToken = async function () {
  const token = await jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  return token;
};

export const User = mongoose.model("User", userSchema);
