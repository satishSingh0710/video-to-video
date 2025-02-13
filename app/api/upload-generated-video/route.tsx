import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Prompt from '@/app/models/prompts.models';
import { auth } from '@clerk/nextjs/server';
import { uploadVideoToCloudinary } from '@/utils/cloudinaryUpload';


export async function POST(request: NextRequest) {
    if (request.method !== 'POST') {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized: can't upload the video, login first" }, { status: 401 });
    }
    
    const body = await request.json();
    const { request_id, generatedUrl } = body;
    console.log("🔹Generated video received:", { request_id, generatedUrl });

    try {
        await dbConnect(); // Connect to the database
        const cloudinaryUploadUrl = await uploadVideoToCloudinary(generatedUrl);
        const promptData = await Prompt.findOne({ request_id: request_id, userId });
        if (!promptData) {
            return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
        }

        const updatedPrompt = await Prompt.findOneAndUpdate({ request_id: request_id, userId }, { generatedUrl: cloudinaryUploadUrl, status: "completed" }, { new: true });

        if (!updatedPrompt) {
            return NextResponse.json({ error: "Failed to upload the video" }, { status: 400 });
        }
        return NextResponse.json({ message: "Video uploaded successfully", prompt: updatedPrompt }, { status: 200 });

    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        } else {
            return NextResponse.json({ error: error }, { status: 400 });
        }
    }
}
