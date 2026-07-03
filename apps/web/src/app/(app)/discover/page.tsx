'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Linkedin, Github, Leetcode as Code } from '@/components/icons/SocialIcons';
import { AppIcon } from '@/components/icons/AppIcon';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { api, getAvatarUrl } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { SkeletonGrid, SkeletonCard, ErrorState, EmptyState } from '@/components/ui/Skeleton';
import styles from './discover.module.css';

interface InterviewType {
  id: string;
  name: string;
  slug: string;
}

interface Partner {
  profileId: string;
  userId: string;
  displayName: string;
  bio: string;
  experienceLevel: string;
  avatarUrl: string | null;
  sessionsCompleted: number;
  avgRating: number | null;
  ratingCount: number;
  linkedin: string | null;
  github: string | null;
  leetcode: string | null;
  interests: { id: string; name: string; slug: string }[];
  availability: { day: string; slot: string }[];
  relevanceScore: number;
}

export default function DiscoverPage() {
  const toast = useToast();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [sendingTo, setSendingTo] = useState<string | null>(null);
  
  // Search and Pagination States
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Modal state
  const [requestModalPartner, setRequestModalPartner] = useState<Partner | null>(null);
  const [viewingPartner, setViewingPartner] = useState<Partner | null>(null);
  const [selectedInterestId, setSelectedInterestId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');

  const { data: types = [] } = useQuery({
    queryKey: ['interview-types'],
    queryFn: () => api.get<InterviewType[]>('/api/v1/interview-types'),
  });

  const { data: pagedData, isLoading, isError, refetch } = useQuery({
    queryKey: ['discover', selectedTypes, selectedLevel, searchQuery, page],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      selectedTypes.forEach((type) => queryParams.append('types', type));
      if (selectedLevel) queryParams.set('level', selectedLevel);
      if (searchQuery) queryParams.set('search', searchQuery);
      queryParams.set('page', String(page));
      queryParams.set('limit', '10');
      return api.get<{ content: Partner[]; totalElements: number }>(`/api/v1/discover?${queryParams.toString()}`);
    },
  });

  const partners = pagedData?.content || [];
  const totalElements = pagedData?.totalElements || 0;
  const totalPages = Math.max(1, Math.ceil(totalElements / 10));

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((type) => type !== id) : [...prev, id],
    );
    setPage(1);
  };

  const handleLevelSelect = (level: string) => {
    setSelectedLevel(selectedLevel === level ? '' : level);
    setPage(1);
  };

  const openRequestModal = (partner: Partner) => {
    if (!partner.interests.length) return;
    setRequestModalPartner(partner);
    setSelectedInterestId(partner.interests[0].id);
    setCustomMessage('');
  };

  const handleSendRequestConfirm = async () => {
    if (!requestModalPartner || !selectedInterestId) return;

    const selectedInterest = requestModalPartner.interests.find((i) => i.id === selectedInterestId);
    if (!selectedInterest) return;

    setSendingTo(requestModalPartner.userId);
    try {
      const finalMessage = customMessage.trim() || `Hi! I'd love to practice ${selectedInterest.name} together.`;
      await api.post('/api/v1/match-requests', {
        recipientId: requestModalPartner.userId,
        interviewTypeId: selectedInterestId,
        message: finalMessage,
      });
      toast.success('Request sent successfully!', `A mock interview request has been sent to ${requestModalPartner.displayName}.`);
      setRequestModalPartner(null);
      refetch();
    } catch (err) {
      toast.error('Failed to send request', (err as Error).message || 'An unexpected error occurred. Please try again.');
    } finally {
      setSendingTo(null);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getLevelClass = (level: string) => {
    if (level === 'junior') return styles.partnerLevelJunior;
    if (level === 'mid') return styles.partnerLevelMid;
    return styles.partnerLevelSenior;
  };

  const activeInterest = requestModalPartner?.interests.find((i) => i.id === selectedInterestId);

  return (
    <AppShell title="Discover Partners">
      <title>Discover Partners | PairPrep</title>
      <meta name="description" content="Find peer mock interview partners matching your target level and interview type focus areas like Backend, System Design, and DSA." />
      <div className={styles.discover}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search partners by name, company, bio, or tags..."
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <div className={styles.filters}>
          {types.map((type) => (
            <button
              key={type.id}
              className={`${styles.filterChip} ${selectedTypes.includes(type.id) ? styles.filterChipActive : ''}`}
              onClick={() => toggleType(type.id)}
              type="button"
            >
              {type.name}
            </button>
          ))}
          {['junior', 'mid', 'senior'].map((level) => (
            <button
              key={level}
              className={`${styles.filterChip} ${selectedLevel === level ? styles.filterChipActive : ''}`}
              onClick={() => handleLevelSelect(level)}
              type="button"
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        {isLoading && (
          <SkeletonGrid>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </SkeletonGrid>
        )}

        {!isLoading && !isError && partners.length > 0 && (
          <>
          <div className={styles.partnerGrid}>
            {partners.map((partner, index) => (
              <article
                key={partner.profileId}
                className={styles.partnerCard}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={styles.partnerHeader}>
                  <div className={styles.partnerAvatar}>
                    {getAvatarUrl(partner.avatarUrl) ? (
                      <img src={getAvatarUrl(partner.avatarUrl) || ''} alt={partner.displayName} className={styles.avatarImage} />
                    ) : (
                      getInitials(partner.displayName)
                    )}
                  </div>
                  <div className={styles.partnerInfo}>
                    <div className={styles.partnerName}>{partner.displayName}</div>
                    <div className={styles.partnerMeta}>
                      <span className={`${styles.partnerLevel} ${getLevelClass(partner.experienceLevel)}`}>
                        {partner.experienceLevel}
                      </span>
                      
                      <div className={styles.partnerSocials}>
                        {partner.linkedin && (
                          <a href={partner.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                            <Linkedin size={14} />
                          </a>
                        )}
                        {partner.github && (
                          <a href={partner.github} target="_blank" rel="noopener noreferrer" title="GitHub">
                            <Github size={14} />
                          </a>
                        )}
                        {partner.leetcode && (
                          <a href={partner.leetcode} target="_blank" rel="noopener noreferrer" title="LeetCode">
                            <Code size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={styles.matchScore}>
                    {Math.round(partner.relevanceScore * 100)}%
                  </span>
                </div>

                {partner.bio && <p className={styles.partnerBio}>{partner.bio}</p>}

                <div className={styles.partnerTags}>
                  {partner.interests.map((interest) => (
                    <span key={interest.id} className={styles.tag}>
                      {interest.name}
                    </span>
                  ))}
                </div>

                <div className={styles.partnerStats}>
                  <span className={styles.stat}>
                    <AppIcon name="sessions" size={16} />
                    <span className={styles.statHighlight}>{partner.sessionsCompleted}</span> sessions
                  </span>
                  <span className={styles.stat}>
                    <AppIcon name="star" size={16} />
                    <span className={styles.statHighlight}>{partner.avgRating?.toFixed(1) ?? '-'}</span>
                    {partner.ratingCount > 0 && ` (${partner.ratingCount})`}
                  </span>
                </div>

                <div className={styles.partnerActions}>
                  <Button
                    size="sm"
                    onClick={() => openRequestModal(partner)}
                  >
                    Send Request
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setViewingPartner(partner)}>
                    View Profile
                  </Button>
                </div>
              </article>
            ))}
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

        {!isLoading && isError && (
          <ErrorState
            title="Unable to load partners"
            message="We had trouble fetching potential mock interview partners. Please check your internet connection and try again."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && partners.length === 0 && (
          <EmptyState
            icon={<AppIcon name="discover" size={28} />}
            title="No partners found"
            message="Partners only appear after they complete their full profile (bio, experience level, interview interests, and availability). Try removing some filters or check back later."
          />
        )}

        {/* Custom Match Request Modal */}
        {requestModalPartner && (
          <div className={styles.modalOverlay} onClick={() => setRequestModalPartner(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Send Match Request</h3>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setRequestModalPartner(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <p className={styles.modalSubtitle}>
                Choose what you want to practice with <strong>{requestModalPartner.displayName}</strong>:
              </p>

              <div className={styles.modalField}>
                <label className={styles.fieldLabel}>Practice Topic</label>
                <div className={styles.interestSelectGrid}>
                  {requestModalPartner.interests.map((interest) => {
                    const isSelected = selectedInterestId === interest.id;
                    return (
                      <button
                        key={interest.id}
                        type="button"
                        className={`${styles.interestSelectCard} ${isSelected ? styles.interestSelectCardActive : ''}`}
                        onClick={() => setSelectedInterestId(interest.id)}
                      >
                        {interest.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.modalField}>
                <label className={styles.fieldLabel}>Message (Optional)</label>
                <textarea
                  className={styles.textarea}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder={`Hi! I'd love to practice ${activeInterest?.name || ''} together.`}
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setRequestModalPartner(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSendRequestConfirm}
                  loading={sendingTo === requestModalPartner.userId}
                >
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* View Profile Modal */}
        {viewingPartner && (
          <div className={styles.modalOverlay} onClick={() => setViewingPartner(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>{viewingPartner.displayName}</h3>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => setViewingPartner(null)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <div className={styles.partnerAvatar} style={{ width: 56, height: 56, fontSize: 'var(--text-lg)' }}>
                  {getAvatarUrl(viewingPartner.avatarUrl) ? (
                    <img src={getAvatarUrl(viewingPartner.avatarUrl) || ''} alt={viewingPartner.displayName} className={styles.avatarImage} />
                  ) : (
                    getInitials(viewingPartner.displayName)
                  )}
                </div>
                <div>
                  <span className={`${styles.partnerLevel} ${getLevelClass(viewingPartner.experienceLevel)}`}>
                    {viewingPartner.experienceLevel}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', marginTop: 6 }}>
                    {viewingPartner.linkedin && (
                      <a href={viewingPartner.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: 'var(--text-tertiary)' }}>
                        <Linkedin size={16} />
                      </a>
                    )}
                    {viewingPartner.github && (
                      <a href={viewingPartner.github} target="_blank" rel="noopener noreferrer" title="GitHub" style={{ color: 'var(--text-tertiary)' }}>
                        <Github size={16} />
                      </a>
                    )}
                    {viewingPartner.leetcode && (
                      <a href={viewingPartner.leetcode} target="_blank" rel="noopener noreferrer" title="LeetCode" style={{ color: 'var(--text-tertiary)' }}>
                        <Code size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {viewingPartner.bio && (
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>About</label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                    {viewingPartner.bio}
                  </p>
                </div>
              )}

              <div className={styles.modalField}>
                <label className={styles.fieldLabel}>Interests</label>
                <div className={styles.partnerTags}>
                  {viewingPartner.interests.map((interest) => (
                    <span key={interest.id} className={styles.tag}>{interest.name}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Sessions </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{viewingPartner.sessionsCompleted}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Rating </span>
                  <strong style={{ color: 'var(--text-primary)' }}>{viewingPartner.avgRating?.toFixed(1) ?? '-'}</strong>
                  {viewingPartner.ratingCount > 0 && <span style={{ color: 'var(--text-tertiary)' }}> ({viewingPartner.ratingCount})</span>}
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Match </span>
                  <strong style={{ color: 'var(--success)' }}>{Math.round(viewingPartner.relevanceScore * 100)}%</strong>
                </div>
              </div>

              {viewingPartner.availability.length > 0 && (
                <div className={styles.modalField}>
                  <label className={styles.fieldLabel}>Availability</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-0-5)' }}>
                    {viewingPartner.availability.map((slot) => (
                      <span key={`${slot.day}-${slot.slot}`} className={styles.tag}>
                        {slot.day} — {slot.slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <Button variant="ghost" onClick={() => setViewingPartner(null)}>
                  Close
                </Button>
                <Button onClick={() => { setViewingPartner(null); openRequestModal(viewingPartner); }}>
                  Send Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
