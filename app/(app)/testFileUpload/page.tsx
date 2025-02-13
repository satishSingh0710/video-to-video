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
  const [promptData, setPromptData] = useState<PromptData>();
  const uploaderRef = useRef<any>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleUpload = (url: string) => {
    setFileUrl(url);
  };

  const getTransFormedVideoLink = async () => {
    const res = await axios.post("/api/fal/result", { requestId });
    console.log("Response from getTransFormedVideoLink", res);

    // Accessing the Fal.AI result
    console.log("response.data.response.data.video.url", res.data.response.data.video.url);

    const cloudinaryTransformedVideo = await axios.post("/api/upload-generated-video", {
      generatedUrl: res.data.response.data.video.url,
      promptId: promptData?._id,
    });

    console.log("cloudinaryTransformedUrl", cloudinaryTransformedVideo);
    setGeneratedVideoUrl(cloudinaryTransformedVideo.data.prompt.generatedUrl);
  };

  useEffect(() => {
    if (!requestId) return; // ✅ Prevent polling if no requestId

    const interval = setInterval(async () => {
      try {
        const response = await axios.post(`/api/fal/status`, { requestId });
        console.log("response.data.response.status:", response.data?.response?.status);

        if (response.data.response.status === "COMPLETED") {
          getTransFormedVideoLink();
          clearInterval(interval);
        }
      } catch (error: any) {
        console.error(
          "❌ Error checking status for requestId:",
          requestId,
          error.response?.data || error.message
        );
        clearInterval(interval); // ✅ Stop polling if there's an error
      }
    }, 10000);

    return () => clearInterval(interval); // ✅ Clean up on unmount
  }, [requestId]);

  const generateAiVideo = async () => {
    try {
      console.log(
        "Before generation: ",
        promptData?._id,
        promptData?.referenceVideoUrl,
        promptData?.prompt
      );
      const response = await axios.post("/api/fal/submit", {
        promptId: promptData?._id,
        referenceVideoUrl: promptData?.referenceVideoUrl,
        userPrompt: promptData?.prompt,
      });

      if (response.status !== 200) {
        throw new Error(response.data.error || "AI video generation failed");
      }
      setRequestId(response.data.requestId);
      console.log("AI video generation under process :", response);
    } catch (error: any) {
      console.error("AI video generation failed:", error.response?.data || error.message);
      alert("AI video generation failed!");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!promptData) return;
    generateAiVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      if (uploaderRef.current) {
        console.log("uploaderRef.current", uploaderRef.current);
        // uploaderRef.current.clear(); // Uncomment if you want to auto-clear
      }

      console.log("upload successful");
      setPrompt("");
      setFileUrl(null);
      setIsGenerating(true);
    } catch (error: any) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert("Upload failed!");
    }
    setIsUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-8">
      {/* Page Heading */}
      <h1 className="text-center text-3xl font-bold mb-10">
        Remove the background of your video with AI
      </h1>

      {/* Main Container: Two-Column Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Panel: Upload & Prompt */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col space-y-4">
          <h2 className="text-xl font-semibold">Upload Video</h2>

          <div className="bg-gray-100 border border-dashed border-gray-300 rounded p-4">
            {/* Uploadcare Uploader */}
            <UploadcareUploader onUpload={handleUpload} ref={uploaderRef} />
            {fileUrl && (
              <div className="mt-4">
                <video src={fileUrl} controls className="w-full rounded" />
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Enter prompt here...
            </label>
            <input
              id="prompt"
              type="text"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Green Screen"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:bg-purple-400"
            disabled={isUploading || !fileUrl || !prompt}
          >
            {isUploading ? "Uploading..." : "Generate Video"}
          </button>
        </div>

        {/* Right Panel: Preview or "Ready to Process" */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
          {generatedVideoUrl ? (
            <div className="w-full">
              <h3 className="text-xl font-semibold mb-4">Your Transformed Video</h3>
              <video src={generatedVideoUrl} controls className="w-full rounded" />
            </div>
          ) : (
            <div className="text-center">
              {
                !isGenerating && <h3 className="text-xl font-semibold mb-2">Upload a video to get started</h3>
              }
              {
                isGenerating && <h3>Generating the video...! Hold on...</h3>
              }
              {
                requestId !== "" && <>
                  <h3 className="text-xl font-semibold mb-2">Ready to Process</h3>
                  <p className="text-gray-500">Upload a video to get started</p>
                </>
              }

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadForm;
