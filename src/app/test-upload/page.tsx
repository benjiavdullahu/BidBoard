"use client";

import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";

export default function TestUpload() {
  const [imageUrl, setImageUrl] = useState("");

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Test Image Upload</h1>

      <div className="max-w-md">
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            console.log("Upload complete:", res);
            if (res?.[0]?.url) {
              setImageUrl(res[0].url);
            }
          }}
          onUploadError={(error: Error) => {
            console.error("Upload error:", error);
            alert(`ERROR! ${error.message}`);
          }}
        />

        {imageUrl && (
          <div className="mt-8">
            <p className="mb-4">Uploaded image URL: {imageUrl}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Uploaded"
              className="w-64 h-64 object-cover rounded"
            />
          </div>
        )}
      </div>
    </div>
  );
}
