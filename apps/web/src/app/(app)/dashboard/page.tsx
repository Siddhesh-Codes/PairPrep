'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppIcon, type AppIconName } from '@/components/icons/AppIcon';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import styles from './dashboard.module.css';

interface ProfileStats {
  sessionsCompleted: number;
  avgRating: number | null;
  ratingCount: number;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
}

const ACTIONS: Array<{
  href: string;
  title: string;
  desc: string;
  icon: AppIconName;
}> = [
  {
    href: '/onboarding',
    title: 'Complete Profile',
    desc: 'Set your focus areas, experience level, and weekly availability.',
    icon: 'pencil',
  },
  {
    href: '/discover',
    title: 'Find Partners',
    desc: 'Browse peers who match your skill level and interview interests.',
    icon: 'discover',
  },
  {
    href: '/matches',
    title: 'Review Requests',
    desc: 'Accept, decline, or follow up on practice partner requests.',
    icon: 'inbox',
  },
  {
    href: '/sessions',
    title: 'Manage Sessions',
    desc: 'Open upcoming sessions, join meetings, and submit feedback.',
    icon: 'calendar',
  },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  // Fetch profile stats (sessions completed, avg rating)
  const { data: profile } = useQuery({
    queryKey: ['dashboard-profile'],
    queryFn: () => api.get<ProfileStats>('/api/v1/profiles/me'),
    enabled: isAuthenticated,
  });

  // Fetch pending incoming match requests
  const { data: pendingRequests } = useQuery({
    queryKey: ['dashboard-pending'],
    queryFn: () => api.get<PagedResponse<unknown>>('/api/v1/match-requests/incoming?size=1'),
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  // Fetch upcoming (scheduled) sessions
  const { data: upcomingSessions } = useQuery({
    queryKey: ['dashboard-upcoming'],
    queryFn: () => api.get<PagedResponse<unknown>>('/api/v1/sessions?status=scheduled&size=1'),
    enabled: isAuthenticated,
    refetchInterval: 10000,
  });

  const stats: Array<{ label: string; value: string; helper: string; icon: AppIconName }> = [
    {
      label: 'Sessions',
      value: String(profile?.sessionsCompleted ?? 0),
      helper: 'Completed practice rounds',
      icon: 'sessions',
    },
    {
      label: 'Avg Rating',
      value: profile?.avgRating != null ? profile.avgRating.toFixed(1) : '-',
      helper: 'Feedback score after sessions',
      icon: 'star',
    },
    {
      label: 'Pending Requests',
      value: String(pendingRequests?.totalElements ?? 0),
      helper: 'Waiting for response',
      icon: 'inbox',
    },
    {
      label: 'Upcoming',
      value: String(upcomingSessions?.totalElements ?? 0),
      helper: 'Scheduled mock interviews',
      icon: 'calendar',
    },
  ];

  return (
    <AppShell title="Dashboard">
      <title>Dashboard | PairPrep</title>
      <meta name="description" content="Manage your mock interview practice, track completed rounds, view ratings, and check upcoming sessions on your PairPrep command center." />
      <div className={styles.dashboard}>
        <section className={styles.heroPanel}>
          <div>
            <p className={styles.kicker}>Practice command center</p>
            <h2 className={styles.welcomeTitle}>Welcome back, {firstName}</h2>
            <p className={styles.welcomeSubtitle}>
              {user?.profileComplete
                ? 'Your profile is ready. Find your next practice partner and keep the momentum going.'
                : 'Complete your profile to unlock partner discovery and start matching with peers.'}
            </p>
          </div>
          <Link href={user?.profileComplete ? '/discover' : '/onboarding'} className={styles.primaryAction}>
            <AppIcon name={user?.profileComplete ? 'discover' : 'pencil'} />
            {user?.profileComplete ? 'Find Partners' : 'Complete Profile'}
          </Link>
        </section>

        <div className={styles.dashboardGrid}>
          <div className={styles.mainColumn}>
            <section className={styles.statsGrid} aria-label="Practice stats">
              {stats.map((stat) => (
                <article key={stat.label} className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <AppIcon name={stat.icon} />
                  </div>
                  <div>
                    <div className={styles.statLabel}>{stat.label}</div>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statHelper}>{stat.helper}</div>
                  </div>
                </article>
              ))}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Quick actions</h3>
                <p className={styles.sectionDesc}>The most useful next steps are one click away.</p>
              </div>
              <div className={styles.quickActions}>
                {ACTIONS.filter((action) => user?.profileComplete || action.href === '/onboarding').map((action) => (
                  <Link href={action.href} className={styles.actionCard} key={action.href}>
                    <span className={styles.actionIcon}>
                      <AppIcon name={action.icon} />
                    </span>
                    <span className={styles.actionBody}>
                      <span className={styles.actionTitle}>{action.title}</span>
                      <span className={styles.actionDesc}>{action.desc}</span>
                    </span>
                    <AppIcon name="arrowRight" className={styles.actionArrow} />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
