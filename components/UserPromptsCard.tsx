import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface UserPromptsCardProps {
  referenceVideoUrl: string;
  prompt: string;
  generatedUrl?: string;
}

const UserPromptsCard: React.FC<UserPromptsCardProps> = ({
  referenceVideoUrl,
  prompt,
  generatedUrl,
}) => {
  return (
    <Card className="p-6 flex gap-6 w-full max-w-3xl border border-gray-300 shadow-md rounded-lg">
      {/* Left Side: Reference Video and Prompt */}
      <div className="flex flex-col w-1/2 space-y-3">
        <video src={referenceVideoUrl} controls className="w-full rounded-lg shadow-sm" />
        <p className="text-sm text-gray-800 bg-gray-100 p-3 rounded-lg shadow-sm border border-gray-200">
          {prompt}
        </p>
      </div>

      {/* Right Side: Generated Video or Failure Message */}
      <div className="w-1/2 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 shadow-sm p-3">
        {generatedUrl ? (
          <video src={generatedUrl} controls className="w-full rounded-lg shadow-sm" />
        ) : (
          <p className="text-red-600 font-medium text-center">Request Failed</p>
        )}
      </div>
    </Card>
  );
};

export default UserPromptsCard;