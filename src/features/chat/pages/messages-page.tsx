import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/ui/container';
import { SpinnerIcon } from '@/components/ui/icons';
import { EmptyInboxIllustration } from '@/components/ui/illustrations';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/cn';
import type { MessageView, ThreadSummary } from '../api/chat.api';
import { MessageComposer } from '../components/message-composer';
import { useMarkRead, useMessages, useSendMessage, useThreads } from '../hooks/use-chat';

export function MessagesPage() {
  const { t } = useI18n();
  const { threadId } = useParams();
  const threads = useThreads();

  if (threads.isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <SpinnerIcon size={20} className="animate-spin text-ink-400" />
      </div>
    );
  }

  const list = threads.data?.threads ?? [];

  return (
    <Container className="py-10 sm:py-14">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-sand-50">
          {t('chat.title')}
        </h1>
        <p className="mt-2 text-ink-600 dark:text-ink-300">{t('chat.subtitle')}</p>
      </header>

      {list.length === 0 ? (
        <EmptyInbox />
      ) : (
        <div className="mt-7 grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
          <ThreadList threads={list} activeId={threadId} />
          <Conversation threads={list} threadId={threadId} />
        </div>
      )}
    </Container>
  );
}

function ThreadList({ threads, activeId }: { threads: ThreadSummary[]; activeId?: string }) {
  const { t, plural, formatDate } = useI18n();

  return (
    <nav
      aria-label={t('chat.threads')}
      className="overflow-hidden rounded-4xl border border-sand-200 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900"
    >
      <ul>
        {threads.map((thread) => {
          const isActive = thread.id === activeId;

          return (
            <li key={thread.id} className="border-b border-sand-200 last:border-b-0 dark:border-ink-800">
              <Link
                to={`/messages/${thread.id}`}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'block px-4 py-3.5 transition-colors',
                  isActive ? 'bg-brand-50 dark:bg-ink-800' : 'hover:bg-sand-100 dark:hover:bg-ink-800/60',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-ink-900 dark:text-sand-50">
                    {thread.other.displayName}
                  </span>
                  {thread.unreadCount > 0 ? (
                    <Badge tone="brand">{plural('chat.unread', thread.unreadCount)}</Badge>
                  ) : null}
                </div>

                <p className="mt-0.5 truncate text-xs text-ink-500 dark:text-ink-400">
                  {t('chat.about', { handle: thread.profile.handle })}
                </p>

                {thread.lastMessagePreview ? (
                  <p className="mt-1.5 truncate text-sm text-ink-600 dark:text-ink-300">
                    {thread.lastMessagePreview}
                  </p>
                ) : null}

                {thread.lastMessageAt ? (
                  <p className="mt-1 text-xs text-ink-400 dark:text-ink-500">
                    {formatDate(thread.lastMessageAt, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Conversation({ threads, threadId }: { threads: ThreadSummary[]; threadId?: string }) {
  const { t } = useI18n();
  const messages = useMessages(threadId);
  const send = useSendMessage(threadId);
  const markRead = useMarkRead();

  const thread = threads.find((entry) => entry.id === threadId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages.data?.messages.at(-1)?.id;

  // Follow the conversation as it grows, including on poll-delivered replies.
  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [lastMessageId]);

  // Opening a thread, or receiving into the open one, clears its unread count.
  useEffect(() => {
    if (threadId && thread && thread.unreadCount > 0) markRead(threadId);
  }, [threadId, thread, markRead]);

  if (!threadId || !thread) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-4xl border border-dashed border-sand-300 p-8 text-center dark:border-ink-700">
        <p className="text-sm text-ink-500 dark:text-ink-400">{t('chat.selectThread')}</p>
      </div>
    );
  }

  return (
    <section
      aria-label={thread.other.displayName}
      className="flex h-[34rem] flex-col overflow-hidden rounded-4xl border border-sand-200 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900"
    >
      <header className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-3.5 dark:border-ink-800">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900 dark:text-sand-50">{thread.other.displayName}</p>
          <Link
            to={`/@${thread.profile.handle}`}
            className="truncate text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            {t('chat.about', { handle: thread.profile.handle })}
          </Link>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.isPending ? (
          <div className="flex h-full items-center justify-center">
            <SpinnerIcon size={18} className="animate-spin text-ink-400" />
          </div>
        ) : (
          messages.data?.messages.map((message) => <Bubble key={message.id} message={message} />)
        )}
      </div>

      <MessageComposer
        autoFocus
        isSending={send.isPending}
        onSend={async (body) => {
          await send.mutateAsync(body);
        }}
      />
    </section>
  );
}

function Bubble({ message }: { message: MessageView }) {
  const { formatDate } = useI18n();

  return (
    <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[80%]', message.isMine ? 'text-right' : 'text-left')}>
        <div
          className={cn(
            'animate-pop inline-block whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-left text-[0.9375rem] leading-relaxed',
            message.isMine
              ? 'bg-brand-500 text-white'
              : 'bg-sand-200 text-ink-900 dark:bg-ink-800 dark:text-sand-100',
          )}
        >
          {message.body}
        </div>
        <p className="mt-1 px-1 text-xs text-ink-400 dark:text-ink-500">
          {formatDate(message.createdAt, { timeStyle: 'short' })}
        </p>
      </div>
    </div>
  );
}

function EmptyInbox() {
  const { t } = useI18n();

  return (
    <div className="animate-fade-up flex flex-col items-center py-16 text-center">
      <EmptyInboxIllustration label={t('chat.empty.illustrationAlt')} className="w-60" />
      <h2 className="mt-6 text-xl font-bold text-ink-900 dark:text-sand-50">{t('chat.empty.title')}</h2>
      <p className="mt-2 max-w-md text-ink-600 dark:text-ink-300">{t('chat.empty.body')}</p>
    </div>
  );
}
