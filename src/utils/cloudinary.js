import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    // 1. Check if the local file path exists
    if (!localFilePath) {
      console.log("Could not find the path of the file");
      return null;
    }

    // 2. Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // 3. File uploaded successfully, now remove the local file
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    // 4. If upload fails, safely remove the local file if it exists
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath); 
    }
    console.error("Error during Cloudinary upload:", error);
    return null;
  }
};

export { uploadOnCloudinary };