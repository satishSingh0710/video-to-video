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

function checkCloudinaryCredentials() {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        throw new Error("Cloudinary credentials not found");
    }
}


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
        /* checking cloudinary credentials 
        -> getting the form data -
        > uploading the reference video to cloudinary 
         -> creating a new prompt*/

        checkCloudinaryCredentials();
        const formData = await request?.formData();
        const referenceVideoUrl = formData.get('referenceVideoUrl') as string
        const prompt = formData.get('prompt');
        const referenceVideoCloudinary = await cloudinary.uploader.upload(referenceVideoUrl, { resource_type: 'video' });

        // creating a collection in the database.
        const newPrompt = await Prompt.create({
            userId,
            prompt,
            referenceVideoUrl: referenceVideoCloudinary.secure_url,
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