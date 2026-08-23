import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import config from "@/lib/config";

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey: config.env.imagekit.publicKey,
  privateKey: config.env.imagekit.privateKey,
  urlEndpoint: config.env.imagekit.urlEndpoint.replace(/\/$/, ''), // Remove trailing slash
});

export async function POST(request: NextRequest) {
  console.log("📤 Upload API called (SDK version)");
  
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log(`📁 File received: ${file.name} (${file.size} bytes)`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload using ImageKit SDK
    const response = await imagekit.upload({
      file: buffer,
      fileName: `university-card-${Date.now()}`,
      useUniqueFileName: true,
      tags: ["university-card", "upload"],
    });

    console.log("✅ Upload successful:", response.filePath);
    
    return NextResponse.json({
      success: true,
      filePath: response.filePath,
      url: response.url,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}