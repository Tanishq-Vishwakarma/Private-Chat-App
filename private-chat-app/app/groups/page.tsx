'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import axiosClient from '@/lib/axiosClient';

export default function GroupsPage() {
  const { user, loading: authLoading } = useAuth();
  const { groups, loading, fetchGroups, fetchMyGroups, createGroup, joinGroup } = useGroups();
  const [groupName, setGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user?.role === 'admin') {
      fetchGroups();
    } else if (user?.role === 'user') {
      fetchMyGroups();
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role !== 'admin') return;

    setError('');
    setSuccess('');
    try {
      const newGroup = await createGroup(groupName);
      setSuccess(`Group "${newGroup.name}" created with code: ${newGroup.code}`);
      setGroupName('');
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create group');
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { group } = await joinGroup(joinCode.toUpperCase());
      setSuccess(`Joined group "${group.name}"!`);
      setJoinCode('');
      setShowJoinForm(false);
      router.push(`/group/${group._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join group');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {user.role === 'admin' ? 'Groups Dashboard' : 'Join a Group'}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-400 text-green-700 dark:text-green-400 rounded-lg">
            {success}
          </div>
        )}

        {/* Join Group Form (for all users) */}
        <div className="mb-8">
          <button
            onClick={() => {
              setShowJoinForm(!showJoinForm);
              setShowCreateForm(false);
            }}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition mb-4"
          >
            {showJoinForm ? 'Cancel' : 'Join Group'}
          </button>

          {showJoinForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">Join a Group</h2>
              <form onSubmit={handleJoinGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Group Code
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code"
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition"
                >
                  Join
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Create Group Form (admin only) */}
        {user.role === 'admin' && (
          <div className="mb-8">
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setShowJoinForm(false);
              }}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition mb-4"
            >
              {showCreateForm ? 'Cancel' : 'Create New Group'}
            </button>

            {showCreateForm && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Create New Group</h2>
                <form onSubmit={handleCreateGroup}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="Enter group name"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Group'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Groups List */}
        {user.role === 'admin' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">All Groups</h2>
            {loading ? (
              <div className="text-gray-500">Loading groups...</div>
            ) : groups.length === 0 ? (
              <div className="text-gray-500">No groups yet. Create one to get started!</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <div
                    key={group._id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/group/${group._id}`)}
                  >
                    <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Code: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{group.code}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Created by {group.createdBy.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'user' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Your Groups</h2>
            {loading ? (
              <div className="text-gray-500">Loading groups...</div>
            ) : groups.length === 0 ? (
              <div className="text-gray-500">You haven't joined any groups yet.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                  <div
                    key={group._id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition cursor-pointer"
                    onClick={() => router.push(`/group/${group._id}`)}
                  >
                    <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Code: <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{group.code}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

