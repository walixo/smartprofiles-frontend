import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EditorSection, SelectField, TextAreaField } from '@/components/ui/form-fields';
import { GalleryIcon } from '@/components/ui/icons';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import { WORK_VISIBILITIES, type WorkVisibility } from '@/shared/vocabulary';
import type { OwnerWork, WorkPayload } from '../api/owner.api';
import { ImageUploadField } from '@/features/uploads/components/image-upload-field';
import { useWorkMutations } from '../hooks/use-own-profile';

interface Draft {
  id?: string;
  title: string;
  year: string;
  role: string;
  clientName: string;
  coverImage: string;
  externalUrl: string;
  description: string;
  visibility: WorkVisibility;
}

const EMPTY: Draft = {
  title: '',
  year: '',
  role: '',
  clientName: '',
  coverImage: '',
  externalUrl: '',
  description: '',
  visibility: 'public',
};

export function WorksManager({ works }: { works: OwnerWork[] }) {
  const { t } = useI18n();
  const { create, update, remove, reorder } = useWorkMutations();
  const [draft, setDraft] = useState<Draft | null>(null);

  const save = async (): Promise<void> => {
    if (!draft) return;

    const payload: WorkPayload = {
      title: draft.title,
      role: draft.role,
      clientName: draft.clientName,
      coverImage: draft.coverImage,
      externalUrl: draft.externalUrl,
      description: draft.description,
      visibility: draft.visibility,
      // An empty year must be omitted, not sent as NaN.
      ...(draft.year.trim() ? { year: Number(draft.year) } : {}),
    };

    if (draft.id) {
      await update.mutateAsync({ id: draft.id, payload });
    } else {
      await create.mutateAsync(payload);
    }
    setDraft(null);
  };

  /** Reorder sends the complete list — the API rejects a partial one. */
  const move = (index: number, direction: -1 | 1): void => {
    const next = [...works];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(target, 0, moved);
    void reorder.mutateAsync(next.map((work) => work.id));
  };

  return (
    <EditorSection title={t('editor.works.title')}>
      {works.length === 0 ? (
        <p className="text-sm text-ink-950 dark:text-paper-300">{t('editor.works.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {works.map((work, index) => (
            <li
              key={work.id}
              className="flex items-center gap-4 rounded-3xl border-2 edge p-3"
            >
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-paper-200 text-ink-700 dark:bg-ink-800 dark:text-ink-950">
                {work.coverImage ? (
                  <img src={work.coverImage} alt="" className="size-full object-cover" />
                ) : (
                  <GalleryIcon size={20} />
                )}
              </span>

              <div className="min-w-0 flex-1">
                {/* The title is the edit affordance — no separate pencil button. */}
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      id: work.id,
                      title: work.title,
                      year: work.year ? String(work.year) : '',
                      role: work.role ?? '',
                      clientName: work.clientName ?? '',
                      coverImage: work.coverImage ?? '',
                      externalUrl: work.externalUrl ?? '',
                      description: work.description ?? '',
                      visibility: work.visibility,
                    })
                  }
                  className="block max-w-full truncate rounded text-left text-sm font-semibold text-ink-900 hover:text-brand-600 dark:text-paper-50 dark:hover:text-brand-400"
                >
                  {work.title}
                </button>
                <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-950 dark:text-paper-300">
                  {work.year ?? '—'}
                  {work.visibility === 'hidden' ? <Badge tone="neutral">{t('editor.works.hidden')}</Badge> : null}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <IconAction label={t('editor.moveUp')} onClick={() => move(index, -1)} disabled={index === 0}>
                  ↑
                </IconAction>
                <IconAction
                  label={t('editor.moveDown')}
                  onClick={() => move(index, 1)}
                  disabled={index === works.length - 1}
                >
                  ↓
                </IconAction>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(t('editor.works.confirmDelete'))) void remove.mutateAsync(work.id);
                  }}
                >
                  {t('editor.remove')}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" onClick={() => setDraft({ ...EMPTY })}>
        {t('editor.works.add')}
      </Button>

      <Dialog
        isOpen={draft !== null}
        onClose={() => setDraft(null)}
        title={t('editor.works.add')}
        className="max-w-lg"
      >
        {draft ? (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            <TextField
              id="work-title"
              label={t('editor.work.title')}
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="work-year"
                label={t('editor.work.year')}
                inputMode="numeric"
                value={draft.year}
                onChange={(e) => setDraft({ ...draft, year: e.target.value.replace(/\D/g, '').slice(0, 4) })}
              />
              <TextField
                id="work-role"
                label={t('editor.work.role')}
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              />
            </div>
            <TextField
              id="work-client"
              label={t('editor.work.client')}
              value={draft.clientName}
              onChange={(e) => setDraft({ ...draft, clientName: e.target.value })}
            />
            <ImageUploadField
              id="work-cover"
              kind="work"
              label={t('editor.work.cover')}
              previewClassName="aspect-[4/3]"
              value={draft.coverImage}
              onChange={(url) => setDraft({ ...draft, coverImage: url })}
            />
            <TextField
              id="work-url"
              label={t('editor.work.url')}
              placeholder="https://…"
              value={draft.externalUrl}
              onChange={(e) => setDraft({ ...draft, externalUrl: e.target.value })}
            />
            <TextAreaField
              id="work-description"
              label={t('editor.work.description')}
              rows={4}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
            <SelectField
              id="work-visibility"
              label={t('editor.section.visibility')}
              value={draft.visibility}
              onChange={(e) => setDraft({ ...draft, visibility: e.target.value as WorkVisibility })}
              options={WORK_VISIBILITIES.map((v) => ({
                value: v,
                label: v === 'public' ? t('visibility.public') : t('editor.works.hidden'),
              }))}
            />

            <div className="flex gap-2 pt-2">
              <Button
                className="flex-1"
                onClick={() => void save()}
                isLoading={create.isPending || update.isPending}
              >
                {t('common.save')}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setDraft(null)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </EditorSection>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="inline-flex size-8 items-center justify-center rounded-none text-ink-900 transition-colors hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-30 dark:text-paper-200 dark:hover:bg-ink-800"
    >
      {children}
    </button>
  );
}
