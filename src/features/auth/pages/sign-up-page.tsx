import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { AvatarPicker } from '@/features/uploads/components/avatar-picker';
import { uploadImage } from '@/features/uploads/api/upload.api';
import { currentUserQueryKey } from '../auth-provider';
import { updateCurrentUser } from '../api/auth.api';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthAssembleIllustration } from '@/components/ui/illustrations';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import { useAuth } from '../auth-provider';
import { AuthLayout } from '../components/auth-layout';
import { PasswordField } from '../components/password-field';
import { RoleSelector } from '../components/role-selector';
import { useAuthSubmit } from '../hooks/use-auth-submit';
import { buildRegisterSchema, resolveMessage, type RegisterFormValues } from '../schemas/auth.schemas';

export function SignUpPage() {
  const { t, locale } = useI18n();
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(buildRegisterSchema()),
    defaultValues: { displayName: '', email: '', password: '', role: 'freelancer' },
    mode: 'onBlur',
  });

  const { formError, submit, isSubmitting } = useAuthSubmit(form);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarWarning, setAvatarWarning] = useState<string | null>(null);

  const onSubmit = submit(async (values) => {
    // Seed the account with the language they actually signed up in.
    await signUp({ ...values, locale });

    // The avatar can only be uploaded now: minting a signature needs the token
    // that registration just returned.
    if (avatarFile) {
      setIsUploadingAvatar(true);
      try {
        const uploaded = await uploadImage('avatar', avatarFile);
        await updateCurrentUser({ avatarUrl: uploaded.url });
        await queryClient.invalidateQueries({ queryKey: currentUserQueryKey });
      } catch {
        // The account exists and the session is live — failing the whole signup
        // over a photo would be the wrong trade. Tell them, and continue.
        setAvatarWarning(t('auth.signUp.avatarFailed'));
        setIsUploadingAvatar(false);
        return;
      }
      setIsUploadingAvatar(false);
    }

    void navigate('/', { replace: true });
  });

  const password = form.watch('password');

  return (
    <AuthLayout
      title={t('auth.signUp.title')}
      subtitle={t('auth.signUp.subtitle')}
      illustration={
        <AuthAssembleIllustration label={t('auth.signUp.illustrationAlt')} className="w-full" />
      }
      footer={
        <>
          {t('auth.signUp.haveAccount')}{' '}
          <Link
            to="/signin"
            className="rounded font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {t('auth.signUp.signIn')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError ? <Alert tone="danger">{formError}</Alert> : null}
        {avatarWarning ? (
          <Alert tone="warning">
            {avatarWarning}{' '}
            <Link to="/me" className="font-semibold underline underline-offset-2">
              {t('editor.title')}
            </Link>
          </Alert>
        ) : null}

        <Controller
          control={form.control}
          name="role"
          render={({ field, fieldState }) => (
            <RoleSelector
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              error={resolveMessage(fieldState.error?.message, t)}
            />
          )}
        />

        <AvatarPicker
          file={avatarFile}
          onSelect={setAvatarFile}
          isUploading={isUploadingAvatar}
          label={t('auth.signUp.avatar')}
          hint={t('auth.signUp.avatarHint')}
        />

        <TextField
          id="signup-name"
          type="text"
          autoComplete="name"
          label={t('auth.field.displayName')}
          placeholder={t('auth.field.displayNamePlaceholder')}
          error={resolveMessage(form.formState.errors.displayName?.message, t)}
          {...form.register('displayName')}
        />

        <TextField
          id="signup-email"
          type="email"
          autoComplete="email"
          label={t('auth.field.email')}
          placeholder={t('auth.field.emailPlaceholder')}
          error={resolveMessage(form.formState.errors.email?.message, t)}
          {...form.register('email')}
        />

        <PasswordField
          id="signup-password"
          label={t('auth.field.password')}
          hint={t('auth.field.passwordHint')}
          strengthValue={password}
          showStrength
          autoComplete="new-password"
          error={resolveMessage(form.formState.errors.password?.message, t)}
          {...form.register('password')}
        />

        <Button type="submit" size="lg" isLoading={isSubmitting || isUploadingAvatar} className="w-full">
          {t('auth.signUp.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
