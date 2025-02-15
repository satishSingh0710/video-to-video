import { fal } from "@fal-ai/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Prompt from "@/app/models/prompts.models";
import dbConnect from "@/lib/dbConnect";

 // Ensure DB connection

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    await dbConnect();
    const body = await request.json();
    const { userPrompt, referenceVideoUrl, promptId } = body;
    console.log("🔹Generation Request received:", {
      userPrompt,
      referenceVideoUrl,
      promptId,
    });
    // Check for missing fields
    if (!userPrompt || !referenceVideoUrl) {
      console.error("Missing required fields:", {
        userPrompt,
        referenceVideoUrl,
      });
      return NextResponse.json(
        { error: "Missing required fields: userPrompt or referenceVideoUrl" },
        { status: 400 }
      );
    }

    console.log("🔹 Submitting request to Fal.AI...");
    const { request_id } = await fal.queue.submit(
      "fal-ai/hunyuan-video/video-to-video",
      {
        input: { 
          prompt: userPrompt, 
          video_url: referenceVideoUrl,
          num_inference_steps: 30,
          aspect_ratio: "16:9",
          resolution: "720p",
          num_frames: 129,
          enable_safety_checker: true,
          strength: 0.85
       },
        webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/fal/webhook`,
      }
    );

    console.log("Request submitted successfully:", request_id);

    await Prompt.findByIdAndUpdate(promptId, { requestId: request_id });

    return NextResponse.json(
      { message: "Request submitted", requestId: request_id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting request:", error);
    return NextResponse.json(
      { error: "Failed to Generate Video" },
      { status: 500 }
    );
  }
}
