import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { Group } from "../../models/group.model.js";
import { AnonymousMember } from "../../models/anonymousMember.model.js";
import { generateGroupCode } from "../../utils/generateCode.js";
import { generateAnonId } from "../../utils/generateAnonId.js";
import mongoose from "mongoose";

const createGroup = asyncHandler(async (req, res) => {
    const { name } = req.body;

    if (!name) {
        throw new ApiError(400, "Group name is required");
    }

    let code;
    let isUnique = false;
    
    // Generate unique code
    while (!isUnique) {
        code = generateGroupCode();
        const existingGroup = await Group.findOne({ code });
        if (!existingGroup) {
            isUnique = true;
        }
    }

    const group = await Group.create({
        name,
        code,
        createdBy: req.user._id
    });

    const createdGroup = await Group.findById(group._id).populate("createdBy", "name email");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                createdGroup,
                "Group created successfully"
            )
        );
});

const getAllGroups = asyncHandler(async (req, res) => {
    const groups = await Group.find()
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                groups,
                "Groups fetched successfully"
            )
        );
});

const joinGroup = asyncHandler(async (req, res) => {
    const { code } = req.params;
    const userId = req.user._id;

    if (!code) {
        throw new ApiError(400, "Group code is required");
    }

    const group = await Group.findOne({ code: code.toUpperCase() });

    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    // Check if user is already a member
    const existingMember = await AnonymousMember.findOne({
        groupId: group._id,
        userId: userId
    });

    if (existingMember) {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        group: group,
                        anonId: existingMember.anonId
                    },
                    "Already a member of this group"
                )
            );
    }

    // Count existing members to generate anonId
    const memberCount = await AnonymousMember.countDocuments({ groupId: group._id });
    const anonId = generateAnonId(memberCount);

    // Create anonymous member
    const anonymousMember = await AnonymousMember.create({
        groupId: group._id,
        userId: userId,
        anonId: anonId
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    group: group,
                    anonId: anonymousMember.anonId
                },
                "Joined group successfully"
            )
        );
});

const getGroupMembers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid group ID");
    }

    // Check if user is a member of the group
    const userMember = await AnonymousMember.findOne({
        groupId: id,
        userId: userId
    });

    if (!userMember) {
        throw new ApiError(403, "You are not a member of this group");
    }

    // Get all anonymous members (only anonId, no user details)
    const members = await AnonymousMember.find({ groupId: id })
        .select("anonId createdAt")
        .sort({ createdAt: 1 });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    members: members,
                    currentUserAnonId: userMember.anonId
                },
                "Group members fetched successfully"
            )
        );
});

const getUserGroups = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const memberships = await AnonymousMember.find({ userId })
        .select("groupId anonId createdAt")
        .sort({ createdAt: -1 });

    const groupIds = memberships.map((m) => m.groupId);
    const groups = await Group.find({ _id: { $in: groupIds } })
        .populate("createdBy", "name email");

    const map = new Map(groups.map((g) => [String(g._id), g]));
    const result = memberships
        .map((m) => ({ group: map.get(String(m.groupId)), anonId: m.anonId }))
        .filter((r) => r.group);

    return res
        .status(200)
        .json(
            new ApiResponse(200, result, "User groups fetched successfully")
        );
});

export { createGroup, getAllGroups, joinGroup, getGroupMembers, getUserGroups };

