import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.C_NAME,
    api_key: process.env.C_API_KEY,
    api_secret: process.env.C_API_SECRET,
});

export const uploadFile = async (file, folder = "projectcamp/tasks") => {
    const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
            folder,
            resource_type: "auto",
        }
    );

    return result;
};

export const deleteFile = async (publicId) => {
    if (!publicId) {
        return;
    }

    await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;