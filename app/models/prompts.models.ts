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
    uploadedUrl: {
        type: String, 
        required: true, 
        unique: true, 
    }, 
    generatedUrl: {
        type: String, 
        required: false, 
        unique: true,
    }, 
}, {timestamps: true});

const Prompt = mongoose.models.prompts || mongoose.model("prompts", promptSchema);

export default Prompt;