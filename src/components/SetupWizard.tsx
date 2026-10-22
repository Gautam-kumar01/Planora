import React, { useState, useEffect } from 'react';
import {
  Heart,
  Cake,
  Megaphone,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  DollarSign,
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Wand2,
  Calculator,
  Compass,
  Edit3,
  Sun,
  Home,
  CloudSun,
  HelpCircle,
  Clock,
  Loader2,
  Lightbulb,
} from 'lucide-react';
import { EventType, DateType, OnboardingFormValues } from '../types';

interface SetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: OnboardingFormValues) => Promise<void>;
  isGenerating: boolean;
  initialFormValues?: Partial<OnboardingFormValues> | null;
}

// Regional Benchmark Cost per Guest by Event Type & Tier (PRD Section 11 & FR-14)
const BENCHMARK_COST_PER_GUEST: Record<EventType, Record<'economy' | 'moderate' | 'premium' | 'luxury', number>> = {
  wedding: { economy: 90, moderate: 165, premium: 250, luxury: 420 },
  birthday: { economy: 15, moderate: 25, premium: 45, luxury: 80 },
  community: { economy: 8, moderate: 14, premium: 22, luxury: 40 },
};

export const SetupWizard: React.FC<SetupWizardProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isGenerating,
  initialFormValues,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [form, setForm] = useState<OnboardingFormValues>({
    eventType: 'wedding',
    title: '',
    dateType: 'exact',
    eventDate: '2027-06-20',
    guestCount: 120,
    location: 'Austin, TX',
    totalBudget: 20000,
    currency: 'USD',
    budgetStatus: 'defined',
    budgetTier: 'moderate',
    venueSetting: 'hybrid',
    vibe: 'Warm Terracotta & Botanical Elegance',
    priorities: ['Catering & Cocktails', 'Photography', 'Music & Dancing'],
    dietaryNotes: 'Vegetarian and nut-free options',
    accessibilityNeeds: 'Wheelchair ramp and accessible restrooms',
    constraints: 'Outdoor music curfew at 10:30 PM',
  });

  // Pre-fill from homepage sandbox if provided
  useEffect(() => {
    if (initialFormValues) {
      setForm((prev) => ({
        ...prev,
        ...initialFormValues,
        title: initialFormValues.title || prev.title,
      }));
    }
  }, [initialFormValues]);

  // Synthesis Animation State
  const [synthesisProgress, setSynthesisProgress] = useState(15);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  const ROTATING_TIPS = [
    'Pro Tip: Allocating 8-10% to contingency protects against 95% of unexpected event expenses.',
    'Pro Tip: Booking key vendors 4-6 months prior locks in seasonal menu pricing and preferred dates.',
    'Pro Tip: Grouping guests by shared interests significantly improves table conversation energy.',
    'Pro Tip: Sharing the hourly run of show with vendors minimizes day-of coordination delays.',
  ];

  const SYNTHESIS_STAGES = [
    {
      title: 'Parsing Scale & Demographics',
      desc: `Analyzing ${form.guestCount} guests, ${form.venueSetting} setting in ${form.location || 'selected venue'}`,
      icon: Users,
    },
    {
      title: 'Executing Deterministic Financial Allocations',
      desc: `Distributing ${form.currency} ${form.totalBudget.toLocaleString()} across 7 categories to exactly 100.0% zero-waste + 8% contingency`,
      icon: Calculator,
    },
    {
      title: 'Sequencing Day-of Hourly Run of Show',
      desc: 'Structuring moment-by-moment schedule from setup to post-event teardown',
      icon: Clock,
    },
    {
      title: 'Curating Vendor RFPs & Design Palette',
      desc: `Assembling lead times, key interview questions, and '${form.vibe}' aesthetic palette`,
      icon: Sparkles,
    },
  ];

  useEffect(() => {
    if (!isGenerating) {
      setSynthesisProgress(15);
      setActiveStageIndex(0);
      setElapsedSeconds(0);
      setTipIndex(0);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(elapsed);

      // Smooth progression up to 97%
      setSynthesisProgress(() => {
        if (elapsed < 0.8) {
          setActiveStageIndex(0);
          return Math.min(28, Math.round(15 + elapsed * 16));
        } else if (elapsed < 1.8) {
          setActiveStageIndex(1);
          return Math.min(58, Math.round(28 + (elapsed - 0.8) * 30));
        } else if (elapsed < 2.8) {
          setActiveStageIndex(2);
          return Math.min(86, Math.round(58 + (elapsed - 1.8) * 28));
        } else {
          setActiveStageIndex(3);
          return Math.min(97, Math.round(86 + (elapsed - 2.8) * 5));
        }
      });
    }, 100);

    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length);
    }, 2200);

    return () => {
      clearInterval(interval);
      clearInterval(tipInterval);
    };
  }, [isGenerating]);

  if (!isOpen) return null;

  // Preset fills
  const handleSelectEventType = (type: EventType) => {
    if (type === 'wedding') {
      setForm((prev) => ({
        ...prev,
        eventType: 'wedding',
        title: prev.title || "Sarah & David's Garden Wedding",
        totalBudget: prev.budgetStatus === 'needs_help' ? prev.guestCount * 165 : (prev.totalBudget || 25000),
        guestCount: prev.guestCount || 130,
        venueSetting: 'hybrid',
        vibe: 'Warm Terracotta, Botanical Elegance & Candlelight',
        priorities: ['Catering & Cocktails', 'Photography', 'Florals & Decor'],
      }));
    } else if (type === 'birthday') {
      setForm((prev) => ({
        ...prev,
        eventType: 'birthday',
        title: prev.title || "Noah's 10th Birthday Blast",
        totalBudget: prev.budgetStatus === 'needs_help' ? prev.guestCount * 25 : (prev.totalBudget || 650),
        guestCount: prev.guestCount || 25,
        venueSetting: 'indoor',
        vibe: 'Retro Arcade Neon & High-Energy Fun',
        priorities: ['Interactive Games', 'Custom Cake', 'Allergy-Safe Snacks'],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        eventType: 'community',
        title: prev.title || 'Riverside Earth Day & Block Festival',
        totalBudget: prev.budgetStatus === 'needs_help' ? prev.guestCount * 14 : (prev.totalBudget || 1500),
        guestCount: prev.guestCount || 100,
        venueSetting: 'outdoor',
        vibe: 'Eco-Friendly, Community Unity & Acoustic Harmony',
        priorities: ['Safety & Sanitation', 'Refreshments', 'Permits & Rentals'],
      }));
    }
  };

  const handleBudgetTierChange = (tier: 'economy' | 'moderate' | 'premium' | 'luxury') => {
    const costPerGuest = BENCHMARK_COST_PER_GUEST[form.eventType][tier];
    const estimatedTotal = Math.round(costPerGuest * form.guestCount);
    setForm((prev) => ({
      ...prev,
      budgetTier: tier,
      totalBudget: estimatedTotal,
    }));
  };

  const togglePriority = (tag: string) => {
    setForm((prev) => {
      const exists = prev.priorities.includes(tag);
      return {
        ...prev,
        priorities: exists
          ? prev.priorities.filter((p) => p !== tag)
          : [...prev.priorities, tag],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      title: form.title.trim() || `${form.eventType.toUpperCase()} Celebration`,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ padding: '2rem' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="badge badge-orange">
                {isGenerating ? 'AI Engine • Live Synthesis' : `Wizard • Step ${currentStep} of 5`}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {isGenerating
                  ? 'Deterministic Arithmetic & Gemini 2.5 Flash'
                  : currentStep === 1
                  ? 'Event Foundation'
                  : currentStep === 2
                  ? 'Scale, Time & Setting'
                  : currentStep === 3
                  ? 'Financial Framework & Estimator'
                  : currentStep === 4
                  ? 'Aesthetic & Constraints'
                  : 'Review Inputs & Confirm'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.6rem', marginTop: '0.35rem', color: '#140A05', fontWeight: 800 }}>
              {isGenerating
                ? 'Synthesizing Your Master Plan...'
                : currentStep === 5
                ? 'Review Your Event Plan Draft'
                : 'Create New Event Plan'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="btn-ghost"
            style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, opacity: isGenerating ? 0.4 : 1 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic AI Synthesis Chamber when isGenerating is True */}
        {isGenerating ? (
          <div
            style={{
              padding: '1rem 0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {/* Visual Icon & Status */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 50%, #C2410C 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.85rem auto',
                  boxShadow: '0 0 25px rgba(234, 88, 12, 0.45)',
                  animation: 'pulse 1.8s infinite',
                }}
              >
                <Sparkles size={30} color="#FFFFFF" />
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.85rem',
                  background: 'rgba(234, 88, 12, 0.12)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  borderRadius: '99px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#C2410C',
                  marginBottom: '0.5rem',
                }}
              >
                <Loader2 size={14} className="animate-spin" />
                <span>AI Synthesis Engine Active • {elapsedSeconds.toFixed(1)}s elapsed</span>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                Synthesizing Master Plan for "{form.title || `${form.eventType.toUpperCase()} Celebration`}"
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#6B4226', marginTop: '0.3rem', fontWeight: 500 }}>
                Balancing financial allocations, hourly timeline, and vendor checklists with zero arithmetic errors.
              </p>
            </div>

            {/* Glowing Progress Bar */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(234, 88, 12, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1.25rem',
                boxShadow: '0 4px 20px rgba(45, 24, 15, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.45rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                <span style={{ color: '#140A05' }}>Master Plan Synthesis Progress</span>
                <span style={{ color: '#C2410C', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                  {synthesisProgress}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '10px',
                  background: 'rgba(234, 88, 12, 0.12)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${synthesisProgress}%`,
                    background: 'linear-gradient(90deg, #F97316 0%, #EA580C 50%, #D97706 100%)',
                    borderRadius: '99px',
                    transition: 'width 0.2s ease-out',
                    boxShadow: '0 0 12px rgba(234, 88, 12, 0.5)',
                  }}
                />
              </div>
            </div>

            {/* 4 Milestones Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {SYNTHESIS_STAGES.map((stage, idx) => {
                const isDone = idx < activeStageIndex;
                const isCurrent = idx === activeStageIndex;
                const isPending = idx > activeStageIndex;
                const Icon = stage.icon;

                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent
                        ? 'rgba(234, 88, 12, 0.08)'
                        : isDone
                        ? 'rgba(22, 163, 74, 0.06)'
                        : 'rgba(255, 255, 255, 0.65)',
                      border: isCurrent
                        ? '1.5px solid rgba(234, 88, 12, 0.45)'
                        : isDone
                        ? '1px solid rgba(22, 163, 74, 0.25)'
                        : '1px solid rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isDone
                            ? '#16A34A'
                            : isCurrent
                            ? 'linear-gradient(135deg, #F97316, #EA580C)'
                            : '#E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#140A05' }}>
                          {stage.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6B4226', marginTop: '0.1rem' }}>
                          {stage.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ flexShrink: 0, marginLeft: '0.5rem' }}>
                      {isDone && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#16A34A',
                            fontSize: '0.775rem',
                            fontWeight: 700,
                          }}
                        >
                          <CheckCircle2 size={15} />
                          <span>Complete</span>
                        </div>
                      )}
                      {isCurrent && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            color: '#C2410C',
                            fontSize: '0.775rem',
                            fontWeight: 700,
                          }}
                        >
                          <Loader2 size={14} className="animate-spin" />
                          <span>Processing...</span>
                        </div>
                      )}
                      {isPending && (
                        <span style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>Queued</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rotating Micro-Tip Banner */}
            <div
              style={{
                background: 'rgba(254, 243, 199, 0.75)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: 'var(--radius-md)',
                padding: '0.65rem 0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.8rem',
                color: '#92400E',
                fontWeight: 600,
              }}
            >
              <Lightbulb size={16} color="#D97706" style={{ flexShrink: 0 }} />
              <span>{ROTATING_TIPS[tipIndex]}</span>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progress Line (5 Steps) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem',
                marginBottom: '2rem',
              }}
            >
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  style={{
                    height: '4px',
                    borderRadius: '99px',
                    background:
                      step <= currentStep
                        ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                        : 'rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit}>
          {/* STEP 1: Foundation */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.65rem', fontWeight: 700, color: '#140A05' }}>
                  Choose Event Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {/* Wedding */}
                  <div
                    onClick={() => handleSelectEventType('wedding')}
                    className="glass-card-interactive"
                    style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      borderColor: form.eventType === 'wedding' ? 'var(--color-orange-500)' : 'var(--glass-border)',
                      background: form.eventType === 'wedding' ? 'rgba(255, 255, 255, 0.98)' : undefined,
                    }}
                  >
                    <Heart size={28} color="#f43f5e" style={{ margin: '0 auto 0.65rem auto' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>Wedding</div>
                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.25rem' }}>
                      Receptions, vows, vendors & banquets
                    </div>
                  </div>

                  {/* Birthday */}
                  <div
                    onClick={() => handleSelectEventType('birthday')}
                    className="glass-card-interactive"
                    style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      borderColor: form.eventType === 'birthday' ? 'var(--color-orange-500)' : 'var(--glass-border)',
                      background: form.eventType === 'birthday' ? 'rgba(255, 255, 255, 0.98)' : undefined,
                    }}
                  >
                    <Cake size={28} color="#fbbf24" style={{ margin: '0 auto 0.65rem auto' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>Birthday</div>
                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.25rem' }}>
                      Milestones, DIY games & custom cakes
                    </div>
                  </div>

                  {/* Community Event (Priority 2.1) */}
                  <div
                    onClick={() => handleSelectEventType('community')}
                    className="glass-card-interactive"
                    style={{
                      padding: '1.25rem 1rem',
                      textAlign: 'center',
                      borderColor: form.eventType === 'community' ? 'var(--color-orange-500)' : 'var(--glass-border)',
                      background: form.eventType === 'community' ? 'rgba(255, 255, 255, 0.98)' : undefined,
                    }}
                  >
                    <Megaphone size={28} color="#38bdf8" style={{ margin: '0 auto 0.65rem auto' }} />
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111' }}>Community Event</div>
                    <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.25rem' }}>
                      Cleanups, fundraisers, neighborhood gatherings & festivals
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05' }}>
                  Event Title / Name
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Maya's 30th Fiesta or Oakridge Harvest Fair"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 2: Time, Scale & Setting */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 700, color: '#140A05' }}>Event Date</label>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-orange-400)', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={form.dateType === 'undecided'}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dateType: e.target.checked ? 'undecided' : 'exact',
                        })
                      }
                    />
                    Date not finalized yet (T-Minus Mode)
                  </label>
                </div>
                {form.dateType !== 'undecided' ? (
                  <input
                    type="date"
                    className="glass-input"
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                  />
                ) : (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(234, 88, 12, 0.08)',
                      border: '1px dashed rgba(251, 146, 60, 0.4)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: 'var(--color-orange-700)',
                    }}
                  >
                    Relative timeline active: Milestones will be sequenced by offsets (e.g. "T-4 Months", "Week of Event").
                  </div>
                )}
              </div>

              {/* Guest Count */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: 700, color: '#140A05' }}>Expected Attendees (Guest Count)</label>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-orange-700)', fontWeight: 700 }}>
                    {form.guestCount} guests
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={form.guestCount}
                  onChange={(e) => {
                    const count = Number(e.target.value);
                    const newTotal = form.budgetStatus === 'needs_help'
                      ? Math.round(BENCHMARK_COST_PER_GUEST[form.eventType][form.budgetTier] * count)
                      : form.totalBudget;
                    setForm({ ...form, guestCount: count, totalBudget: newTotal });
                  }}
                />
              </div>

              {/* Venue Setting: Indoor / Outdoor / Hybrid */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05' }}>
                  Venue Environment (Setting)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                  {[
                    { id: 'indoor', label: 'Indoor Hall', icon: <Home size={16} /> },
                    { id: 'outdoor', label: 'Open Outdoor', icon: <Sun size={16} /> },
                    { id: 'hybrid', label: 'Covered / Hybrid', icon: <CloudSun size={16} /> },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setForm({ ...form, venueSetting: s.id as any })}
                      className="btn-secondary"
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.825rem',
                        background: form.venueSetting === s.id ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : undefined,
                        color: form.venueSetting === s.id ? '#fff' : undefined,
                        borderColor: form.venueSetting === s.id ? 'var(--color-orange-500)' : undefined,
                      }}
                    >
                      {s.icon}
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05' }}>
                  Location / City (Optional)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Austin, TX or City Waterfront Park"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 3: Financials & Smart Estimator */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Help me set a budget toggle (FR-14) */}
              <div
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(234, 88, 12, 0.08)',
                  border: '1px solid rgba(251, 146, 60, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calculator size={22} color="var(--color-orange-600)" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>
                      I Need Help Setting a Realistic Budget (FR-14)
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#555' }}>
                      Estimate based on {form.guestCount} guests and market per-attendee benchmarks
                    </div>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.budgetStatus === 'needs_help'}
                    onChange={(e) => {
                      const needsHelp = e.target.checked;
                      const newTotal = needsHelp
                        ? Math.round(BENCHMARK_COST_PER_GUEST[form.eventType][form.budgetTier] * form.guestCount)
                        : form.totalBudget;
                      setForm({
                        ...form,
                        budgetStatus: needsHelp ? 'needs_help' : 'defined',
                        totalBudget: newTotal,
                      });
                    }}
                  />
                  <span style={{ fontSize: '0.8rem', marginLeft: '0.4rem', fontWeight: 600, color: 'var(--color-orange-700)' }}>
                    Auto-Estimate
                  </span>
                </label>
              </div>

              {/* Tier Selector if Auto-Estimate active */}
              {form.budgetStatus === 'needs_help' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05' }}>
                    Select Cost Benchmark Tier
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                    {(['economy', 'moderate', 'premium', 'luxury'] as const).map((tier) => {
                      const costPerHead = BENCHMARK_COST_PER_GUEST[form.eventType][tier];
                      const isSelected = form.budgetTier === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handleBudgetTierChange(tier)}
                          className="btn-secondary"
                          style={{
                            padding: '0.65rem 0.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            background: isSelected ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : undefined,
                            color: isSelected ? '#fff' : undefined,
                            borderColor: isSelected ? 'var(--color-orange-500)' : undefined,
                          }}
                        >
                          <span style={{ textTransform: 'capitalize', fontWeight: 700, fontSize: '0.85rem' }}>
                            {tier}
                          </span>
                          <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                            {form.currency} {costPerHead}/head
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Total Budget Input */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05' }}>
                  Total Budget Amount & Currency
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    className="glass-input"
                    style={{ width: '120px', cursor: 'pointer' }}
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>

                  <input
                    type="number"
                    className="glass-input"
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem' }}
                    value={form.totalBudget}
                    onChange={(e) => setForm({ ...form, totalBudget: Math.max(0, Number(e.target.value)) })}
                  />
                </div>
              </div>

              {/* Per guest estimate badge */}
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.92)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <DollarSign size={24} color="var(--color-orange-600)" />
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#111', fontWeight: 700 }}>
                    Deterministic Allocation Preview
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#555' }}>
                    {form.guestCount > 0
                      ? `Calculates to exactly ${form.currency} ${(form.totalBudget / form.guestCount).toFixed(0)} per attendee. The budget engine balances lines to 100% of this total.`
                      : 'Set guest count to view per-guest allocation breakdown.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Personalization & Constraints */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05' }}>
                  Aesthetic Vibe & Atmosphere
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Warm Terracotta Boho, Retro Arcade, or Minimalist Garden"
                  value={form.vibe}
                  onChange={(e) => setForm({ ...form, vibe: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05' }}>
                  Top Priorities (Select to emphasize allocation)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {[
                    'Catering & Cocktails',
                    'Photography',
                    'Music & Dancing',
                    'Florals & Decor',
                    'Interactive Games',
                    'Low-Cost DIY',
                    'Safety & Permitting',
                    'Volunteer Experience',
                  ].map((priority) => {
                    const isSelected = form.priorities.includes(priority);
                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => togglePriority(priority)}
                        className="btn-secondary"
                        style={{
                          padding: '0.35rem 0.8rem',
                          fontSize: '0.8rem',
                          background: isSelected ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : undefined,
                          borderColor: isSelected ? 'var(--color-orange-500)' : undefined,
                          color: isSelected ? '#fff' : undefined,
                        }}
                      >
                        {isSelected && <CheckCircle2 size={13} style={{ marginRight: '0.25rem' }} />}
                        {priority}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Dietary & Allergen Notes
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Vegetarian, Nut-Free, Halal"
                    value={form.dietaryNotes}
                    onChange={(e) => setForm({ ...form, dietaryNotes: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Constraints & Curfews
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. 10:30 PM sound cutoff, strict park rules"
                    value={form.constraints}
                    onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 (FR-4 & Section 9.5): REVIEW INPUTS & CONFIRM */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                style={{
                  background: 'rgba(234, 88, 12, 0.08)',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Sparkles size={16} color="var(--color-orange-600)" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>
                    Review Inputs Before Master Plan Generation (FR-4)
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#555', margin: 0 }}>
                  Confirm your parameters below. Every budget line, task, and vendor remains completely editable after generation.
                </p>
              </div>

              {/* Review Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                {/* Event Foundation */}
                <div style={{ background: 'rgba(255, 255, 255, 0.92)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Event & Title</span>
                    <button type="button" onClick={() => setCurrentStep(1)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                      <Edit3 size={12} color="var(--color-orange-600)" />
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, color: '#111' }}>{form.title || 'Untitled Event'}</div>
                  <span className="badge badge-orange" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>{form.eventType}</span>
                </div>

                {/* Scale & Setting */}
                <div style={{ background: 'rgba(255, 255, 255, 0.92)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Time & Setting</span>
                    <button type="button" onClick={() => setCurrentStep(2)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                      <Edit3 size={12} color="var(--color-orange-600)" />
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, color: '#111' }}>
                    {form.dateType === 'undecided' ? 'Date Undecided (T-Minus)' : form.eventDate}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#555' }}>
                    {form.guestCount} Guests • {form.venueSetting} setting
                  </div>
                </div>

                {/* Budget */}
                <div style={{ background: 'rgba(255, 255, 255, 0.92)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Budget Allocation</span>
                    <button type="button" onClick={() => setCurrentStep(3)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                      <Edit3 size={12} color="var(--color-orange-600)" />
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--color-orange-700)', fontFamily: 'var(--font-mono)' }}>
                    {form.currency} {form.totalBudget.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#555' }}>
                    {form.budgetStatus === 'needs_help' ? `Auto-Estimated (${form.budgetTier})` : 'User Defined'}
                  </div>
                </div>

                {/* Vibe & Priorities */}
                <div style={{ background: 'rgba(255, 255, 255, 0.92)', padding: '0.9rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Vibe & Priorities</span>
                    <button type="button" onClick={() => setCurrentStep(4)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                      <Edit3 size={12} color="var(--color-orange-600)" />
                    </button>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111' }}>{form.vibe}</div>
                  <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.2rem' }}>
                    {form.priorities.slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--glass-border)',
            }}
          >
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="btn-secondary"
              >
                <ChevronLeft size={16} />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(5, prev + 1))}
                className="btn-primary"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating}
                className="btn-primary pulse-glow"
                style={{ padding: '0.75rem 1.75rem', fontSize: '1rem' }}
              >
                <Wand2 size={18} />
                <span>{isGenerating ? 'Synthesizing Master Plan...' : 'Generate Master Plan ✨'}</span>
              </button>
            )}
          </div>
        </form>
      </>
    )}
      </div>
    </div>
  );
};
