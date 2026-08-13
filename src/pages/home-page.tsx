import { Link } from 'react-router';
import { buttonClasses } from '@/components/ui/button';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { ArrowRightIcon, ChatIcon, GalleryIcon, LinkIcon } from '@/components/ui/icons';
import { ProfileShowcaseIllustration } from '@/components/ui/illustrations';
import { ApiStatus } from '@/features/system/components/api-status';
import { useI18n } from '@/i18n/i18n-provider';
import type { TranslationKey } from '@/i18n/types';
import { COUNTRIES } from '@/shared/vocabulary';

export function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <Features />
      <Markets />
      <FinalCta />
      <Container className="pb-16">
        <div className="flex justify-center">
          <ApiStatus />
        </div>
      </Container>
    </>
  );
}

function Hero() {
  const { t } = useI18n();

  return (
    <section className="relative overflow-hidden">

      <Container className="relative py-16 sm:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="slab inline-flex rounded-none border-2 edge bg-brick-500 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
              {t('home.hero.eyebrow')}
            </p>

            <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-tighter text-ink-950 sm:text-6xl lg:text-7xl dark:text-paper-50">
              {t('home.hero.title')}{' '}
              <span className="text-brick-500">{t('home.hero.titleAccent')}</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-900 dark:text-paper-200">
              {t('home.hero.subtitle')}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/signup"
                className={buttonClasses('primary', 'lg')}
              >
                {t('home.hero.ctaPrimary')}
                <ArrowRightIcon size={18} />
              </Link>
              <Link to="/browse" className={buttonClasses('outline', 'lg')}>
                {t('home.hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          <ProfileShowcaseIllustration
            label={t('home.hero.illustrationAlt')}
            className="w-full max-w-lg justify-self-center "
          />
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  const { t } = useI18n();

  const stats: Array<{ value: TranslationKey; label: TranslationKey }> = [
    { value: 'home.stats.marketsValue', label: 'home.stats.marketsLabel' },
    { value: 'home.stats.languagesValue', label: 'home.stats.languagesLabel' },
    { value: 'home.stats.disciplinesValue', label: 'home.stats.disciplinesLabel' },
  ];

  return (
    <Container className="pb-6">
      <dl className="grid divide-y-2 divide-ink-950 rounded-none border-2 edge bg-paper-50 slab sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0 dark:divide-paper-100 dark:bg-ink-900">
        {stats.map((stat) => (
          <div key={stat.value} className="p-8 text-center">
            <dt className="sr-only">{t(stat.label)}</dt>
            <dd>
              <span className="block text-5xl font-black text-brick-500">{t(stat.value)}</span>
              <span className="mt-1 block text-sm font-medium text-ink-900 dark:text-paper-200">
                {t(stat.label)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}

function Features() {
  const { t } = useI18n();

  const features = [
    { Icon: LinkIcon, title: 'home.features.link.title', body: 'home.features.link.body' },
    { Icon: GalleryIcon, title: 'home.features.works.title', body: 'home.features.works.body' },
    { Icon: ChatIcon, title: 'home.features.contact.title', body: 'home.features.contact.body' },
  ] as const satisfies ReadonlyArray<{
    Icon: typeof LinkIcon;
    title: TranslationKey;
    body: TranslationKey;
  }>;

  return (
    <Container as="section" className="py-16 sm:py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-ink-950 sm:text-4xl dark:text-paper-50">
          {t('home.features.title')}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-900 dark:text-paper-200">
          {t('home.features.subtitle')}
        </p>
      </div>

      <div className="mt-12 grid gap-5 @container md:grid-cols-3">
        {features.map(({ Icon, title, body }) => (
          <Card key={title} interactive>
            <span className="inline-flex size-12 items-center justify-center rounded-none border-2 edge bg-brick-500 text-white">
              <Icon size={23} />
            </span>
            <CardTitle className="mt-5">{t(title)}</CardTitle>
            <CardBody className="mt-2">{t(body)}</CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}

function Markets() {
  const { t } = useI18n();

  return (
    <section className="border-y-4 edge bg-paper-200 dark:bg-ink-900">
      <Container className="py-16 text-center sm:py-20">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-ink-950 sm:text-4xl dark:text-paper-50">
          {t('home.markets.title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ink-900 dark:text-paper-200">
          {t('home.markets.subtitle')}
        </p>

        <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
          {COUNTRIES.map((code) => (
            <li
              key={code}
              className="rounded-none border-2 edge bg-paper-50 px-5 py-2.5 text-xs font-black uppercase tracking-wide text-ink-950 slab dark:bg-ink-950 dark:text-paper-100"
            >
              {t(`country.${code}`)}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function FinalCta() {
  const { t } = useI18n();

  return (
    <Container className="py-16 sm:py-24">
      <div className="overflow-hidden rounded-none border-4 edge bg-brick-500 px-8 py-14 text-center shadow-glow sm:px-16">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-white sm:text-5xl">
          {t('home.cta.title')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg font-medium leading-relaxed text-white">
          {t('home.cta.body')}
        </p>
        <Link
          to="/signup"
          className="mt-9 inline-flex h-14 items-center justify-center gap-2 rounded-none border-2 edge bg-white px-8 text-base font-black uppercase tracking-wide text-ink-950 slab slab-press"
        >
          {t('home.cta.action')}
          <ArrowRightIcon size={18} />
        </Link>
      </div>
    </Container>
  );
}
