"use client";

import React, { useRef, useState, useEffect } from "react";
import UploadcareUploader from "@/components/UploadcareUploader";
import axios from "axios";

interface PromptData {
  prompt: string;
  referenceVideoUrl: string;
  _id: string;
}

const VideoUploadForm: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  // const [userUploadCloudinaryUrl, setUserUploadCloudinaryUrl] = useState<string>("");
  const [promptData, setPromptData] = useState<PromptData>();
  const uploaderRef = useRef<any>(null); // ✅ Ref to call `clearUploads()`
  // const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string>("");
  const [requestId, setRequestId] = useState<string>("");

  const handleUpload = (url: string) => {
    setFileUrl(url);
  };


  const getTransFormedVideoLink = async () => {
    const response = await axios.post("/api/fal/result", { requestId })
    console.log("Response from getTransFormedVideoLink", response);
  }

  useEffect(() => {
    if (!requestId) return; // ✅ Prevent polling if no requestId

    const interval = setInterval(async () => {
      try {
        const response = await axios.post(`/api/fal/status`, { requestId });

        console.log("🔍 Checking status for requestId:", requestId, "=>>>", response.data);
        console.log("response.data.response.status:", response.data?.response?.status);
        if(response.data.response.status === "COMPLETED"){
          getTransFormedVideoLink();
          clearInterval(interval);
        }

      } catch (error: any) {
        console.error("❌ Error checking status for requestId:", requestId, error.response?.data || error.message);
        clearInterval(interval); // ✅ Stop polling if there's an error
      }
    }, 10000); // ✅ Poll every 10 seconds

    return () => clearInterval(interval); // ✅ Clean up on unmount
  }, [requestId]);

  const generateAiVideo = async () => {
    try {
      console.log("Before generation: ", promptData?._id, promptData?.referenceVideoUrl, promptData?.prompt);
      const response = await axios.post("/api/fal/submit", {
        promptId: promptData?._id,
        referenceVideoUrl: promptData?.referenceVideoUrl,
        userPrompt: promptData?.prompt,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || "AI video generation failed");
      }
      setRequestId(response.data.requestId);
      console.log("AI video generation successful:", response);
      setGeneratedVideoUrl(response.data.generatedUrl);
    } catch (error: any) {
      console.error("AI video generation failed:", error.response?.data || error.message);
      alert("AI video generation failed!");
    }
  }

  useEffect(() => {
    if (!promptData) return;
    generateAiVideo();
  }, [promptData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileUrl) {
      alert("Please upload a video first!");
      return;
    }

    if (!prompt) {
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

      setPromptData({
        prompt: response.data.prompt.prompt,
        referenceVideoUrl: response.data.prompt.referenceVideoUrl,
        _id: response.data.prompt._id,
      });

      // setUserUploadCloudinaryUrl(response.data.prompt.referenceVideoUrl);

      // ✅ Clear Uploadcare Uploader after submission
      if (uploaderRef.current) {
        uploaderRef.current.clearUploads();
        // uploaderRef.current.clear(); 
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
            <UploadcareUploader onUpload={handleUpload} ref={uploaderRef}/>
            {/* {
              userUploadCloudinaryUrl && <>
                <video src={userUploadCloudinaryUrl} controls></video>
              </>
            } */}
            {
              fileUrl && <video src={fileUrl} controls></video>
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
        {
          generatedVideoUrl && <>
            <video src={generatedVideoUrl} controls></video>
          </>
        }
      </div>
    </div>
  );
};

export default VideoUploadForm;
