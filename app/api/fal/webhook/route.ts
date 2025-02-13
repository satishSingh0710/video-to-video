import { NextRequest, NextResponse } from "next/server";
import Prompt from "@/app/models/prompts.models";
import dbConnect from "@/lib/dbConnect";

dbConnect(); // Ensure DB connection

export async function POST(request: NextRequest) {
    console.log("🔹 Webhook received: Incoming request"); // ✅ Debug log

    try {
        const body = await request.json();
        console.log("🔹 Webhook received data:", body); // ✅ Log full payload

        const { requestId, status, data } = body;
        if (!requestId || !status) {
            console.error("❌ Webhook missing requestId or status:", body);
            return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 });
        }

        console.log(`🔹 Webhook received for requestId: ${requestId}, Status: ${status}`);

        if (status !== "COMPLETED") {
            return NextResponse.json({ message: "Processing..." }, { status: 202 });
        }

        const generatedVideoUrl = data?.output?.video_url;
        if (!generatedVideoUrl) {
            console.error("❌ No generated video URL found in webhook:", body);
            return NextResponse.json({ error: "No video URL found" }, { status: 400 });
        }

        console.log("✅ Video transformation completed:", generatedVideoUrl);

        return NextResponse.json({ message: "Video saved", generatedVideoUrl }, { status: 200 });

    } catch (error) {
        console.error("❌ Webhook error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
