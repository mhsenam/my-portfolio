import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (ensure environment variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  // Optional: Add authentication check here if needed

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Convert file to buffer
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to Cloudinary in a 'posts' folder
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "posts", // Store in a 'posts' folder
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Post Image Upload Error:", error);
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(buffer);
    });

    const result = uploadResult as { secure_url?: string };

    if (!result?.secure_url) {
      throw new Error("Cloudinary upload failed to return a secure URL.");
    }

    return NextResponse.json({ secureUrl: result.secure_url });
  } catch (error: unknown) {
    console.error("API Route Error (Post Image):", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
