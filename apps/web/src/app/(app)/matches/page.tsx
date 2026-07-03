'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Linkedin, Github, Leetcode as Code } from '@/components/icons/SocialIcons';
import { api, getAvatarUrl } from '@/lib/api';
import { AppIcon } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/Button';
import { AppShell } from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import { SkeletonStack, SkeletonCard, ErrorState, EmptyState } from '@/components/ui/Skeleton';
import styles from './matches.module.css';

interface MatchRequest {
  id: string;
  requesterId: string;
  requesterDisplayName: string;
  requesterAvatarUrl?: string | null;
  requesterLinkedin?: string | null;
  requesterGithub?: string | null;
  requesterLeetcode?: string | null;
  requesterBio?: string | null;
  requesterExperienceLevel?: string | null;
  requesterAvgRating?: number | null;
  requesterSessionsCompleted?: number | null;
  recipientId: string;
  recipientDisplayName: string;
  recipientAvatarUrl?: string | null;
  recipientLinkedin?: string | null;
  recipientGithub?: string | null;
  recipientLeetcode?: string | null;
  recipientBio?: string | null;
  recipientExperienceLevel?: string | null;
  recipientAvgRating?: number | null;
  recipientSessionsCompleted?: number | null;
  interviewTypeId: string;
  interviewTypeName: string;
  status: string;
  message: string | null;
  createdAt: string;
  expiresAt: string;
}

interface PagedResponse { content: MatchRequest[]; totalElements: number; }

const RELATIVE_TIME_REFERENCE = Date.now();

export default function MatchesPage() {
  const toast = useToast();
  const [tab, setTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [page, setPage] = useState(1);
  const limit = 5;
  const queryClient = useQueryClient();
  const [previewingProfile, setPreviewingProfile] = useState<MatchRequest | null>(null);

  const handleTabChange = (newTab: 'incoming' | 'outgoing') => {
    setTab(newTab);
    setPage(1);
  };

  // Scheduling state
  const [schedulingMatch, setSchedulingMatch] = useState<MatchRequest | null>(null);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [duration, setDuration] = useState<number>(60);
  const [meetingLink, setMeetingLink] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const { data: incoming, isLoading: loadingIn, isError: errorIn, refetch: refetchIn } = useQuery({
    queryKey: ['matches', 'incoming'],
    queryFn: () => api.get<PagedResponse>('/api/v1/match-requests/incoming'),
  });

  const { data: outgoing, isLoading: loadingOut, isError: errorOut, refetch: refetchOut } = useQuery({
    queryKey: ['matches', 'outgoing'],
    queryFn: () => api.get<PagedResponse>('/api/v1/match-requests/outgoing'),
  });

  const acceptMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/v1/match-requests/${id}/accept`),
    onSuccess: () => {
      toast.success('Request Accepted', 'You have accepted the match request.');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (err: Error) => {
      toast.error('Failed to accept request', err.message || 'Please try again.');
    },
  });

  const declineMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/v1/match-requests/${id}/decline`),
    onSuccess: () => {
      toast.success('Request Declined', 'You have declined the match request.');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (err: Error) => {
      toast.error('Failed to decline request', err.message || 'Please try again.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/match-requests/${id}`),
    onSuccess: () => {
      toast.success('Request Cancelled', 'Your match request has been cancelled.');
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
    onError: (err: Error) => {
      toast.error('Failed to cancel request', err.message || 'Please try again.');
    },
  });

  const requests = tab === 'incoming' ? incoming?.content : outgoing?.content;
  const totalElements = requests?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalElements / limit));
  const paginatedRequests = requests?.slice((page - 1) * limit, page * limit) || [];

  const loading = tab === 'incoming' ? loadingIn : loadingOut;
  const isError = tab === 'incoming' ? errorIn : errorOut;
  const refetch = tab === 'incoming' ? refetchIn : refetchOut;

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const timeAgo = (dateStr: string) => {
    const diff = RELATIVE_TIME_REFERENCE - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const statusClass = (status: string) => {
    const map: Record<string, string> = {
      pending: styles.statusPending,
      accepted: styles.statusAccepted,
      declined: styles.statusDeclined,
      expired: styles.statusExpired,
      cancelled: styles.statusCancelled,
      scheduled: styles.statusScheduled,
    };
    return map[status] || '';
  };

  const openSchedulingModal = (req: MatchRequest) => {
    setSchedulingMatch(req);
    // Set default date/time to tomorrow at 10 AM local time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    // format as YYYY-MM-DDThh:mm
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(tomorrow.getTime() - tzOffset)).toISOString().slice(0, 16);
    setScheduledAt(localISOTime);
    setDuration(60);
    setMeetingLink('');
    setNotes('');
  };

  const handleScheduleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingMatch) return;

    const partnerId = tab === 'incoming' ? schedulingMatch.requesterId : schedulingMatch.recipientId;

    try {
      await api.post('/api/v1/sessions', {
        partnerId,
        interviewTypeId: schedulingMatch.interviewTypeId,
        matchRequestId: schedulingMatch.id,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(duration),
        meetingLink: meetingLink.trim(),
        notes: notes.trim() || undefined,
      });

      toast.success('Session Scheduled', 'Your practice session has been successfully scheduled.');
      setSchedulingMatch(null);
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      window.location.href = '/sessions';
    } catch (err) {
      toast.error('Failed to schedule session', (err as Error).message || 'An unexpected error occurred. Please try again.');
    }
  };

  return (
    <AppShell title="Match Requests">
      <title>Match Requests | PairPrep</title>
      <meta name="description" content="Review incoming and outgoing peer mock interview match requests. Accept, decline, or schedule mock practice sessions." />
      <div className={styles.matches}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'incoming' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('incoming')}
          >
            Incoming {incoming?.content?.length ? `(${incoming.content.length})` : ''}
          </button>
          <button
            className={`${styles.tab} ${tab === 'outgoing' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('outgoing')}
          >
            Outgoing {outgoing?.content?.length ? `(${outgoing.content.length})` : ''}
          </button>
        </div>

        {loading && (
          <SkeletonStack>
            {[1, 2, 3].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </SkeletonStack>
        )}

        {!loading && isError && (
          <ErrorState
            title="Failed to load requests"
            message="There was an error retrieving your match requests. Please check your network connection and try again."
            onRetry={refetch}
          />
        )}

        {!loading && !isError && requests && requests.length > 0 && (
          <>
          <div className={styles.requestList}>
            {paginatedRequests.map((req, idx) => {
              const partnerAvatarUrl = tab === 'incoming' ? req.requesterAvatarUrl : req.recipientAvatarUrl;
              const partnerLinkedin = tab === 'incoming' ? req.requesterLinkedin : req.recipientLinkedin;
              const partnerGithub = tab === 'incoming' ? req.requesterGithub : req.recipientGithub;
              const partnerLeetcode = tab === 'incoming' ? req.requesterLeetcode : req.recipientLeetcode;

              return (
                <div
                  key={req.id}
                  className={styles.requestCard}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <div className={styles.requestAvatar}>
                    {getAvatarUrl(partnerAvatarUrl) ? (
                      <img src={getAvatarUrl(partnerAvatarUrl) || ''} alt="Avatar" className={styles.avatarImage} />
                    ) : (
                      getInitials(tab === 'incoming' ? req.requesterDisplayName : req.recipientDisplayName)
                    )}
                  </div>
                  <div className={styles.requestBody}>
                    <div className={styles.requestNameRow}>
                      <div
                        className={styles.requestName}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setPreviewingProfile(req)}
                        title="Click to view candidate profile"
                      >
                        {tab === 'incoming' ? req.requesterDisplayName : req.recipientDisplayName}
                      </div>
                      <div className={styles.partnerSocials}>
                        {partnerLinkedin && (
                          <a href={partnerLinkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <Linkedin size={14} />
                          </a>
                        )}
                        {partnerGithub && (
                          <a href={partnerGithub} target="_blank" rel="noopener noreferrer" title="GitHub">
                            <Github size={14} />
                          </a>
                        )}
                        {partnerLeetcode && (
                          <a href={partnerLeetcode} target="_blank" rel="noopener noreferrer" title="LeetCode">
                            <Code size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className={styles.requestType}>{req.interviewTypeName}</div>
                    {req.message && <div className={styles.requestMessage}>{req.message}</div>}
                    <div className={styles.requestTime}>{timeAgo(req.createdAt)}</div>
                  </div>

                <span className={`${styles.requestStatus} ${statusClass(req.status)}`}>
                  {req.status}
                </span>

                {req.status === 'pending' && (
                  <div className={styles.requestActions}>
                    {tab === 'incoming' ? (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewingProfile(req)}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => acceptMutation.mutate(req.id)}
                          loading={acceptMutation.isPending}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => declineMutation.mutate(req.id)}
                          loading={declineMutation.isPending}
                        >
                          Decline
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelMutation.mutate(req.id)}
                        loading={cancelMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                )}

                {req.status === 'accepted' && (
                  <div className={styles.requestActions}>
                    <Button
                      size="sm"
                      onClick={() => openSchedulingModal(req)}
                    >
                      Schedule
                    </Button>
                  </div>
                )}
              </div>
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

        {!loading && !isError && (!requests || requests.length === 0) && (
          <EmptyState
            icon={<AppIcon name={tab === 'incoming' ? 'inbox' : 'external'} size={28} />}
            title={`No ${tab} requests`}
            message={
              tab === 'incoming'
                ? 'When someone sends you a match request, it will appear here.'
                : 'Send match requests from the Discover page to get started.'
            }
          />
        )}

        {/* Scheduling Modal */}
        {schedulingMatch && (
          <div className={styles.modalOverlay} onClick={() => setSchedulingMatch(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Schedule Mock Interview</h3>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setSchedulingMatch(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <p className={styles.modalSubtitle}>
                Schedule a <strong>{schedulingMatch.interviewTypeName}</strong> session with{' '}
                <strong>
                  {tab === 'incoming'
                    ? schedulingMatch.requesterDisplayName
                    : schedulingMatch.recipientDisplayName}
                </strong>:
              </p>

              <form onSubmit={handleScheduleConfirm} className={styles.modalForm}>
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Date & Time</label>
                  <input
                    type="datetime-local"
                    className={styles.input}
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Duration (Minutes)</label>
                  <select
                    className={styles.select}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    required
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>

                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Meeting Link (Zoom / Meet / Jitsi)</label>
                  <input
                    type="url"
                    className={styles.input}
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    required
                  />
                </div>

                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Preparation Notes (Optional)</label>
                  <textarea
                    className={styles.textarea}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="E.g., Let's focus on system design for a chat application. Bring your diagrams!"
                    rows={3}
                  />
                </div>

                <div className={styles.modalActions}>
                  <Button type="button" variant="ghost" onClick={() => setSchedulingMatch(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Schedule Session
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Preview Modal */}
        {previewingProfile && (
          <div className={styles.modalOverlay} onClick={() => setPreviewingProfile(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Candidate Profile Preview</h3>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setPreviewingProfile(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div className={styles.profileModalBody}>
                <div className={styles.profileHeaderRow}>
                  <div className={styles.profileAvatarBig}>
                    {getAvatarUrl(
                      tab === 'incoming'
                        ? previewingProfile.requesterAvatarUrl
                        : previewingProfile.recipientAvatarUrl
                    ) ? (
                      <img
                        src={getAvatarUrl(
                          tab === 'incoming'
                            ? previewingProfile.requesterAvatarUrl
                            : previewingProfile.recipientAvatarUrl
                        ) || ''}
                        alt="Avatar"
                        className={styles.avatarImage}
                      />
                    ) : (
                      getInitials(
                        tab === 'incoming'
                          ? previewingProfile.requesterDisplayName
                          : previewingProfile.recipientDisplayName
                      )
                    )}
                  </div>
                  <div>
                    <h4 className={styles.profileNameText}>
                      {tab === 'incoming'
                        ? previewingProfile.requesterDisplayName
                        : previewingProfile.recipientDisplayName}
                    </h4>
                    <span className={styles.experienceBadge}>
                      {((tab === 'incoming'
                        ? previewingProfile.requesterExperienceLevel
                        : previewingProfile.recipientExperienceLevel) || 'Not set').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className={styles.profileStatsRow}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Avg Rating</span>
                    <span className={styles.statValue}>
                      {(tab === 'incoming'
                        ? previewingProfile.requesterAvgRating
                        : previewingProfile.recipientAvgRating)
                        ? `${(tab === 'incoming'
                            ? previewingProfile.requesterAvgRating
                            : previewingProfile.recipientAvgRating)?.toFixed(1)} ★`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Sessions Completed</span>
                    <span className={styles.statValue}>
                      {tab === 'incoming'
                        ? previewingProfile.requesterSessionsCompleted
                        : previewingProfile.recipientSessionsCompleted}
                    </span>
                  </div>
                </div>

                <div className={styles.profileBioSection}>
                  <h5 className={styles.sectionLabel}>Biography</h5>
                  <p className={styles.bioText}>
                    {(tab === 'incoming'
                      ? previewingProfile.requesterBio
                      : previewingProfile.recipientBio) || 'No biography provided.'}
                  </p>
                </div>

                <div className={styles.profileSocialSection}>
                  <h5 className={styles.sectionLabel}>Professional Links</h5>
                  <div className={styles.socialIconsRow}>
                    {(tab === 'incoming' ? previewingProfile.requesterLinkedin : previewingProfile.recipientLinkedin) ? (
                      <a
                        href={(tab === 'incoming' ? previewingProfile.requesterLinkedin : previewingProfile.recipientLinkedin) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLinkIcon}
                      >
                        <Linkedin size={18} /> LinkedIn
                      </a>
                    ) : null}
                    {(tab === 'incoming' ? previewingProfile.requesterGithub : previewingProfile.recipientGithub) ? (
                      <a
                        href={(tab === 'incoming' ? previewingProfile.requesterGithub : previewingProfile.recipientGithub) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLinkIcon}
                      >
                        <Github size={18} /> GitHub
                      </a>
                    ) : null}
                    {(tab === 'incoming' ? previewingProfile.requesterLeetcode : previewingProfile.recipientLeetcode) ? (
                      <a
                        href={(tab === 'incoming' ? previewingProfile.requesterLeetcode : previewingProfile.recipientLeetcode) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLinkIcon}
                      >
                        <Code size={18} /> LeetCode
                      </a>
                    ) : null}
                    {!(tab === 'incoming'
                      ? previewingProfile.requesterLinkedin || previewingProfile.requesterGithub || previewingProfile.requesterLeetcode
                      : previewingProfile.recipientLinkedin || previewingProfile.recipientGithub || previewingProfile.recipientLeetcode
                    ) && <span className={styles.noLinksText}>No public links provided.</span>}
                  </div>
                </div>

                {previewingProfile.message && (
                  <div className={styles.profileBioSection}>
                    <h5 className={styles.sectionLabel}>Match Request Message</h5>
                    <div className={styles.requestMessageContent}>
                      &ldquo;{previewingProfile.message}&rdquo;
                    </div>
                  </div>
                )}
              </div>

              {previewingProfile.status === 'pending' && tab === 'incoming' && (
                <div className={styles.modalActions}>
                  <Button
                    onClick={() => {
                      acceptMutation.mutate(previewingProfile.id);
                      setPreviewingProfile(null);
                    }}
                    loading={acceptMutation.isPending}
                  >
                    Accept Match
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      declineMutation.mutate(previewingProfile.id);
                      setPreviewingProfile(null);
                    }}
                    loading={declineMutation.isPending}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
