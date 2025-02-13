import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// check if we have the required Cloudinary credentials
function checkCloudinaryCredentials() {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary credentials not found");
  }
}

// upload the video to Cloudinary and export it's secure URL
export async function uploadVideoToCloudinary(videoUrl: string, retries = 3, delay = 1000): Promise<string | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`Uploading video to Cloudinary (Attempt ${attempt})...`);
        const cloudinaryUpload = await cloudinary.uploader.upload(videoUrl, {
          resource_type: "video",
        });
        
        if (!cloudinaryUpload) {
          throw new Error("Failed to upload video to Cloudinary");
        }
        
        return cloudinaryUpload.secure_url; // Return the secure URL of the uploaded video
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(`Attempt ${attempt}: Error uploading video to Cloudinary -`, error.message);
        } else {
          console.log(`Attempt ${attempt}: Error uploading video to Cloudinary -`, error);
        }
        
        if (attempt < retries) {
          await new Promise((resolve) => setTimeout(resolve, delay)); // Wait before retrying
        }
      }
    }
    return null; // Return null if all retries fail
  }
