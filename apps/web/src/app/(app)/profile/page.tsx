'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, getAvatarUrl } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { AppShell } from '@/components/layout/AppShell';
import { useToast } from '@/components/ui/Toast';
import { SkeletonCard, ErrorState } from '@/components/ui/Skeleton';
import styles from './profile.module.css';

import { Linkedin, Github, Leetcode as Code } from '@/components/icons/SocialIcons';

interface ProfileData {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  experienceLevel: string;
  avatarUrl: string | null;
  timezone: string;
  profileComplete: boolean;
  sessionsCompleted: number;
  avgRating: number | null;
  ratingCount: number;
  linkedin: string | null;
  github: string | null;
  leetcode: string | null;
  isLinkedinPublic: boolean;
  isGithubPublic: boolean;
  isLeetcodePublic: boolean;
  interests: { id: string; name: string }[];
  availability: { day: string; slot: string }[];
}

export default function ProfilePage() {
  const toast = useToast();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editingHeader, setEditingHeader] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editName, setEditName] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editLeetcode, setEditLeetcode] = useState('');
  const [editIsLinkedinPublic, setEditIsLinkedinPublic] = useState(true);
  const [editIsGithubPublic, setEditIsGithubPublic] = useState(true);
  const [editIsLeetcodePublic, setEditIsLeetcodePublic] = useState(true);
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => api.get<ProfileData>('/api/v1/profiles/me'),
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      displayName: string;
      bio: string;
      avatarUrl?: string | null;
      linkedin?: string;
      github?: string;
      leetcode?: string;
      isLinkedinPublic?: boolean;
      isGithubPublic?: boolean;
      isLeetcodePublic?: boolean;
    }) => api.put('/api/v1/profiles/me', data),
    onSuccess: () => {
      toast.success('Profile Updated', 'Your profile details have been saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setEditing(false);
      setEditingHeader(false);
    },
    onError: (err: Error) => {
      toast.error('Failed to update profile', err.message || 'Please try again.');
    },
  });

  const startEditing = () => {
    if (profile) {
      setEditBio(profile.bio || '');
    }
    setEditing(true);
  };

  const startEditingHeader = () => {
    if (profile) {
      setEditName(profile.displayName);
      setEditLinkedin(profile.linkedin || '');
      setEditGithub(profile.github || '');
      setEditLeetcode(profile.leetcode || '');
      setEditIsLinkedinPublic(profile.isLinkedinPublic ?? true);
      setEditIsGithubPublic(profile.isGithubPublic ?? true);
      setEditIsLeetcodePublic(profile.isLeetcodePublic ?? true);
      setEditAvatarUrl(profile.avatarUrl || null);
    }
    setEditingHeader(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert('File size too large. Please select an image under 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const getLevelClass = (level: string) => {
    if (level === 'junior') return styles.levelJunior;
    if (level === 'mid') return styles.levelMid;
    return styles.levelSenior;
  };

  if (isLoading) {
    return (
      <AppShell title="Profile">
        <div style={{ padding: 'var(--space-4)' }}>
          <SkeletonCard />
        </div>
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="Profile">
        <ErrorState
          title="Could not load profile"
          message="We failed to retrieve your profile details. Please try again."
          onRetry={refetch}
        />
      </AppShell>
    );
  }

  if (!profile) return null;

  return (
    <AppShell title="Profile">
      <title>My Profile | PairPrep</title>
      <meta name="description" content="View and customize your PairPrep profile: bio, social profiles, experience level, target interview types, and session statistics." />
      <div className={styles.profile}>
        {/* Header */}
        <div className={styles.profileHeader}>
          {!editingHeader ? (
            <>
              <div className={styles.avatar}>
                {getAvatarUrl(profile.avatarUrl) ? (
                  <img src={getAvatarUrl(profile.avatarUrl) || ''} alt={profile.displayName} className={styles.avatarImage} />
                ) : (
                  getInitials(profile.displayName)
                )}
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.name}>{profile.displayName}</div>
                <div className={styles.email}>{user?.email}</div>
                
                <div className={styles.socialRow}>
                  {profile.linkedin && (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="LinkedIn Profile"
                    >
                      <Linkedin size={14} />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {profile.github && (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="GitHub Profile"
                    >
                      <Github size={14} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {profile.leetcode && (
                    <a
                      href={profile.leetcode}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      title="LeetCode Profile"
                    >
                      <Code size={14} />
                      <span>LeetCode</span>
                    </a>
                  )}
                </div>

                <div className={styles.headerStats}>
                  <div className={styles.headerStat}>
                    <div className={styles.headerStatValue}>{profile.sessionsCompleted}</div>
                    <div className={styles.headerStatLabel}>Sessions</div>
                  </div>
                  <div className={styles.headerStat}>
                    <div className={styles.headerStatValue}>{profile.avgRating?.toFixed(1) ?? '-'}</div>
                    <div className={styles.headerStatLabel}>Rating</div>
                  </div>
                  <div className={styles.headerStat}>
                    <div className={styles.headerStatValue}>{profile.ratingCount}</div>
                    <div className={styles.headerStatLabel}>Reviews</div>
                  </div>
                </div>
              </div>
              <div style={{ alignSelf: 'flex-start' }}>
                <Button variant="ghost" size="sm" onClick={startEditingHeader}>
                  Edit
                </Button>
              </div>
            </>
          ) : (
            <div className={styles.editForm} style={{ width: '100%' }}>
              <div className={styles.editAvatarContainer}>
                <div className={styles.editAvatarPreview}>
                  {getAvatarUrl(editAvatarUrl) ? (
                    <img src={getAvatarUrl(editAvatarUrl) || ''} alt="Avatar preview" />
                  ) : (
                    getInitials(editName || profile.displayName)
                  )}
                </div>
                <div className={styles.avatarUploadSection}>
                  <label className={styles.avatarUploadLabel}>
                    Choose Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {editAvatarUrl && (
                    <button
                      type="button"
                      className={styles.avatarRemoveBtn}
                      onClick={() => setEditAvatarUrl(null)}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <Input label="Display Name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              
              <div className={styles.formSection}>
                <h4 className={styles.formSectionTitle}>Social Connections</h4>
                
                <div className={styles.socialInputField}>
                  <div className={styles.socialInputWrapper}>
                    <Linkedin size={16} className={styles.socialInputIcon} />
                    <input
                      type="url"
                      className={styles.formInput}
                      placeholder="https://linkedin.com/in/username"
                      value={editLinkedin}
                      onChange={(e) => setEditLinkedin(e.target.value)}
                    />
                  </div>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={editIsLinkedinPublic}
                      onChange={(e) => setEditIsLinkedinPublic(e.target.checked)}
                    />
                    <span>Public</span>
                  </label>
                </div>

                <div className={styles.socialInputField}>
                  <div className={styles.socialInputWrapper}>
                    <Github size={16} className={styles.socialInputIcon} />
                    <input
                      type="url"
                      className={styles.formInput}
                      placeholder="https://github.com/username"
                      value={editGithub}
                      onChange={(e) => setEditGithub(e.target.value)}
                    />
                  </div>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={editIsGithubPublic}
                      onChange={(e) => setEditIsGithubPublic(e.target.checked)}
                    />
                    <span>Public</span>
                  </label>
                </div>

                <div className={styles.socialInputField}>
                  <div className={styles.socialInputWrapper}>
                    <Code size={16} className={styles.socialInputIcon} />
                    <input
                      type="url"
                      className={styles.formInput}
                      placeholder="https://leetcode.com/username"
                      value={editLeetcode}
                      onChange={(e) => setEditLeetcode(e.target.value)}
                    />
                  </div>
                  <label className={styles.toggleLabel}>
                    <input
                      type="checkbox"
                      checked={editIsLeetcodePublic}
                      onChange={(e) => setEditIsLeetcodePublic(e.target.checked)}
                    />
                    <span>Public</span>
                  </label>
                </div>
              </div>

              <div className={styles.editActions}>
                <Button variant="ghost" size="sm" onClick={() => setEditingHeader(false)}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={() =>
                    updateMutation.mutate({
                      displayName: editName,
                      avatarUrl: editAvatarUrl,
                      linkedin: editLinkedin,
                      github: editGithub,
                      leetcode: editLeetcode,
                      isLinkedinPublic: editIsLinkedinPublic,
                      isGithubPublic: editIsGithubPublic,
                      isLeetcodePublic: editIsLeetcodePublic,
                      bio: profile.bio || '',
                    }, {
                      onSuccess: () => {
                        setEditingHeader(false);
                      }
                    })
                  }
                  loading={updateMutation.isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* About Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>About</h2>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={startEditing}>
                Edit
              </Button>
            )}
          </div>

          {!editing ? (
            <>
              <p className={styles.bio}>{profile.bio || 'No bio yet.'}</p>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <span className={`${styles.levelBadge} ${getLevelClass(profile.experienceLevel)}`}>
                  {profile.experienceLevel}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.editForm}>
              <Textarea label="Bio" value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} />
              
              <div className={styles.editActions}>
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                <Button
                  size="sm"
                  onClick={() =>
                    updateMutation.mutate({
                      displayName: profile.displayName,
                      bio: editBio,
                    }, {
                      onSuccess: () => {
                        setEditing(false);
                      }
                    })
                  }
                  loading={updateMutation.isPending}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Interests */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Interview Interests</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/onboarding'}>
              Edit
            </Button>
          </div>
          <div className={styles.tags}>
            {profile.interests?.length ? (
              profile.interests.map((i) => (
                <span key={i.id} className={styles.tag}>{i.name}</span>
              ))
            ) : (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>None set</span>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Availability</h2>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/onboarding'}>
              Edit
            </Button>
          </div>
          <div className={styles.availGrid}>
            {profile.availability?.length ? (
              profile.availability.map((a) => (
                <span key={`${a.day}-${a.slot}`} className={styles.availSlot}>
                  {a.day.slice(0, 3)} / {a.slot}
                </span>
              ))
            ) : (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>None set</span>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
