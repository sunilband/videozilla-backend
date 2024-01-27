import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(filePath); //remove temp file
    return response;
  } catch (error) {
    fs.unlinkSync(filePath);
    return null;
  }
};

// const deleteFromCloudinary = async (publicId) => {
//   try {
//     if (!publicId) return null;
//     const response = await cloudinary.uploader.destroy(publicId);
//     return response;
//   } catch (error) {
//     return null;
//   }
// };

const deleteFromCloudinary = async (input) => {
  try {
    let publicId;
    // Check if the input is a URL
    if (input.includes("http")) {
      // Extract the public ID from the URL
      publicId = input.split("/").pop().split(".")[0];
    } else {
      // Assume the input is a public ID
      publicId = input;
    }
    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
