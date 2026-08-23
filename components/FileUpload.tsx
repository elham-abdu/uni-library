"use client";

import { useState } from "react";

interface Props {
  onFileChange: (filePath: string) => void;
  value?: string;
}

const FileUpload = ({ onFileChange, value }: Props) => {
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMessage("");
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
      
      if (data.filePath) {
        onFileChange(data.filePath);
      } else {
        throw new Error("No file path returned");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="cursor-pointer form-input flex-1"
          disabled={uploading}
        />
      </div>
      {uploading && <p className="mt-1 text-xs text-light-100">Uploading...</p>}
      {errorMessage && <p className="mt-1 text-xs text-red-500">{errorMessage}</p>}
      {value && !uploading && !errorMessage && (
        <p className="mt-1 text-xs text-green-500">✓ Uploaded: {fileName || value}</p>
      )}
    </div>
  );
};

export default FileUpload;