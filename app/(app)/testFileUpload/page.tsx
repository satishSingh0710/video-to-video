"use client";

import React, { useRef, useState } from "react";
import UploadcareUploader from "@/components/UploadcareUploader";
import axios from "axios";

const VideoUploadForm: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [userUploadCloudinaryUrl, setUserUploadCloudinaryUrl] = useState<string>("");
  const [promptId, setPromptId] = useState<string>("");
  const uploaderRef = useRef<any>(null); // ✅ Ref to call `clearUploads()`

  const handleUpload = (url: string) => {
    setFileUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!fileUrl){
      alert("Please upload a video first!");
      return;
    }

    if(!prompt){
      alert("Please enter a prompt!");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("referenceVideoUrl", fileUrl);
      formData.append("prompt", prompt);

      const response = await axios.post("/api/upload-user-video", formData);

      if (response.status !== 200) {
        throw new Error(response.data.error || "Upload failed");
      }

      console.log("Upload successful:", response);
      setPromptId(response.data.prompt._id);
      setUserUploadCloudinaryUrl(response.data.prompt.referenceVideoUrl);

      // ✅ Clear Uploadcare Uploader after submission
      if (uploaderRef.current) {
        uploaderRef.current.clearUploads();
      }

      alert("Upload successful!");
      setPrompt(""); // ✅ Reset input
      setFileUrl(null);
    } catch (error: any) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert("Upload failed!");
    }
    setIsUploading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-2xl bg-gray-800 shadow-lg rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-center">Upload Video & Enter Prompt</h2>

        <div className="bg-gray-700 p-4 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                className="w-full bg-gray-600 text-white border-none p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-300"
                placeholder="Type your prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <span className="absolute right-3 top-3 text-gray-400">✍️</span>
            </div>

            {/* ✅ Pass uploader reference to call `clearUploads()` */}
            <UploadcareUploader onUpload={handleUpload} />
            {
              userUploadCloudinaryUrl && <>
              <video src={userUploadCloudinaryUrl} controls></video>
              </>
            }

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium p-3 rounded-lg transition duration-300 disabled:bg-gray-500"
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Submit"}
            </button>
          </form>
        </div>

        {/* {userUploadCloudinaryUrl && (
          <div className="mt-4 p-4 bg-gray-700 rounded-lg shadow-md flex flex-col items-center">
            <p className="text-sm font-medium text-gray-300">📹 Uploaded Video:</p>
            <video src={userUploadCloudinaryUrl} controls className="w-full mt-2 rounded-lg shadow-md" />
          </div>
        )} */}
      </div>
    </div>
  );
};

export default VideoUploadForm;
