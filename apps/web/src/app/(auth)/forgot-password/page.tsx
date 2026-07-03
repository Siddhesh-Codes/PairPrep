'use client';

import { useState } from 'react';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [successMsg, setSuccessMsg] = useState('');
  const [serverError, setServerError] = useState('');

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setSuccessMsg('');
    setServerError('');
    try {
      const response = await api.post<{ message: string; resetLink?: string; token?: string }>(
        '/api/v1/auth/forgot-password',
        { email: data.email }
      );
      
      // In development mode, print/alert the link to make testing easy
      if (response.resetLink) {
        console.log('[Dev Password Reset Link]', response.resetLink);
        setSuccessMsg(
          `${response.message} (Dev Mode: link printed to console, or click here: ${response.resetLink})`
        );
      } else {
        setSuccessMsg(response.message);
      }
      
      toast.success('Reset Link Sent', 'Check your email inbox or development console.');
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
      toast.error('Failed to request reset', 'An error occurred.');
    }
  };

  return (
    <div className={styles.authPage}>
      <title>Forgot Password | PairPrep</title>
      <meta name="description" content="Request a secure password reset link for your PairPrep account." />
      
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
            <h2>Establish Truth. Keep Practice Moving.</h2>
            <p>
              Mock interviews are based on reliability. Reset your password and return to matching with peers instantly.
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
          <h1 className={styles.authTitle}>Recover Password</h1>
          <p className={styles.authSubtitle}>
            Enter your email to request a reset link
          </p>

          {successMsg && (
            <div
              style={{
                padding: 'var(--space-1-5) var(--space-2)',
                background: 'var(--success-muted)',
                border: '2px solid var(--success)',
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--success-hover)',
                marginBottom: 'var(--space-3)',
                wordBreak: 'break-all',
              }}
            >
              {successMsg}
              {successMsg.includes('http') && (
                <div style={{ marginTop: 'var(--space-1)' }}>
                  <a
                    href={successMsg.split('click here: ')[1].replace(')', '')}
                    style={{ textDecoration: 'underline', color: 'var(--accent)' }}
                  >
                    Open Password Reset Form
                  </a>
                </div>
              )}
            </div>
          )}

          {serverError && <div className={styles.authError}>{serverError}</div>}

          <form className={styles.authForm} onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...field('email')}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Send Reset Link
            </Button>
          </form>

          <p className={styles.authFooter}>
            Remembered your password? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
