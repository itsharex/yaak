import { invoke } from '@tauri-apps/api';
import { convertDates, Workspace } from '../lib/models';
import { useQuery } from '@tanstack/react-query';

export function useWorkspaces() {
  return useQuery(['workspaces'], async () => {
    const workspaces = (await invoke('workspaces')) as Workspace[];
    return workspaces.map(convertDates);
  });
}