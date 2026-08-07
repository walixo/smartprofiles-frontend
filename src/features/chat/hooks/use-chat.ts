import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import {
  fetchMessages,
  fetchThreads,
  fetchUnreadTotal,
  markThreadRead,
  postMessage,
  startThread,
  type MessagesPage,
  type ThreadSummary,
} from '../api/chat.api';

/**
 * Polling intervals.
 *
 * The stack has no WebSocket layer, so freshness comes from polling. The open
 * conversation is polled often because that is where a reply is being waited
 * for; the inbox and the header badge far less, because they only need to
 * notice a new thread eventually.
 *
 * Intervals deliberately do NOT run while the tab is hidden — that is
 * TanStack Query's default and the right one, since a forgotten tab should not
 * poll all day. The cost is that returning to the tab would otherwise wait out
 * a full interval, so these queries opt back into refetch-on-focus (the app
 * default is off) and refresh the moment the user comes back.
 */
const ACTIVE_THREAD_MS = 5_000;
const THREAD_LIST_MS = 20_000;
const UNREAD_BADGE_MS = 30_000;

export const threadsKey = ['chat', 'threads'] as const;
export const unreadKey = ['chat', 'unread'] as const;
export const messagesKey = (threadId: string) => ['chat', 'messages', threadId] as const;

export function useThreads() {
  const { isAuthenticated } = useAuth();

  return useQuery<{ threads: ThreadSummary[] }>({
    queryKey: threadsKey,
    queryFn: fetchThreads,
    enabled: isAuthenticated,
    refetchInterval: THREAD_LIST_MS,
    refetchOnWindowFocus: true,
    staleTime: 5_000,
  });
}

export function useUnreadTotal() {
  const { isAuthenticated } = useAuth();

  return useQuery<{ unreadCount: number }>({
    queryKey: unreadKey,
    queryFn: fetchUnreadTotal,
    enabled: isAuthenticated,
    refetchInterval: UNREAD_BADGE_MS,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

export function useMessages(threadId: string | undefined) {
  return useQuery<MessagesPage>({
    queryKey: messagesKey(threadId ?? 'none'),
    queryFn: () => fetchMessages(threadId as string),
    enabled: Boolean(threadId),
    refetchInterval: ACTIVE_THREAD_MS,
    refetchOnWindowFocus: true,
    staleTime: 1_000,
  });
}

export function useSendMessage(threadId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: string) => postMessage(threadId as string, body),
    onSuccess: (result) => {
      // Append immediately rather than waiting for the next poll — a message
      // that takes five seconds to appear feels broken.
      queryClient.setQueryData<MessagesPage>(messagesKey(threadId as string), (current) =>
        current ? { ...current, messages: [...current.messages, result.message] } : current,
      );
      void queryClient.invalidateQueries({ queryKey: threadsKey });
    },
  });
}

export function useStartThread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ handle, body }: { handle: string; body: string }) => startThread(handle, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: threadsKey });
      void queryClient.invalidateQueries({ queryKey: unreadKey });
    },
  });
}

/** Clears the caller's unread count for a thread and refreshes the badge. */
export function useMarkRead() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (threadId: string) => markThreadRead(threadId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: threadsKey });
      void queryClient.invalidateQueries({ queryKey: unreadKey });
    },
  });

  return useCallback(
    (threadId: string) => {
      mutation.mutate(threadId);
    },
    [mutation],
  );
}
