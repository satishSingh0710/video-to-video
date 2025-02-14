import Prompt from "@/app/models/prompts.models";
import dbConnect from "@/lib/dbConnect";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    console.log("🔹 Fetching prompts...");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ prompts: [] }, { status: 401 });
    }

    await dbConnect();

    const prompts = await Prompt.find({ userId }).sort({ updatedAt: -1 });


    return NextResponse.json({ prompts }, { status: 200 });
}