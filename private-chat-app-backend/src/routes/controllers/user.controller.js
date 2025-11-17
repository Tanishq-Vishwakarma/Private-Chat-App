import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { User } from "../../models/user.model.js";
import { AnonymousMember } from "../../models/anonymousMember.model.js";
import { Block } from "../../models/block.model.js";
import mongoose from "mongoose";

const reportByAnon = asyncHandler(async (req, res) => {
  const { groupId, anonId } = req.body;
  if (!groupId || !anonId) {
    throw new ApiError(400, "groupId and anonId are required");
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const member = await AnonymousMember.findOne({ groupId, anonId });
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  const user = await User.findById(member.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.reportCount = (user.reportCount || 0) + 1;
  if (user.reportCount >= 3) {
    user.isBanned = true;
  }
  await user.save();

  return res.status(200).json(new ApiResponse(200, { reportCount: user.reportCount, isBanned: user.isBanned }, "User reported"));
});

const blockByAnon = asyncHandler(async (req, res) => {
  const { groupId, anonId } = req.body;
  const blockerId = req.user._id;
  if (!groupId || !anonId) {
    throw new ApiError(400, "groupId and anonId are required");
  }
  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const member = await AnonymousMember.findOne({ groupId, anonId });
  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  if (String(member.userId) === String(blockerId)) {
    throw new ApiError(400, "Cannot block yourself");
  }

  await Block.updateOne(
    { blockerId, blockedUserId: member.userId },
    { $setOnInsert: { blockerId, blockedUserId: member.userId } },
    { upsert: true }
  );

  return res.status(200).json(new ApiResponse(200, { blockedUserId: member.userId }, "User blocked"));
});

export { reportByAnon, blockByAnon };