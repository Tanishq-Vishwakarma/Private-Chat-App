'use client';

import { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import InputBox from './InputBox';
import { useChat } from '@/hooks/useChat';
import { useGroups } from '@/hooks/useGroups';

interface ChatBoxProps {
  groupId: string;
}

export default function ChatBox({ groupId }: ChatBoxProps) {
  const { messages, loading, sendMessage } = useChat(groupId);
  const { currentAnonId } = useGroups();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message._id}
              anonId={message.anonId}
              text={message.text}
              timestamp={message.timestamp}
              isOwn={message.anonId === currentAnonId}
              groupId={groupId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <InputBox onSendMessage={sendMessage} disabled={loading} />
    </div>
  );
}

