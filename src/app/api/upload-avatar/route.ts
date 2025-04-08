import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
// Remove unused Firebase imports for now
// import { auth } from "@/lib/firebaseConfig";
// import { getAuth } from "firebase-admin/auth";
// import { initAdmin } from "@/lib/firebaseAdmin";

// Configure Cloudinary (ensure environment variables are set)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use https
});

export async function POST(request: Request) {
  // Optional: Add authentication check here if needed
  // e.g., verify Firebase ID token passed in headers
  // const adminApp = await initAdmin();
  // const token = request.headers.get('Authorization')?.split('Bearer ')[1];
  // if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // try {
  //   const decodedToken = await getAuth(adminApp).verifyIdToken(token);
  //   // Use decodedToken.uid if needed
  // } catch (error) {
  //   return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  // }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // Convert file to buffer or base64 for upload
    const fileBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "avatars", // Optional: Organize uploads in a folder
            // Add transformations if needed (e.g., resizing)
            // transformation: [{ width: 250, height: 250, crop: "fill" }],
          },
          (error, result) => {
            if (error) {
              console.error("Cloudinary Upload Error:", error);
              return reject(error);
            }
            resolve(result);
          }
        )
        .end(buffer);
    });

    // Type assertion might be needed depending on Cloudinary SDK version
    const result = uploadResult as { secure_url?: string };

    if (!result?.secure_url) {
      throw new Error("Cloudinary upload failed to return a secure URL.");
    }

    // Return the secure URL
    return NextResponse.json({ secureUrl: result.secure_url });
  } catch (error: unknown) {
    console.error("API Route Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
