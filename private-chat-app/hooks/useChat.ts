'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import axiosClient from '@/lib/axiosClient';

interface Message {
  _id: string;
  groupId: string;
  anonId: string;
  text: string;
  timestamp: string;
}

export const useChat = (groupId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const token = sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
    if (!token) return;

    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Join group
    newSocket.emit('join-group', groupId);

    // Listen for new messages
    newSocket.on('new-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for join confirmation
    newSocket.on('joined-group', (data: { groupId: string; anonId: string }) => {
      console.log('Joined group:', data);
    });

    // Error handling
    newSocket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
    });

    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axiosClient.get(`/groups/${groupId}/messages`);
        setMessages(response.data.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    return () => {
      newSocket.emit('leave-group', groupId);
      newSocket.disconnect();
    };
  }, [groupId]);

  const sendMessage = (text: string) => {
    if (!socket || !groupId || !text.trim()) return;

    socket.emit('send-message', {
      groupId,
      text: text.trim(),
    });
  };

  return {
    messages,
    loading,
    sendMessage,
  };
};

