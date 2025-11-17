import { useGroups as useGroupsContext } from '@/context/GroupContext';

export const useGroups = () => {
  return useGroupsContext();
};

