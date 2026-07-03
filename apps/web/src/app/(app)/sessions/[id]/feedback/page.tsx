'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { AppIcon } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { AppShell } from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import styles from './feedback.module.css';

function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.ratingGroup}>
      <span className={styles.ratingLabel}>{label}</span>
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`${styles.star} ${n <= value ? styles.starActive : ''}`}
            onClick={() => onChange(n)}
          >
            <AppIcon name="star" size={22} strokeWidth={n <= value ? 2.3 : 1.8} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackPage() {
  const toast = useToast();
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [overall, setOverall] = useState(0);
  const [technicalDepth, setTechnicalDepth] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [problemSolving, setProblemSolving] = useState(0);
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [wouldPracticeAgain, setWouldPracticeAgain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = overall > 0 && strengths.length >= 5 && improvements.length >= 5 && wouldPracticeAgain;

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post(`/api/v1/sessions/${sessionId}/feedback`, {
        overallRating: overall,
        technicalScore: technicalDepth || 1,
        communicationScore: communication || 1,
        problemSolvingScore: problemSolving || 1,
        strengths,
        improvements,
        notes: wouldPracticeAgain ? `Would practice again: ${wouldPracticeAgain}` : '',
      });
      toast.success('Feedback Submitted', 'Thank you for helping your partner improve!');
      setSubmitted(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast.error('Failed to submit feedback', err.message);
      } else {
        setError('Something went wrong');
        toast.error('Failed to submit feedback', 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AppShell title="Feedback Submitted">
        <div className={styles.feedback}>
          <div className={styles.successCard}>
            <div className={styles.successIcon}>
              <AppIcon name="check" size={34} />
            </div>
            <div className={styles.successTitle}>Feedback Submitted!</div>
            <div className={styles.successDesc}>Thanks for helping your partner improve.</div>
            <Button onClick={() => router.push('/sessions')}>Back to Sessions</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Leave Feedback">
      <title>Leave Practice Feedback | PairPrep</title>
      <meta name="description" content="Submit structured peer review and ratings for your completed mock interview session on PairPrep." />
      <div className={styles.feedback}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>How was the session?</h2>
          <p className={styles.cardDesc}>Your feedback helps partners improve and builds your trust score.</p>

          {error && (
            <div style={{ padding: 'var(--space-1-5) var(--space-2)', background: 'var(--danger-muted)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--danger)', marginBottom: 'var(--space-3)' }}>
              {error}
            </div>
          )}

          <div className={styles.form}>
            <StarRating label="Overall Rating *" value={overall} onChange={setOverall} />
            <StarRating label="Technical Depth" value={technicalDepth} onChange={setTechnicalDepth} />
            <StarRating label="Communication" value={communication} onChange={setCommunication} />
            <StarRating label="Problem Solving" value={problemSolving} onChange={setProblemSolving} />

            <Textarea
              label="Strengths *"
              placeholder="What did your partner do well?"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={3}
            />

            <Textarea
              label="Areas for Improvement *"
              placeholder="What could they work on?"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              rows={3}
            />

            <div className={styles.toggleGroup}>
              <span className={styles.toggleLabel}>Would you practice with them again? *</span>
              <div className={styles.toggleOptions}>
                {['yes', 'maybe', 'no'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`${styles.toggleOption} ${wouldPracticeAgain === opt ? styles.toggleOptionActive : ''}`}
                    onClick={() => setWouldPracticeAgain(opt)}
                  >
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="ghost" onClick={() => router.back()}>Skip</Button>
              <Button onClick={handleSubmit} disabled={!canSubmit} loading={loading}>
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
