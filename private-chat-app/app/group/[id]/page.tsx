'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import ChatBox from '@/components/ChatBox';
import axiosClient from '@/lib/axiosClient';

export default function GroupChatPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { currentGroup, currentAnonId, setCurrentGroup, setCurrentAnonId } = useGroups();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const fetchGroupData = async () => {
      try {
        setLoading(true);
        // Fetch group members to verify membership and get anonId
        const response = await axiosClient.get(`/groups/${groupId}`);
        const { members, currentUserAnonId } = response.data.data;
        
        // Fetch group details
        const groupResponse = await axiosClient.get(`/groups/${groupId}`);
        setCurrentGroup(groupResponse.data.data);
        setCurrentAnonId(currentUserAnonId);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('You are not a member of this group. Please join first.');
        } else if (err.response?.status === 404) {
          setError('Group not found.');
        } else {
          setError('Failed to load group.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (groupId && user) {
      fetchGroupData();
    }
  }, [groupId, user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => router.push('/groups')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {currentGroup?.name || 'Group Chat'}
            </h1>
            {currentAnonId && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You are: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{currentAnonId}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => router.push('/groups')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Back to Groups
          </button>
        </div>
      </div>

      <div className="flex-1 container mx-auto max-w-4xl my-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg h-[calc(100vh-200px)] overflow-hidden">
          <ChatBox groupId={groupId} />
        </div>
      </div>
    </div>
  );
}

