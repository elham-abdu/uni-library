"use client";

import { IKUpload, ImageKitProvider } from "imagekitio-next";
import { useRef, useState } from "react";
import config from "@/lib/config";

const {
  env: {
    apiEndpoint,
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    // ✅ Changed to match Adrian's route: /api/imagekit
    const response = await fetch(`${apiEndpoint}/api/imagekit`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Auth response error:", errorText);
      throw new Error(`Authentication failed with status ${response.status}`);
    }

    const data = await response.json();
    const { signature, expire, token } = data;

    return { signature, expire, token };
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
};

interface Props {
  onFileChange: (filePath: string) => void;
  value?: string;
}

interface IKUploadResponse {
  filePath?: string;
  url?: string;
  name?: string;
  fileId?: string;
  success?: boolean;
}

interface IKUploadError {
  message?: string;
  code?: string;
  help?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
}

interface UploadProgress {
  loaded: number;
  total: number;
}

const FileUpload = ({ onFileChange, value }: Props) => {
  const ikUploadRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const onError = (error: IKUploadError) => {
    console.error("Upload error:", error);
    setErrorMessage(error?.message || "Upload failed. Please try again.");
    setUploading(false);
  };

  const onSuccess = (res: IKUploadResponse) => {
    console.log("Upload success:", res);
    
    if (res?.filePath) {
      onFileChange(res.filePath);
    } else if (res?.url) {
      onFileChange(res.url);
    } else if (res?.name) {
      onFileChange(res.name);
    } else {
      setErrorMessage("Upload succeeded but no file path returned.");
    }
    setUploading(false);
    setErrorMessage("");
  };

  const onUploadStart = () => {
    setUploading(true);
    setErrorMessage("");
  };

  const onUploadProgress = (progress: UploadProgress) => {
    // Optional: track progress
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <div className="flex flex-col gap-2">
        <IKUpload
          ref={ikUploadRef}
          onError={onError}
          onSuccess={onSuccess}
          onUploadStart={onUploadStart}
          onUploadProgress={onUploadProgress}
          fileName="university-card.png"
          useUniqueFileName={true}
          folder="/university-cards"
          accept="image/*"
          tags={["university-card", "upload"]}
          className="cursor-pointer"
        />
        {uploading && <p className="mt-1 text-xs text-light-100">Uploading...</p>}
        {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
        {value && !uploading && !errorMessage && (
          <p className="mt-1 text-xs text-green-500">✓ Uploaded: {value}</p>
        )}
      </div>
    </ImageKitProvider>
  );
};

export default FileUpload;