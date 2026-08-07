import { Link } from 'react-router';
import { ChatIcon } from '@/components/ui/icons';
import { useI18n } from '@/i18n/i18n-provider';
import { cn } from '@/lib/cn';
import { useUnreadTotal } from '../hooks/use-chat';

/** Inbox link with a live unread count, polled on a slow interval. */
export function MessagesNavLink({ className }: { className?: string }) {
  const { t, plural } = useI18n();
  const { data } = useUnreadTotal();
  const unread = data?.unreadCount ?? 0;

  return (
    <Link
      to="/messages"
      aria-label={unread > 0 ? `${t('nav.messages')} — ${plural('chat.unread', unread)}` : t('nav.messages')}
      className={cn(
        'relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-sand-300 dark:hover:bg-ink-800 dark:hover:text-sand-50',
        className,
      )}
    >
      <ChatIcon size={18} />
      <span className="hidden lg:inline">{t('nav.messages')}</span>

      {unread > 0 ? (
        <span
          aria-hidden="true"
          className="animate-pop absolute -right-0.5 -top-0.5 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-bold text-white"
        >
          {unread > 9 ? '9+' : unread}
        </span>
      ) : null}
    </Link>
  );
}
