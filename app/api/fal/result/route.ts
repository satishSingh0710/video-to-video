import { NextRequest, NextResponse } from "next/server";
import Prompt from "@/app/models/prompts.models";
import dbConnect from "@/lib/dbConnect";
import { fal } from "@fal-ai/client";

dbConnect(); // Ensure DB connection

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { requestId } = body;

        if (!requestId) {
            return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
        }

        console.log("🔍 Fetching transformed video for requestId:", requestId);

        const result = await fal.queue.result("fal-ai/hunyuan-video/video-to-video", {
            requestId
          });

        return NextResponse.json({ result }, { status: 200 });

    } catch (error) {
        console.error("❌ Error fetching transformed video:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
