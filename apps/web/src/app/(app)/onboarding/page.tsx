'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { AppIcon, interviewTypeIcon, interviewTypeLabel } from '@/components/icons/AppIcon';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { AppShell } from '@/components/layout/AppShell';
import styles from './onboarding.module.css';
import { Linkedin, Github, Leetcode as Code } from '@/components/icons/SocialIcons';

interface InterviewType {
  id: string;
  name: string;
  slug: string;
  iconName: string;
}

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior', desc: '0-2 years, building foundations' },
  { value: 'mid', label: 'Mid', desc: '2-5 years, growing expertise' },
  { value: 'senior', label: 'Senior', desc: '5+ years, deep knowledge' },
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SLOTS = ['morning', 'afternoon', 'evening'];

const SLOT_LABELS: Record<string, string> = {
  morning: 'Morning (6AM-12PM)',
  afternoon: 'Afternoon (12PM-6PM)',
  evening: 'Evening (6PM-12AM)',
};

const FALLBACK_TYPES: InterviewType[] = [
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    slug: 'dsa',
    iconName: 'coding',
  },
  {
    id: 'backend',
    name: 'Backend Development',
    slug: 'backend',
    iconName: 'server',
  },
  {
    id: 'system-design',
    name: 'System Design',
    slug: 'system-design',
    iconName: 'architecture',
  },
  {
    id: 'behavioral',
    name: 'Behavioral',
    slug: 'behavioral',
    iconName: 'chat',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Step 1: Profile
  const [bio, setBio] = useState('');
  const [level, setLevel] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [isLinkedinPublic, setIsLinkedinPublic] = useState(true);
  const [isGithubPublic, setIsGithubPublic] = useState(true);
  const [isLeetcodePublic, setIsLeetcodePublic] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      alert('File size too large. Please select an image under 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Step 2: Interests
  const [types, setTypes] = useState<InterviewType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Step 3: Availability
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    api
      .get<InterviewType[]>('/api/v1/interview-types')
      .then(setTypes)
      .catch(() => setTypes(FALLBACK_TYPES));
  }, []);

  const toggleType = (id: string) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const toggleSlot = (day: string, slot: string) => {
    const key = `${day}:${slot}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleNext = async () => {
    setLoading(true);
    setFormError('');
    try {
      if (step === 0) {
        await api.put('/api/v1/profiles/me', {
          bio,
          experienceLevel: level,
          avatarUrl,
          linkedin,
          github,
          leetcode,
          isLinkedinPublic,
          isGithubPublic,
          isLeetcodePublic,
        });
        setStep(1);
      } else if (step === 1) {
        await api.put('/api/v1/profiles/me/interests', { interviewTypeIds: selectedTypes });
        setStep(2);
      } else if (step === 2) {
        const slots = Array.from(selectedSlots).map((key) => {
          const [day, slot] = key.split(':');
          return { day, slot };
        });
        await api.put('/api/v1/profiles/me/availability', { slots });
        if (user) setUser({ ...user, profileComplete: true });
        router.push('/dashboard');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = step === 0
    ? bio.length >= 10 && level
    : step === 1
    ? selectedTypes.length > 0
    : selectedSlots.size > 0;

  const STEPS = ['Profile', 'Interests', 'Availability'];

  return (
    <AppShell title="Complete Your Profile">
      <div className={styles.onboarding}>
        {/* Progress */}
        <div className={styles.progress}>
          {STEPS.map((s, i) => (
            <div key={s} className={`${styles.progressStep} ${i <= step ? styles.progressStepActive : ''}`}>
              <div className={styles.progressDot}>
                {i < step ? <AppIcon name="check" size={15} /> : i + 1}
              </div>
              <span className={styles.progressLabel}>{s}</span>
            </div>
          ))}
          <div className={styles.progressLine}>
            <div className={styles.progressLineFill} style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
          </div>
        </div>

        <div className={styles.card}>
          {formError && <div className={styles.formError}>{formError}</div>}

          {/* Step 0: Profile */}
          {step === 0 && (
            <>
              <h2 className={styles.cardTitle}>Tell us about yourself</h2>
              <p className={styles.cardDesc}>This helps us match you with the right partners.</p>
              <div className={styles.fields}>
                <div className={styles.editAvatarContainer}>
                  <div className={styles.editAvatarPreview}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar preview" className={styles.avatarImage} />
                    ) : (
                      user?.displayName ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
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
                    {avatarUrl && (
                      <button
                        type="button"
                        className={styles.avatarRemoveBtn}
                        onClick={() => setAvatarUrl(null)}
                      >
                        Remove photo
                      </button>
                    )}
                  </div>
                </div>

                <Textarea
                  label="Bio"
                  placeholder="E.g. SWE at a Series B startup, prepping for FAANG system design interviews..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                />
                <div>
                  <label className={styles.fieldLabel}>Experience Level</label>
                  <div className={styles.levelGrid}>
                    {EXPERIENCE_LEVELS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        className={`${styles.levelCard} ${level === l.value ? styles.levelCardActive : ''}`}
                        onClick={() => setLevel(l.value)}
                      >
                        <div className={styles.levelTitle}>{l.label}</div>
                        <div className={styles.levelDesc}>{l.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formSection}>
                  <h4 className={styles.formSectionTitle}>Social Connections (Optional)</h4>
                  
                  <div className={styles.socialInputField}>
                    <div className={styles.socialInputWrapper}>
                      <Linkedin size={16} className={styles.socialInputIcon} />
                      <input
                        type="url"
                        className={styles.formInput}
                        placeholder="https://linkedin.com/in/username"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                      />
                    </div>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={isLinkedinPublic}
                        onChange={(e) => setIsLinkedinPublic(e.target.checked)}
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
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                      />
                    </div>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={isGithubPublic}
                        onChange={(e) => setIsGithubPublic(e.target.checked)}
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
                        value={leetcode}
                        onChange={(e) => setLeetcode(e.target.value)}
                      />
                    </div>
                    <label className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={isLeetcodePublic}
                        onChange={(e) => setIsLeetcodePublic(e.target.checked)}
                      />
                      <span>Public</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 1: Interests */}
          {step === 1 && (
            <>
              <h2 className={styles.cardTitle}>What do you want to practice?</h2>
              <p className={styles.cardDesc}>Select all interview types you are interested in.</p>
              <div className={styles.typeGrid}>
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`${styles.typeCard} ${selectedTypes.includes(t.id) ? styles.typeCardActive : ''}`}
                    onClick={() => toggleType(t.id)}
                  >
                    <div className={styles.typeIcon}>
                      <AppIcon name={interviewTypeIcon(t.iconName, t.slug)} size={30} />
                    </div>
                    <div className={styles.typeKicker}>{interviewTypeLabel(t.iconName, t.slug)}</div>
                    <div className={styles.typeName}>{t.name}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Availability */}
          {step === 2 && (
            <>
              <h2 className={styles.cardTitle}>When are you available?</h2>
              <p className={styles.cardDesc}>Select the time slots when you can do mock interviews.</p>
              <div className={styles.availGrid}>
                <div className={styles.availHeader}>
                  <div className={styles.availCorner} />
                  {SLOTS.map((s) => (
                    <div key={s} className={styles.availSlotHeader}>{SLOT_LABELS[s]}</div>
                  ))}
                </div>
                {DAYS.map((day) => (
                  <div key={day} className={styles.availRow}>
                    <div className={styles.availDay}>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</div>
                    {SLOTS.map((slot) => {
                      const key = `${day}:${slot}`;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`${styles.availCell} ${selectedSlots.has(key) ? styles.availCellActive : ''}`}
                          onClick={() => toggleSlot(day, slot)}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={!canProceed} loading={loading}>
              {step === 2 ? 'Finish Setup' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
