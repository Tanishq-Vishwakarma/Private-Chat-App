import dotenv from "dotenv";
dotenv.config({path: "./.env"});
import { createServer } from "http";
import { Server } from "socket.io";
import connectDB from "./db/index.js";
import {app} from "./app.js";
import { AnonymousMember } from "./models/anonymousMember.model.js";
import { Message } from "./models/message.model.js";
import jwt from "jsonwebtoken";
import { Block } from "./models/block.model.js";
import { User } from "./models/user.model.js";

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true
    }
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id);
        if (!user || user.isBanned) {
            return next(new Error("Authentication error"));
        }
        socket.userId = decoded._id;
        next();
    } catch (error) {
        next(new Error("Authentication error"));
    }
});

// Socket.io connection handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join group room
    socket.on("join-group", async (groupId) => {
        try {
            const member = await AnonymousMember.findOne({
                groupId: groupId,
                userId: socket.userId
            });
            if (member) {
                socket.join(`group-${groupId}`);
                socket.emit("joined-group", { groupId, anonId: member.anonId });
            }
        } catch (error) {
            socket.emit("error", { message: "Failed to join group" });
        }
    });

    // Handle new message
    socket.on("send-message", async (data) => {
        try {
            const { groupId, text } = data;
            const member = await AnonymousMember.findOne({
                groupId: groupId,
                userId: socket.userId
            });

            if (!member) {
                socket.emit("error", { message: "You are not a member of this group" });
                return;
            }

            const message = await Message.create({
                groupId: groupId,
                anonId: member.anonId,
                text: text.trim(),
                timestamp: new Date()
            });

            const messageData = {
                _id: message._id,
                groupId: message.groupId,
                anonId: message.anonId,
                text: message.text,
                timestamp: message.timestamp
            };

            // Broadcast selectively (skip recipients who blocked the sender)
            const roomName = `group-${groupId}`;
            const room = io.sockets.adapter.rooms.get(roomName);
            if (room) {
                // Find sender's actual userId via anon membership
                const member = await AnonymousMember.findOne({ groupId: groupId, anonId: message.anonId });
                const senderUserId = member?.userId?.toString();
                for (const socketId of room) {
                    const recipientSocket = io.sockets.sockets.get(socketId);
                    const recipientUserId = recipientSocket?.userId?.toString();
                    if (!senderUserId || !recipientUserId) {
                        recipientSocket?.emit("new-message", messageData);
                        continue;
                    }
                    const blocked = await Block.findOne({ blockerId: recipientUserId, blockedUserId: senderUserId });
                    if (!blocked) {
                        recipientSocket?.emit("new-message", messageData);
                    }
                }
            }
        } catch (error) {
            socket.emit("error", { message: "Failed to send message" });
        }
    });

    // Leave group room
    socket.on("leave-group", (groupId) => {
        socket.leave(`group-${groupId}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.userId);
    });
});

connectDB()
.then(() => {
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
.catch((error) => {
    console.log("MongoDB connection failed !! ", error);
})