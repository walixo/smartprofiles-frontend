import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AuthUnlockIllustration } from '@/components/ui/illustrations';
import { TextField } from '@/components/ui/text-field';
import { useI18n } from '@/i18n/i18n-provider';
import { useAuth } from '../auth-provider';
import { AuthLayout } from '../components/auth-layout';
import { PasswordField } from '../components/password-field';
import { buildLoginSchema, resolveMessage, type LoginFormValues } from '../schemas/auth.schemas';
import { useAuthSubmit } from '../hooks/use-auth-submit';

export function SignInPage() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(buildLoginSchema()),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const { formError, submit, isSubmitting } = useAuthSubmit(form);

  const onSubmit = submit(async (values) => {
    await signIn(values);
    // Return them to wherever the guard intercepted them, or home.
    const from = (location.state as { from?: string } | null)?.from;
    void navigate(from ?? '/', { replace: true });
  });

  return (
    <AuthLayout
      title={t('auth.signIn.title')}
      subtitle={t('auth.signIn.subtitle')}
      illustration={<AuthUnlockIllustration label={t('auth.signIn.illustrationAlt')} className="w-full" />}
      footer={
        <>
          {t('auth.signIn.noAccount')}{' '}
          <Link
            to="/signup"
            className="rounded font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            {t('auth.signIn.createOne')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {formError ? <Alert tone="danger">{formError}</Alert> : null}

        <TextField
          id="signin-email"
          type="email"
          autoComplete="email"
          label={t('auth.field.email')}
          placeholder={t('auth.field.emailPlaceholder')}
          error={resolveMessage(form.formState.errors.email?.message, t)}
          {...form.register('email')}
        />

        {/* No strength meter here — it only makes sense while choosing a password,
            and watching the field would re-render the form on every keystroke. */}
        <PasswordField
          id="signin-password"
          label={t('auth.field.password')}
          autoComplete="current-password"
          error={resolveMessage(form.formState.errors.password?.message, t)}
          {...form.register('password')}
        />

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
          {t('auth.signIn.submit')}
        </Button>
      </form>
    </AuthLayout>
  );
}
