import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { SelectField } from '@/components/ui/form-fields';
import { SearchIcon, SpinnerIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/features/auth/auth-provider';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { isApiRequestError } from '@/lib/api-error';
import { cn } from '@/lib/cn';
import { ROLES, USER_STATUSES, VISIBILITIES, type Role, type UserStatus, type Visibility } from '@/shared/vocabulary';
import type { AdminProfileRow, AdminUserRow } from '../api/admin.api';
import { useAdminProfiles, useAdminStats, useAdminUsers, useModeration } from '../hooks/use-admin';

type Tab = 'overview' | 'users' | 'profiles';
const TABS: Tab[] = ['overview', 'users', 'profiles'];

export function AdminPage() {
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab | null) ?? 'overview';

  return (
    <Container className="py-10 sm:py-14">
      <header className="animate-fade-up">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-paper-50">
          {t('admin.title')}
        </h1>
        <p className="mt-2 text-ink-900 dark:text-paper-200">{t('admin.subtitle')}</p>
      </header>

      <div role="tablist" className="mt-7 flex flex-wrap gap-1.5 border-b-2 edge">
        {TABS.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={tab === name}
            onClick={() => setParams(name === 'overview' ? {} : { tab: name }, { replace: true })}
            className={cn(
              '-mb-px rounded-t-2xl border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors',
              tab === name
                ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-ink-950 hover:text-ink-950 dark:text-paper-300 dark:hover:text-sand-200',
            )}
          >
            {t(`admin.tab.${name}` as TranslationKey)}
          </button>
        ))}
      </div>

      <div className="mt-7">
        {tab === 'overview' ? <Overview /> : tab === 'users' ? <UsersTab /> : <ProfilesTab />}
      </div>
    </Container>
  );
}

/* ------------------------------------------------------------------ */

function Overview() {
  const { t } = useI18n();
  const { data, isPending } = useAdminStats();

  if (isPending) return <Pending />;
  if (!data) return null;

  const groups: Array<{ title: TranslationKey; items: Array<[TranslationKey, number]> }> = [
    {
      title: 'admin.stats.accounts',
      items: [
        ['admin.stats.freelancers', data.users.freelancers],
        ['admin.stats.clients', data.users.clients],
        ['admin.stats.admins', data.users.admins],
        ['admin.stats.suspended', data.users.suspended],
      ],
    },
    {
      title: 'admin.stats.profiles',
      items: [
        ['admin.stats.published', data.profiles.published],
        ['admin.stats.drafts', data.profiles.drafts],
        ['admin.stats.unlisted', data.profiles.unlisted],
      ],
    },
    {
      title: 'admin.stats.messages',
      items: [
        ['admin.stats.works', data.content.works],
        ['admin.stats.threads', data.content.threads],
        ['admin.stats.messages', data.content.messages],
      ],
    },
  ];

  return (
    <div className="grid gap-5 @container md:grid-cols-3">
      {groups.map((group, index) => (
        <section
          key={group.title}
          style={{ animationDelay: `${index * 60}ms` }}
          className="animate-fade-up rounded-4xl border-2 edge bg-white p-6 shadow-soft dark:bg-ink-900"
        >
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-950 dark:text-paper-300">
            {t(group.title)}
          </h2>
          <dl className="mt-4 space-y-3">
            {group.items.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-3">
                <dt className="text-sm text-ink-900 dark:text-paper-200">{t(label)}</dt>
                <dd className="text-2xl font-bold text-ink-900 tabular-nums dark:text-paper-50">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function UsersTab() {
  const { t, formatDate } = useI18n();
  const { user: currentUser } = useAuth();
  const { setStatus } = useModeration();

  const [q, setQ] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const query = useAdminUsers({
    page,
    ...(q ? { q } : {}),
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
  });

  const toggle = async (row: AdminUserRow): Promise<void> => {
    const next: UserStatus = row.status === 'suspended' ? 'active' : 'suspended';
    if (next === 'suspended' && !window.confirm(t('admin.confirmSuspend', { name: row.displayName }))) return;

    setError(null);
    try {
      await setStatus.mutateAsync({ userId: row.id, status: next });
    } catch (caught) {
      setError(isApiRequestError(caught) ? t(`error.${caught.code}` as TranslationKey) : t('error.UNKNOWN_ERROR'));
    }
  };

  return (
    <div className="space-y-5">
      <Filters
        searchLabel={t('admin.search.users')}
        q={q}
        onQ={(value) => {
          setQ(value);
          setPage(1);
        }}
      >
        <SelectField
          id="admin-role"
          label={t('admin.filter.role')}
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role | '');
            setPage(1);
          }}
          options={[
            { value: '', label: t('admin.filter.any') },
            ...ROLES.map((r) => ({ value: r, label: t(`role.${r}` as TranslationKey) })),
          ]}
        />
        <SelectField
          id="admin-status"
          label={t('admin.filter.status')}
          value={status}
          onChange={(e) => {
            setStatusFilter(e.target.value as UserStatus | '');
            setPage(1);
          }}
          options={[
            { value: '', label: t('admin.filter.any') },
            ...USER_STATUSES.map((s) => ({ value: s, label: s === 'active' ? 'Active' : t('admin.stats.suspended') })),
          ]}
        />
      </Filters>

      {error ? <Alert tone="danger">{error}</Alert> : null}

      {query.isPending ? (
        <Pending />
      ) : !query.data || query.data.users.length === 0 ? (
        <Empty />
      ) : (
        <>
          <p className="text-sm text-ink-950 dark:text-paper-300">
            {t('admin.results', { count: query.data.meta.total })}
          </p>

          <TableShell head={[t('admin.table.account'), t('admin.table.role'), t('admin.table.status'), t('admin.table.joined'), '']}>
            {query.data.users.map((row) => (
              <tr key={row.id} className="border-t-2 edge">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar url={row.avatarUrl} name={row.displayName} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900 dark:text-paper-50">
                        {row.displayName}
                      </p>
                      <p className="truncate text-xs text-ink-950 dark:text-paper-300">{row.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="neutral">{t(`role.${row.role}` as TranslationKey)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={row.status === 'suspended' ? 'danger' : 'success'}>
                    {row.status === 'suspended' ? t('admin.stats.suspended') : 'Active'}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-950 dark:text-paper-300">
                  {formatDate(row.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {row.handle ? (
                      <Link
                        to={`/@${row.handle}`}
                        className="rounded-none px-3 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-ink-800"
                      >
                        {t('admin.action.view')}
                      </Link>
                    ) : null}
                    {/* Admins and your own account are not actionable — the API
                        refuses both, so offering the button would only mislead. */}
                    {row.role !== 'admin' && row.id !== currentUser?.id ? (
                      <Button
                        size="sm"
                        variant={row.status === 'suspended' ? 'outline' : 'danger'}
                        isLoading={setStatus.isPending}
                        onClick={() => void toggle(row)}
                      >
                        {row.status === 'suspended' ? t('admin.action.reactivate') : t('admin.action.suspend')}
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </TableShell>

          <Pager meta={query.data.meta} page={page} onPage={setPage} />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ProfilesTab() {
  const { t, formatDate } = useI18n();
  const { setVisibility } = useModeration();

  const [q, setQ] = useState('');
  const [visibility, setVisibilityFilter] = useState<Visibility | ''>('');
  const [page, setPage] = useState(1);

  const query = useAdminProfiles({
    page,
    ...(q ? { q } : {}),
    ...(visibility ? { visibility } : {}),
  });

  const apply = (row: AdminProfileRow, next: Visibility): void => {
    void setVisibility.mutateAsync({ profileId: row.id, visibility: next });
  };

  return (
    <div className="space-y-5">
      <Filters
        searchLabel={t('admin.search.profiles')}
        q={q}
        onQ={(value) => {
          setQ(value);
          setPage(1);
        }}
      >
        <SelectField
          id="admin-visibility"
          label={t('admin.filter.visibility')}
          value={visibility}
          onChange={(e) => {
            setVisibilityFilter(e.target.value as Visibility | '');
            setPage(1);
          }}
          options={[
            { value: '', label: t('admin.filter.any') },
            ...VISIBILITIES.map((v) => ({ value: v, label: t(`visibility.${v}` as TranslationKey) })),
          ]}
        />
      </Filters>

      {query.isPending ? (
        <Pending />
      ) : !query.data || query.data.profiles.length === 0 ? (
        <Empty />
      ) : (
        <>
          <p className="text-sm text-ink-950 dark:text-paper-300">
            {t('admin.results', { count: query.data.meta.total })}
          </p>

          <TableShell
            head={[
              t('admin.table.profile'),
              t('admin.table.status'),
              t('admin.table.views'),
              t('admin.table.works'),
              t('admin.table.updated'),
              '',
            ]}
          >
            {query.data.profiles.map((row) => (
              <tr key={row.id} className="border-t-2 edge">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar url={row.avatarUrl} name={row.displayName} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-900 dark:text-paper-50">
                        @{row.handle}
                      </p>
                      <p className="truncate text-xs text-ink-950 dark:text-paper-300">{row.headline}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone={row.visibility === 'public' ? 'success' : 'neutral'}>
                    {t(`visibility.${row.visibility}` as TranslationKey)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink-900 dark:text-paper-200">{row.viewCount}</td>
                <td className="px-4 py-3 text-sm tabular-nums text-ink-900 dark:text-paper-200">{row.workCount}</td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-950 dark:text-paper-300">
                  {formatDate(row.updatedAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      to={`/@${row.handle}`}
                      className="rounded-none px-3 py-1.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-ink-800"
                    >
                      {t('admin.action.view')}
                    </Link>
                    <Button
                      size="sm"
                      variant={row.visibility === 'public' ? 'danger' : 'outline'}
                      isLoading={setVisibility.isPending}
                      onClick={() => apply(row, row.visibility === 'public' ? 'draft' : 'public')}
                    >
                      {row.visibility === 'public' ? t('admin.action.unpublish') : t('admin.action.publish')}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </TableShell>

          <Pager meta={query.data.meta} page={page} onPage={setPage} />
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Filters({
  searchLabel,
  q,
  onQ,
  children,
}: {
  searchLabel: string;
  q: string;
  onQ: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-4 rounded-4xl border-2 edge bg-white p-5 shadow-soft sm:grid-cols-3 dark:bg-ink-900">
      <div className="sm:col-span-1">
        <TextField
          id="admin-search"
          type="search"
          label={searchLabel}
          value={q}
          onChange={(event) => onQ(event.target.value)}
          trailing={<SearchIcon size={18} className="mr-2 text-ink-700" />}
        />
      </div>
      {children}
    </section>
  );
}

function TableShell({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    // Tables do not reflow; the container scrolls rather than the page.
    <div className="overflow-x-auto rounded-4xl border-2 edge bg-white shadow-soft dark:bg-ink-900">
      <table className="w-full min-w-[46rem] text-left">
        <thead>
          <tr>
            {head.map((label, index) => (
              <th
                key={index}
                scope="col"
                className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-ink-950 dark:text-paper-300"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Avatar({ url, name }: { url?: string; name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();

  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent-400 text-xs font-bold text-white">
      {url ? <img src={url} alt="" className="size-full object-cover" /> : initials}
    </span>
  );
}

function Pager({
  meta,
  page,
  onPage,
}: {
  meta: { totalPages: number; hasMore: boolean };
  page: number;
  onPage: (next: number) => void;
}) {
  const { t } = useI18n();
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        {t('browse.page.previous')}
      </Button>
      <span className="text-sm text-ink-900 dark:text-paper-200">
        {t('browse.page.indicator', { page, total: meta.totalPages })}
      </span>
      <Button variant="outline" size="sm" disabled={!meta.hasMore} onClick={() => onPage(page + 1)}>
        {t('browse.page.next')}
      </Button>
    </div>
  );
}

function Pending() {
  return (
    <div className="flex min-h-48 items-center justify-center">
      <SpinnerIcon size={20} className="animate-spin text-ink-700" />
    </div>
  );
}

function Empty() {
  const { t } = useI18n();
  return (
    <p className="rounded-4xl border border-2 border-dashed edge py-16 text-center text-sm text-ink-950 dark:text-paper-300">
      {t('admin.empty')}
    </p>
  );
}
