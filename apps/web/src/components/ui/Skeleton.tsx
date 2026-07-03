'use client';

import React from 'react';
import { Button } from './Button';
import styles from './Skeleton.module.css';

/* ─── Skeleton Primitive ─── */

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'button' | 'card' | 'statCard';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
}: SkeletonProps) {
  const classes = [
    styles.skeleton,
    styles[`skeleton--${variant}`],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

/* ─── Composed Skeleton Layouts ─── */

export function SkeletonRow({ children }: { children: React.ReactNode }) {
  return <div className={styles.skeletonRow}>{children}</div>;
}

export function SkeletonStack({ children }: { children: React.ReactNode }) {
  return <div className={styles.skeletonStack}>{children}</div>;
}

export function SkeletonGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.skeletonGrid}>{children}</div>;
}

/** Preset: a card skeleton with avatar + 3 text lines */
export function SkeletonCard() {
  return (
    <div className={styles.skeleton} style={{ padding: 'var(--space-2)', height: 'auto' }}>
      <SkeletonRow>
        <Skeleton variant="avatar" />
        <SkeletonStack>
          <Skeleton variant="title" />
          <Skeleton variant="text" width="80%" />
        </SkeletonStack>
      </SkeletonRow>
      <div style={{ marginTop: 'var(--space-2)' }}>
        <Skeleton variant="text" />
        <div style={{ marginTop: 'var(--space-1)' }}>
          <Skeleton variant="text" width="60%" />
        </div>
      </div>
    </div>
  );
}

/** Preset: stat card skeleton (matches dashboard stat cards) */
export function SkeletonStatCard() {
  return <Skeleton variant="statCard" />;
}

/* ─── Error State ─── */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn\'t load this data. Check your connection and try again.',
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  return (
    <div className={styles.errorState} role="alert">
      <div className={styles.errorIcon}>⚠</div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{message}</p>
      {onRetry && (
        <div className={styles.errorActions}>
          <Button variant="outline" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─── Empty State ─── */

import { AppIcon } from '../icons/AppIcon';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  message,
  children,
}: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        {icon || <AppIcon name="inbox" size={28} />}
      </div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      {message && <p className={styles.emptyMessage}>{message}</p>}
      {children}
    </div>
  );
}
