'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { SkeletonCard, ErrorState } from '@/components/ui/Skeleton';
import styles from './room.module.css';

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

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const user = useAuthStore((s) => s.user);

  const [notesText, setNotesText] = useState(
    `// PairPrep Mock Interview Workspace\n// Write your code, thoughts, or feedback here.\n\n`
  );

  const { data: session, isLoading, isError, refetch } = useQuery({
    queryKey: ['session-room', sessionId],
    queryFn: () => api.get<SessionItem>(`/api/v1/sessions/${sessionId}`),
    enabled: !!sessionId,
  });

  if (isLoading) {
    return (
      <AppShell title="Mock Interview Room">
        <div style={{ padding: 'var(--space-4)' }}>
          <SkeletonCard />
        </div>
      </AppShell>
    );
  }

  if (isError || !session) {
    return (
      <AppShell title="Mock Interview Room">
        <ErrorState
          title="Could not join room"
          message="We failed to retrieve the details for this practice session. Make sure the ID is correct."
          onRetry={refetch}
        />
      </AppShell>
    );
  }

  const partnerName =
    session.schedulerId === user?.id ? session.partnerDisplayName : session.schedulerDisplayName;

  // Generate unique room name using the session UUID
  const jitsiRoomName = `pairprep-${session.id}`;
  const jitsiUrl = `https://meet.jit.si/${jitsiRoomName}#userInfo.displayName="${encodeURIComponent(
    user?.displayName || 'Developer'
  )}"&config.prejoinPageEnabled=false`;

  return (
    <AppShell title="Mock Interview Room">
      <title>Interview Workspace | PairPrep</title>
      <meta name="description" content="Collaborative side-by-side video call and code/notes editor workspace." />
      
      <div className={styles.roomContainer}>
        <div className={styles.roomHeader}>
          <div>
            <h2 className={styles.roomTitle}>
              {session.interviewTypeName} Mock Round
            </h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Practicing with <strong>{partnerName}</strong>
            </p>
          </div>
          <div className={styles.roomActions}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                router.push('/sessions');
              }}
            >
              Exit Room
            </Button>
          </div>
        </div>

        <div className={styles.workspace}>
          {/* Video call pane embedding Jitsi */}
          <div className={styles.videoPane}>
            <iframe
              src={jitsiUrl}
              className={styles.videoIframe}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
            />
          </div>

          {/* Collaborative text notepad */}
          <div className={styles.editorPane}>
            <div className={styles.editorHeader}>
              <span className={styles.editorTitle}>Scratchpad / Workspace</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(notesText);
                  alert('Notes copied to clipboard!');
                }}
                style={{ fontSize: 'var(--text-xs)', padding: 'var(--space-0-5) var(--space-1)' }}
              >
                Copy Notes
              </Button>
            </div>
            <textarea
              className={styles.editorArea}
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="Paste mock prompt, write thoughts, or code drafts..."
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
