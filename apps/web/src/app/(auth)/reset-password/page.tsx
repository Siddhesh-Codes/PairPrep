'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import styles from '../auth.module.css';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const toast = useToast();
  
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    setServerError('');
    if (!token) {
      setServerError('Reset token is missing from the URL.');
      toast.error('Missing Token', 'No password reset token was provided.');
      return;
    }

    try {
      await api.post('/api/v1/auth/reset-password', {
        token,
        newPassword: data.password,
      });
      setSuccess(true);
      toast.success('Password Changed', 'You can now sign in with your new password.');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
      toast.error('Failed to reset password', 'Token may be expired or invalid.');
    }
  };

  return (
    <div className={styles.authPage}>
      <title>Reset Password | PairPrep</title>
      <meta name="description" content="Set a new secure password for your PairPrep account." />
      
      <div className={styles.authBg} />
      <div className={styles.authShell}>
        <aside className={styles.authStory}>
          <Link href="/" className={styles.authBrand}>
            <Image
              src="/PairPrep.png"
              alt="PairPrep"
              width={36}
              height={36}
              className={styles.authLogoImage}
              priority
            />
            <span>PairPrep</span>
          </Link>
          <div>
            <h2>Secure Workspace Recovery</h2>
            <p>
              Keep your account locked tight. Finish resetting your password to access your dashboard.
            </p>
          </div>
          <div className={styles.authMetricGrid}>
            <div>
              <strong>3</strong>
              <span>Prep steps</span>
            </div>
            <div>
              <strong>4</strong>
              <span>Interview tracks</span>
            </div>
          </div>
        </aside>

        <div className={styles.authCard}>
          <div className={styles.authLogo}>
            <Image
              src="/PairPrep.png"
              alt="PairPrep"
              width={48}
              height={48}
              className={styles.authLogoImageLarge}
              priority
            />
          </div>
          <h1 className={styles.authTitle}>New Password</h1>
          <p className={styles.authSubtitle}>
            Set your new account credentials
          </p>

          {!token && (
            <div className={styles.authError}>
              No password reset token was found in the URL. Please request a new link.
            </div>
          )}

          {serverError && <div className={styles.authError}>{serverError}</div>}

          {success ? (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-2)' }}>
              <div
                style={{
                  padding: 'var(--space-2)',
                  background: 'var(--success-muted)',
                  border: '2px solid var(--success)',
                  color: 'var(--success-hover)',
                  fontWeight: 'var(--weight-bold)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                Password reset complete!
              </div>
              <Button onClick={() => router.push('/login')} fullWidth>
                Go to Sign In
              </Button>
            </div>
          ) : (
            <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="New Password"
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                error={errors.password?.message}
                {...field('password')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="********"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...field('confirmPassword')}
              />
              <Button type="submit" fullWidth loading={isSubmitting} disabled={!token}>
                Reset Password
              </Button>
            </form>
          )}

          <p className={styles.authFooter}>
            Remembered your password? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className={styles.authPage}><div className={styles.authShell} style={{ justifyContent: 'center', alignItems: 'center' }}>Loading Reset Form...</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
