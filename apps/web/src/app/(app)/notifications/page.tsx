'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { AppIcon } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/Button';
import { AppShell } from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import { SkeletonStack, SkeletonCard, ErrorState, EmptyState } from '@/components/ui/Skeleton';
import styles from './notifications.module.css';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  read: boolean;
  createdAt: string;
}

interface PagedResponse { content: Notification[]; totalElements: number; }

const RELATIVE_TIME_REFERENCE = Date.now();

export default function NotificationsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<PagedResponse>('/api/v1/notifications?size=50'),
    refetchInterval: 10000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/v1/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    onError: (err: Error) => {
      toast.error('Failed to mark notification as read', err.message || 'Please try again.');
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.put('/api/v1/notifications/read-all'),
    onSuccess: () => {
      toast.success('All marked read', 'All notifications have been marked as read.');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (err: Error) => {
      toast.error('Failed to mark all as read', err.message || 'Please try again.');
    },
  });

  const notifications = data?.content || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  const timeAgo = (dateStr: string) => {
    const diff = RELATIVE_TIME_REFERENCE - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <AppShell title="Notifications">
      <title>Notifications | PairPrep</title>
      <meta name="description" content="Stay updated with match requests, feedback receipts, and scheduled session reminders on PairPrep." />
      <div className={styles.notifications}>
        <div className={styles.headerRow}>
          <h2>
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </h2>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllMutation.mutate()} loading={markAllMutation.isPending}>
              Mark all read
            </Button>
          )}
        </div>

        {isLoading && (
          <SkeletonStack>
            {[1, 2, 3].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </SkeletonStack>
        )}

        {!isLoading && isError && (
          <ErrorState
            title="Failed to load notifications"
            message="We couldn't retrieve your notifications. Please check your connection and try again."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && notifications.length > 0 && (
          <div className={styles.list}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`${styles.item} ${!n.read ? styles.itemUnread : ''}`}
                onClick={() => !n.read && markReadMutation.mutate(n.id)}
              >
                <div className={`${styles.itemDot} ${n.read ? styles.itemDotRead : ''}`} />
                <div className={styles.itemBody}>
                  <div className={styles.itemTitle}>{n.title}</div>
                  <div className={styles.itemMessage}>{n.body}</div>
                  <div className={styles.itemTime}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && notifications.length === 0 && (
          <EmptyState
            icon="🔔"
            title="All caught up"
            message="No notifications to show."
          />
        )}
      </div>
    </AppShell>
  );
}
