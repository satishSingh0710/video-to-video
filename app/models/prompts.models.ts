import mongoose from "mongoose";

const promptSchema = new mongoose.Schema({
    userId: {
        type: String, 
        required: true, 
        unique: false
    }, 
    prompt: {
        type: String, 
        required: true, 
        unique: false
    },
    referenceVideoUrl: {
        type: String, 
        required: true, 
        unique: true, 
    }, 
    generatedUrl: {
        type: String, 
        required: false, 
        unique: false,
    }, 
    requestId: {
        type: String, 
        required: false
    }, 
    status: {
        type: String,
        enum: ["processing", "completed", "failed"],
        required: true,
        default: "processing", 
    }
}, {timestamps: true});

const Prompt = mongoose.models.prompts || mongoose.model("prompts", promptSchema);

export default Prompt;