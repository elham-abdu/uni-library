import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import config from "@/lib/config";

const {
  env: {
    imagekit: { publicKey, privateKey, urlEndpoint },
  },
} = config;

// Initialize ImageKit
const imagekit = new ImageKit({
  publicKey,
  privateKey,
  urlEndpoint,
});

export async function GET() {
  try {
    // Get authentication parameters
    const authParams = imagekit.getAuthenticationParameters();
    
    return NextResponse.json({
      signature: authParams.signature,
      expire: authParams.expire,
      token: authParams.token,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return NextResponse.json(
      { error: "Failed to authenticate with ImageKit" },
      { status: 500 }
    );
  }
}