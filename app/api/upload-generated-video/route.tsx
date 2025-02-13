import { NextResponse, NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import dbConnect from '@/lib/dbConnect';
import Prompt from '@/app/models/prompts.models';
import { auth } from '@clerk/nextjs/server';

dbConnect(); // Connect to the database

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

function checkCloudinaryCredentials(){
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary credentials not found");
    }
}


export async function POST(request: NextRequest) {
    if (request.method !== 'POST') {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized: can't upload the video, login first" }, { status: 401 });
    }
    console.log("Welcome to the upload generated video route");
    const body = await request.json();
    const { promptId, generatedUrl } = body;
    console.log("🔹Generated video received:", { promptId, generatedUrl }); 

    try {
        checkCloudinaryCredentials();
        const cloudinaryResponse = await cloudinary.uploader.upload(generatedUrl, { resource_type: 'video' });
        const promptData = await Prompt.findOne({ _id: promptId, userId });

        if (!promptData) {
            return NextResponse.json({ error: "Prompt not found" }, { status: 404 });
        }

        const updatedPrompt = await Prompt.findOneAndUpdate({ _id: promptId, userId }, { generatedUrl: cloudinaryResponse.secure_url }, { new: true });

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
