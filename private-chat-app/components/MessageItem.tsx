'use client';

interface MessageItemProps {
  anonId: string;
  text: string;
  timestamp: string;
  isOwn?: boolean;
  groupId: string;
}

import axiosClient from '@/lib/axiosClient';

export default function MessageItem({ anonId, text, timestamp, isOwn, groupId }: MessageItemProps) {
  const date = new Date(timestamp);
  const timeString = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const handleReport = async () => {
    try {
      await axiosClient.post('/users/report', { groupId, anonId });
    } catch {}
  };

  const handleBlock = async () => {
    try {
      await axiosClient.post('/users/block', { groupId, anonId });
    } catch {}
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
          isOwn
            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-none'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
        }`}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold ${isOwn ? 'text-indigo-100' : 'text-indigo-600 dark:text-indigo-400'}`}>
            {anonId}
          </span>
          <span className={`text-xs ${isOwn ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'}`}>
            {timeString}
          </span>
        </div>
        <p className="text-sm break-words">{text}</p>
        {!isOwn && (
          <div className="mt-2 flex gap-2">
            <button onClick={handleReport} className={`text-xs ${isOwn ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'} hover:underline`}>
              Report
            </button>
            <span className={`${isOwn ? 'text-indigo-100' : 'text-gray-300 dark:text-gray-600'}`}>•</span>
            <button onClick={handleBlock} className={`text-xs ${isOwn ? 'text-indigo-100' : 'text-gray-500 dark:text-gray-400'} hover:underline`}>
              Block
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

