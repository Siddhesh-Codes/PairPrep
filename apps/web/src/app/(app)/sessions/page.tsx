'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppIcon } from '@/components/icons/AppIcon';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useToast } from '@/components/ui/Toast';
import { SkeletonStack, SkeletonCard, ErrorState, EmptyState } from '@/components/ui/Skeleton';
import styles from './sessions.module.css';

interface SessionItem {
  id: string;
  interviewTypeName: string;
  schedulerId: string;
  schedulerDisplayName: string;
  partnerId: string;
  partnerDisplayName: string;
  status: string;
  scheduledAt: string;
  durationMinutes: string;
  meetingLink: string;
  notes: string | null;
}

interface PagedResponse {
  content: SessionItem[];
  totalElements: number;
}

const STATUS_FILTERS = ['all', 'scheduled', 'completed', 'cancelled'];

export default function SessionsPage() {
  const toast = useToast();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 5;
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setPage(1);
  };

  const statusParam = filter === 'all' ? '' : `&status=${filter}`;
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sessions', filter],
    queryFn: () => api.get<PagedResponse>(`/api/v1/sessions?size=50${statusParam}`),
  });

  const sessions = data?.content || [];
  const totalElements = sessions.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / limit));
  const paginatedSessions = sessions.slice((page - 1) * limit, page * limit);

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/v1/sessions/${id}/complete`),
    onSuccess: () => {
      toast.success('Session Completed', 'The session has been marked as completed.');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err: Error) => {
      toast.error('Failed to complete session', err.message || 'Please try again.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/v1/sessions/${id}/cancel`, { reason: 'Cancelled by user' }),
    onSuccess: () => {
      toast.success('Session Cancelled', 'The session has been successfully cancelled.');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err: Error) => {
      toast.error('Failed to cancel session', err.message || 'Please try again.');
    },
  });


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      day: date.getDate().toString(),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  const getPartnerName = (session: SessionItem) =>
    session.schedulerId === user?.id ? session.partnerDisplayName : session.schedulerDisplayName;

  const statusClass = (status: string) => {
    const map: Record<string, string> = {
      scheduled: styles.statusScheduled,
      completed: styles.statusCompleted,
      cancelled: styles.statusCancelled,
      no_show: styles.statusNoShow,
    };
    return map[status] || '';
  };

  return (
    <AppShell title="Sessions">
      <title>Mock Sessions | PairPrep</title>
      <meta name="description" content="View and manage scheduled, completed, and cancelled mock interview practice sessions. Join virtual rooms and review feedback." />
      <div className={styles.sessions}>
        <div className={styles.headerRow}>
          <div className={styles.filters}>
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                className={`${styles.filterBtn} ${filter === status ? styles.filterBtnActive : ''}`}
                onClick={() => handleFilterChange(status)}
                type="button"
              >
                {status}
              </button>
            ))}
          </div>
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
            title="Failed to load sessions"
            message="There was an error retrieving your practice sessions. Please check your network connection and try again."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && sessions.length > 0 && (
          <>
          <div className={styles.sessionList}>
            {paginatedSessions.map((session, index) => {
              const { month, day, time } = formatDate(session.scheduledAt);

              return (
                <article
                  key={session.id}
                  className={styles.sessionCard}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <div className={styles.sessionDate}>
                    <div className={styles.sessionDateMonth}>{month}</div>
                    <div className={styles.sessionDateDay}>{day}</div>
                    <div className={styles.sessionDateTime}>{time}</div>
                  </div>

                  <div className={styles.sessionBody}>
                    <div className={styles.sessionTitle}>{session.interviewTypeName}</div>
                    <div className={styles.sessionPartner}>with {getPartnerName(session)}</div>
                    <div className={styles.sessionMeta}>
                      <span>
                        <AppIcon name="clock" size={15} />
                        {session.durationMinutes} min
                      </span>
                      {session.status === 'scheduled' && (
                        <Link href={`/sessions/${session.id}/room`} className={styles.workspaceLink}>
                          <AppIcon name="external" size={15} />
                          Workspace Room
                        </Link>
                      )}
                      {session.meetingLink && (
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                          <AppIcon name="external" size={15} />
                          External Call
                        </a>
                      )}
                    </div>
                    {session.status === 'scheduled' && (
                      <div className={styles.sessionActions}>
                        <Button size="sm" onClick={() => completeMutation.mutate(session.id)}>
                          Mark Complete
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => cancelMutation.mutate(session.id)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                    {session.status === 'completed' && (
                      <div className={styles.sessionActions}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.location.href = `/sessions/${session.id}/feedback`;
                          }}
                        >
                          Leave Feedback
                        </Button>
                      </div>
                    )}
                  </div>

                  <span className={`${styles.sessionStatus} ${statusClass(session.status)}`}>
                    {session.status.replace('_', ' ')}
                  </span>
                </article>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationBtn}
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                type="button"
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {page} of {totalPages}
              </span>
              <button
                className={styles.paginationBtn}
                disabled={page === totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                type="button"
              >
                Next
              </button>
            </div>
          )}
          </>
        )}

        {!isLoading && !isError && sessions.length === 0 && (
          <EmptyState
            icon="📅"
            title="No sessions found"
            message={
              filter === 'all'
                ? 'Accept a match request and schedule your first mock interview to get started.'
                : `You have no ${filter} sessions.`
            }
          />
        )}
      </div>
    </AppShell>
  );
}
