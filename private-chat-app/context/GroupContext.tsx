'use client';

import React, { createContext, useContext, useState } from 'react';
import axiosClient from '@/lib/axiosClient';

interface Group {
  _id: string;
  name: string;
  code: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

interface GroupContextType {
  groups: Group[];
  currentGroup: Group | null;
  currentAnonId: string | null;
  loading: boolean;
  fetchGroups: () => Promise<void>;
  fetchMyGroups: () => Promise<void>;
  createGroup: (name: string) => Promise<Group>;
  joinGroup: (code: string) => Promise<{ group: Group; anonId: string }>;
  setCurrentGroup: (group: Group | null) => void;
  setCurrentAnonId: (anonId: string | null) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentAnonId, setCurrentAnonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/groups');
      setGroups(response.data.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/groups/my');
      const items = response.data.data;
      const myGroups: Group[] = items.map((it: { group: Group; anonId: string }) => it.group);
      setGroups(myGroups);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async (name: string): Promise<Group> => {
    try {
      setLoading(true);
      const response = await axiosClient.post('/groups/create', { name });
      const newGroup = response.data.data;
      setGroups([newGroup, ...groups]);
      return newGroup;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async (code: string): Promise<{ group: Group; anonId: string }> => {
    try {
      setLoading(true);
      const response = await axiosClient.post(`/groups/join/${code}`);
      const { group, anonId } = response.data.data;
      setCurrentGroup(group);
      setCurrentAnonId(anonId);
      setGroups((prev) => {
        const exists = prev.find((g) => g._id === group._id);
        return exists ? prev : [group, ...prev];
      });
      return { group, anonId };
    } catch (error) {
      console.error('Error joining group:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GroupContext.Provider
      value={{
        groups,
        currentGroup,
        currentAnonId,
        loading,
        fetchGroups,
        fetchMyGroups,
        createGroup,
        joinGroup,
        setCurrentGroup,
        setCurrentAnonId,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
};

