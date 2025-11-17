import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Message } from "../../models/message.model.js";
import { AnonymousMember } from "../../models/anonymousMember.model.js";
import { Group } from "../../models/group.model.js";
import mongoose from "mongoose";

const getMessages = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        throw new ApiError(400, "Invalid group ID");
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Check if user is a member
    const member = await AnonymousMember.findOne({
        groupId: groupId,
        userId: userId
    });

    if (!member) {
        throw new ApiError(403, "You are not a member of this group");
    }

    // Get messages
    const messages = await Message.find({ groupId: groupId })
        .sort({ timestamp: 1 })
        .select("anonId text timestamp");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                messages,
                "Messages fetched successfully"
            )
        );
});

const sendMessage = asyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim() === "") {
        throw new ApiError(400, "Message text is required");
    }

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
        throw new ApiError(400, "Invalid group ID");
    }

    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Check if user is a member and get their anonId
    const member = await AnonymousMember.findOne({
        groupId: groupId,
        userId: userId
    });

    if (!member) {
        throw new ApiError(403, "You are not a member of this group");
    }

    // Create message
    const message = await Message.create({
        groupId: groupId,
        anonId: member.anonId,
        text: text.trim(),
        timestamp: new Date()
    });

    const createdMessage = await Message.findById(message._id)
        .select("anonId text timestamp");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdMessage,
                "Message sent successfully"
            )
        );
});

export { getMessages, sendMessage };

