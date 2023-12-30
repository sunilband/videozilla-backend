import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
  {
    videoFile: {
      type: String, //Cloudinary url
       required: true,
    },
    thumbnail: {
      type: String, //Cloudinary url
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description:{
        type: String,
        required: true,
        trim: true,
    },
    duration:{
        type: Number, //from cloudnary
        required: true,
    },
    views:{
        type: Number,
        default: 0,
    },
    isPubished:{
        type: Boolean,
        default: true,
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User",
    },

  },
  {
    timestamps: true,
  }
);

// this is used for writing aggregation queries
mongoose.plugin(mongooseAggregatePaginate);

export const User = mongoose.model("User", userSchema);
