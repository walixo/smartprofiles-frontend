import { apiGet, apiPost } from '@/lib/api-client';

export interface ThreadSummary {
  id: string;
  profile: { handle: string; displayName: string; avatarUrl?: string };
  other: { id: string; displayName: string };
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  createdAt: string;
}

export interface MessageView {
  id: string;
  body: string;
  senderId: string;
  /** Supplied by the API so the client never compares ids to pick a side. */
  isMine: boolean;
  createdAt: string;
}

export interface MessagesPage {
  messages: MessageView[];
  meta: { page: number; limit: number; total: number; totalPages: number; hasMore: boolean };
}

export function fetchThreads(): Promise<{ threads: ThreadSummary[] }> {
  return apiGet<{ threads: ThreadSummary[] }>('/chat/threads');
}

export function fetchUnreadTotal(): Promise<{ unreadCount: number }> {
  return apiGet<{ unreadCount: number }>('/chat/unread');
}

export function fetchMessages(threadId: string): Promise<MessagesPage> {
  return apiGet<MessagesPage>(`/chat/threads/${threadId}/messages`, { limit: 60 });
}

export function startThread(handle: string, body: string): Promise<{ threadId: string }> {
  return apiPost<{ threadId: string }>('/chat/threads', { handle, body });
}

export function postMessage(threadId: string, body: string): Promise<{ message: MessageView }> {
  return apiPost<{ message: MessageView }>(`/chat/threads/${threadId}/messages`, { body });
}

export function markThreadRead(threadId: string): Promise<{ unreadCount: number }> {
  return apiPost<{ unreadCount: number }>(`/chat/threads/${threadId}/read`);
}
