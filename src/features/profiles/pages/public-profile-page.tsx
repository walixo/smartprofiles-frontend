import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { Button, buttonClasses } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { ChatIcon, LinkIcon, PhoneIcon, SpinnerIcon } from '@/components/ui/icons';
import { BrokenLinkIllustration } from '@/components/ui/illustrations';
import { useAuth } from '@/features/auth/auth-provider';
import { StartChatDialog } from '@/features/chat/components/start-chat-dialog';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { renderMarkdown } from '@/lib/markdown';
import type { AvailabilityState } from '@/shared/vocabulary';
import type { PublicProfile } from '../api/profile.api';
import { useProfile } from '../hooks/use-profile';
import { ShareDialog } from '../components/share-dialog';
import { WorkCard } from '../components/work-card';

const AVAILABILITY_TONE: Record<AvailabilityState, 'success' | 'accent' | 'neutral'> = {
  available: 'success',
  'open-to-offers': 'accent',
  unavailable: 'neutral',
};

export function PublicProfilePage() {
  const { t } = useI18n();
  const params = useParams();
  const raw = params.handle ?? '';

  // The router matches any single root segment; only `@handle` is a profile.
  const handle = raw.startsWith('@') ? raw.slice(1).toLowerCase() : '';

  const { data, isPending, error } = useProfile(handle);

  if (!handle || error) return <ProfileMissing />;

  if (isPending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="flex items-center gap-3 text-sm font-medium text-ink-500 dark:text-ink-400">
          <SpinnerIcon size={18} className="animate-spin" />
          {t('common.loading')}
        </span>
      </div>
    );
  }

  return <ProfileView profile={data.profile} />;
}

function ProfileView({ profile }: { profile: PublicProfile }) {
  const { t } = useI18n();
  const { isAuthenticated } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);

  return (
    <>
      <Cover profile={profile} />

      <Container className="pb-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14">
          <div className="min-w-0">
            <header className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl dark:text-sand-50">
                  {profile.displayName}
                </h1>
                <Badge tone={AVAILABILITY_TONE[profile.availability]}>
                  {t(`availability.${profile.availability}` as TranslationKey)}
                </Badge>
              </div>

              <p className="mt-3 text-lg leading-relaxed text-ink-700 dark:text-ink-200">
                {profile.headline}
              </p>

              <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
                {profile.city
                  ? `${t('profile.basedIn', { city: profile.city })} · ${t(`country.${profile.country}` as TranslationKey)}`
                  : t(`country.${profile.country}` as TranslationKey)}
              </p>

              <ul className="mt-5 flex flex-wrap gap-2">
                {profile.disciplines.map((slug) => (
                  <li key={slug}>
                    <Badge tone="brand">{t(`discipline.${slug}` as TranslationKey)}</Badge>
                  </li>
                ))}
              </ul>
            </header>

            {profile.bio ? (
              <Section title={t('profile.section.about')}>
                <div className="text-[0.9375rem] leading-relaxed text-ink-700 dark:text-ink-200">
                  {renderMarkdown(profile.bio)}
                </div>
              </Section>
            ) : null}

            <Section title={t('profile.section.work')}>
              {profile.works.length === 0 ? (
                <p className="text-sm text-ink-500 dark:text-ink-400">{t('profile.work.empty')}</p>
              ) : (
                <div className="grid gap-6 @container sm:grid-cols-2">
                  {profile.works.map((work, index) => (
                    <WorkCard key={work.id} work={work} index={index} />
                  ))}
                </div>
              )}
            </Section>

            {profile.skills.length > 0 ? (
              <Section title={t('profile.section.skills')}>
                <ul className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-sand-300 px-3.5 py-1.5 text-sm text-ink-700 dark:border-ink-700 dark:text-sand-200"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </Section>
            ) : null}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="animate-fade-up rounded-4xl border border-sand-200 bg-white p-6 shadow-soft dark:border-ink-800 dark:bg-ink-900">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                {t('profile.contact.title')}
              </h2>

              <div className="mt-4 space-y-2.5">
                {profile.contact.allowChat ? (
                  isAuthenticated ? (
                    <Button
                      className="w-full"
                      leadingIcon={<ChatIcon size={17} />}
                      onClick={() => setIsMessaging(true)}
                    >
                      {t('profile.contact.chat')}
                    </Button>
                  ) : (
                    // Starting a conversation needs an account; send them to
                    // sign in rather than opening a dialog that will 401.
                    <Link to="/signin" className={buttonClasses('primary', 'md', 'w-full')}>
                      <ChatIcon size={17} />
                      {t('profile.contact.chat')}
                    </Link>
                  )
                ) : null}

                {profile.contact.phone ? (
                  <a
                    href={`tel:${profile.contact.phone.replace(/\s+/g, '')}`}
                    className={buttonClasses('outline', 'md', 'w-full')}
                  >
                    <PhoneIcon size={17} />
                    {profile.contact.phone}
                  </a>
                ) : profile.contact.phoneAvailable && !isAuthenticated ? (
                  // The number is withheld by the API, not merely hidden here.
                  <Link to="/signin" className={buttonClasses('outline', 'md', 'w-full')}>
                    <PhoneIcon size={17} />
                    {t('profile.contact.signInToView')}
                  </Link>
                ) : null}

                {!profile.contact.allowChat && !profile.contact.phoneAvailable ? (
                  <p className="text-sm text-ink-500 dark:text-ink-400">
                    {t('profile.contact.noneAvailable')}
                  </p>
                ) : null}

                <Button variant="ghost" className="w-full" onClick={() => setIsSharing(true)}>
                  {t('profile.share.open')}
                </Button>
              </div>

              {profile.rate ? (
                <div className="mt-6 border-t border-sand-200 pt-5 dark:border-ink-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    {t('profile.rate.label')}
                  </p>
                  <p className="mt-1.5 text-lg font-semibold text-ink-900 dark:text-sand-50">
                    <RateValue rate={profile.rate} />
                  </p>
                </div>
              ) : null}

              {profile.languages.length > 0 ? (
                <div className="mt-6 border-t border-sand-200 pt-5 dark:border-ink-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    {t('profile.section.languages')}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {profile.languages.map((language) => (
                      <li key={language.code} className="flex justify-between gap-3 text-sm">
                        <span className="text-ink-700 dark:text-sand-200">
                          {t(`lang.${language.code}` as TranslationKey)}
                        </span>
                        <span className="text-ink-500 dark:text-ink-400">
                          {t(`languageLevel.${language.level}` as TranslationKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {profile.links.length > 0 ? (
                <div className="mt-6 border-t border-sand-200 pt-5 dark:border-ink-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                    {t('profile.section.links')}
                  </p>
                  <ul className="mt-2.5 space-y-1">
                    {profile.links.map((link) => (
                      <li key={`${link.kind}-${link.url}`}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 rounded-lg py-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          <LinkIcon size={15} />
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            <p className="mt-4 text-center text-xs text-ink-400 dark:text-ink-500">
              smartprofiles.eu/@{profile.handle}
            </p>
          </aside>
        </div>
      </Container>

      <ShareDialog
        isOpen={isSharing}
        onClose={() => setIsSharing(false)}
        handle={profile.handle}
        displayName={profile.displayName}
      />

      <StartChatDialog
        isOpen={isMessaging}
        onClose={() => setIsMessaging(false)}
        handle={profile.handle}
        displayName={profile.displayName}
      />
    </>
  );
}

function Cover({ profile }: { profile: PublicProfile }) {
  return (
    <div className="relative">
      <div className="h-40 w-full overflow-hidden bg-gradient-to-br from-brand-400 via-brand-500 to-accent-500 sm:h-56">
        {profile.coverUrl ? (
          <img src={profile.coverUrl} alt="" className="size-full object-cover" />
        ) : null}
      </div>

      <Container>
        <div className="-mt-14 mb-8 sm:-mt-16">
          <span className="animate-pop inline-flex size-28 items-center justify-center overflow-hidden rounded-4xl border-4 border-sand-50 bg-accent-400 shadow-lifted sm:size-32 dark:border-ink-950">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="size-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-white">{initialsOf(profile.displayName)}</span>
            )}
          </span>
        </div>
      </Container>
    </div>
  );
}

function RateValue({ rate }: { rate: NonNullable<PublicProfile['rate']> }) {
  const { t, formatCurrency } = useI18n();

  if (rate.dayRateMin !== undefined && rate.dayRateMax !== undefined) {
    return (
      <>
        {t('profile.rate.range', {
          min: formatCurrency(rate.dayRateMin, rate.currency),
          max: formatCurrency(rate.dayRateMax, rate.currency),
        })}
      </>
    );
  }

  if (rate.dayRateMin !== undefined) return <>{formatCurrency(rate.dayRateMin, rate.currency)}</>;
  if (rate.hourly !== undefined) {
    return <>{t('profile.rate.hourly', { amount: formatCurrency(rate.hourly, rate.currency) })}</>;
  }
  return null;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-sm font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ProfileMissing() {
  const { t } = useI18n();

  return (
    <Container width="narrow" className="flex flex-col items-center py-24 text-center">
      <BrokenLinkIllustration className="w-52" />
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-ink-900 dark:text-sand-50">
        {t('profile.notFound.title')}
      </h1>
      <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-600 dark:text-ink-300">
        {t('profile.notFound.body')}
      </p>
      <Link to="/" className={buttonClasses('primary', 'lg', 'mt-9')}>
        {t('notFound.action')}
      </Link>
    </Container>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? '?') + (parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '')).toUpperCase();
}
