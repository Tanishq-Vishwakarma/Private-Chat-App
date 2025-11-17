import mongoose from "mongoose";

const anonymousMemberSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    anonId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Ensure one user can only have one anonymous ID per group
anonymousMemberSchema.index({ groupId: 1, userId: 1 }, { unique: true });

export const AnonymousMember = mongoose.model("AnonymousMember", anonymousMemberSchema);

