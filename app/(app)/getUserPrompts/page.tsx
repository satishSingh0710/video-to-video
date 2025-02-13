"use client";

import React, { useState, useEffect } from "react";
import UserPromptsCard from "@/components/UserPromptsCard";
import axios from "axios";

interface PromptData {
  prompt: string;
  referenceVideoUrl: string;
  generatedUrl: string;
}

export default function TestFileUpload() {
  const [prompts, setPrompts] = useState<PromptData[]>([]); // Always an array

  useEffect(() => {
    const fetchUserPromptData = async () => {
      try {
        const res = await axios.get("/api/fal/generations");
        console.log("API Response:", res.data); // Log API response

        if (Array.isArray(res.data.prompts)) {
          setPrompts(res.data?.prompts); // Set only if it's an array
        } else {
          console.error("Unexpected API response format:", res.data);
          setPrompts([]); // Reset to empty array if response is invalid
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
      }
    };
    fetchUserPromptData();
  }, []);

  useEffect(() => {
    if (prompts.length === 0) return;
    console.log(prompts);
  }, [prompts]);

  return (
    <>
      {prompts.length > 0 ? (
        prompts.map((prompt, index) => (
          <UserPromptsCard
            key={index}
            referenceVideoUrl={prompt.referenceVideoUrl}
            prompt={prompt.prompt}
            generatedUrl={prompt.generatedUrl}
          />
        ))
      ) : (
        <p>No prompts available.</p>
      )}
    </>
  );
}
