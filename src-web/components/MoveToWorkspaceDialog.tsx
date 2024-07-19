import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { grpcRequestsQueryKey } from '../hooks/useGrpcRequests';
import { httpRequestsQueryKey } from '../hooks/useHttpRequests';
import { useUpdateAnyGrpcRequest } from '../hooks/useUpdateAnyGrpcRequest';
import { useUpdateAnyHttpRequest } from '../hooks/useUpdateAnyHttpRequest';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import type { GrpcRequest, HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import { InlineCode } from './core/InlineCode';
import { Select } from './core/Select';
import { VStack } from './core/Stacks';
import { useToast } from './ToastContext';

interface Props {
  activeWorkspaceId: string;
  request: HttpRequest | GrpcRequest;
  onDone: () => void;
}

export function MoveToWorkspaceDialog({ onDone, request, activeWorkspaceId }: Props) {
  const workspaces = useWorkspaces();
  const queryClient = useQueryClient();
  const updateHttpRequest = useUpdateAnyHttpRequest();
  const updateGrpcRequest = useUpdateAnyGrpcRequest();
  const toast = useToast();
  const routes = useAppRoutes();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(activeWorkspaceId);

  return (
    <VStack space={4} className="mb-4">
      <Select
        label="Workspace"
        name="workspace"
        value={selectedWorkspaceId}
        onChange={setSelectedWorkspaceId}
        options={workspaces.map((w) => ({
          label: w.id === activeWorkspaceId ? `${w.name} (current)` : w.name,
          value: w.id,
        }))}
      />
      <Button
        color="primary"
        disabled={selectedWorkspaceId === activeWorkspaceId}
        onClick={async () => {
          const args = {
            id: request.id,
            update: { workspaceId: selectedWorkspaceId, folderId: null },
          };

          if (request.model === 'http_request') {
            await updateHttpRequest.mutateAsync(args);
            queryClient.invalidateQueries({
              queryKey: httpRequestsQueryKey({ workspaceId: activeWorkspaceId }),
            });
          } else if (request.model === 'grpc_request') {
            await updateGrpcRequest.mutateAsync(args);
            queryClient.invalidateQueries({
              queryKey: grpcRequestsQueryKey({ workspaceId: activeWorkspaceId }),
            });
          }

          // Hide after a moment, to give time for request to disappear
          setTimeout(onDone, 100);
          toast.show({
            id: 'workspace-moved',
            message: (
              <>
                <InlineCode>{fallbackRequestName(request)}</InlineCode> moved to{' '}
                <InlineCode>
                  {workspaces.find((w) => w.id === selectedWorkspaceId)?.name ?? 'unknown'}
                </InlineCode>
              </>
            ),
            action: (
              <Button
                size="xs"
                color="secondary"
                className="mr-auto min-w-[5rem]"
                onClick={() => {
                  toast.hide('workspace-moved');
                  routes.navigate('workspace', { workspaceId: selectedWorkspaceId });
                }}
              >
                Switch to Workspace
              </Button>
            ),
          });
        }}
      >
        Change Workspace
      </Button>
    </VStack>
  );
}