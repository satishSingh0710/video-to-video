import { fal } from "@fal-ai/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Prompt from "@/app/models/prompts.models";
import dbConnect from "@/lib/dbConnect";

dbConnect(); // Ensure DB connection

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userPrompt, referenceVideoUrl, promptId } = body;
    console.log("🔹Generation Request received:", {
      userPrompt,
      referenceVideoUrl,
      promptId,
    });
    // ✅ Check for missing fields
    if (!userPrompt || !referenceVideoUrl) {
      console.error("❌ Missing required fields:", {
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
        input: { prompt: userPrompt, video_url: referenceVideoUrl },
        webhookUrl: `https://three-sites-serve.loca.lt/api/fal/webhook`,
      }
    );

    console.log("✅ Request submitted successfully:", request_id);
    
    await Prompt.findByIdAndUpdate(promptId, { requestId: request_id });

    return NextResponse.json(
      { message: "Request submitted", requestId: request_id },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error submitting request:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
