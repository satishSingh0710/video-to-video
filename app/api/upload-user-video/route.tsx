import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Prompt from '@/app/models/prompts.models';
import { auth } from '@clerk/nextjs/server';
import { uploadVideoToCloudinary } from '@/utils/cloudinaryUpload';

 // Connect to the database



export async function POST(request: NextRequest) {
    console.log("You are here for now");
    if (request.method !== 'POST') {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized: can't upload the video, login first" }, { status: 401 });
    }

    try {
        await dbConnect(); // Connect to the database
        const formData = await request?.formData();
        const referenceVideoUrl = formData.get('referenceVideoUrl') as string
        const prompt = formData.get('prompt');
        const cloudinaryUploadUrl = await uploadVideoToCloudinary(referenceVideoUrl);

        // creating a collection in the database.
        const newPrompt = await Prompt.create({
            userId,
            prompt,
            referenceVideoUrl: cloudinaryUploadUrl,
        });

        if (!newPrompt) {
            console.log("Checking if code was here"); 
            return NextResponse.json({ error: "Failed to upload the video" }, { status: 400 });
        }

        return NextResponse.json({ message: "Video uploaded successfully", prompt: newPrompt }, { status: 200 });
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        } else {
            return NextResponse.json({ error: error }, { status: 400 });
        }
    }

}