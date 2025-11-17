import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    anonId: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
  timestamps: true
});

// Index for faster queries
messageSchema.index({ groupId: 1, timestamp: -1 });
messageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 1209600 });

export const Message = mongoose.model("Message", messageSchema);

