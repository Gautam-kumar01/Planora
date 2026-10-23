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
  UtensilsCrossed,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  EventType,
  DateType,
  OnboardingFormValues,
  IndianFunctionItem,
  IndianFunctionType,
  IndianCateringDiet,
} from '../types';
import {
  HINDI_TERMS,
  INDIAN_RITUAL_TEMPLATES,
  createCustomIndianRitual,
  generateDefaultIndianFunctions,
  formatIndianCurrency,
} from '../utils/indianEventEngine';

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

const BENCHMARK_COST_PER_GUEST_INR: Record<EventType, Record<'economy' | 'moderate' | 'premium' | 'luxury', number>> = {
  wedding: { economy: 3000, moderate: 6500, premium: 15000, luxury: 35000 },
  birthday: { economy: 600, moderate: 1500, premium: 3000, luxury: 6000 },
  community: { economy: 250, moderate: 600, premium: 1200, luxury: 2500 },
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

  const [isIndianPlan, setIsIndianPlan] = useState<boolean>(
    Boolean(initialFormValues?.isIndianWeddingPlan || initialFormValues?.currency === 'INR')
  );
  const [indianFunctions, setIndianFunctions] = useState<IndianFunctionItem[]>(
    initialFormValues?.indianFunctions && initialFormValues.indianFunctions.length > 0
      ? initialFormValues.indianFunctions
      : generateDefaultIndianFunctions('wedding', 250, '2027-06-20')
  );
  const [indianDiet, setIndianDiet] = useState<IndianCateringDiet>(
    initialFormValues?.indianCateringDiet || 'pure_veg'
  );
  const [editingFunctionId, setEditingFunctionId] = useState<string | null>(null);

  // Pre-fill from homepage sandbox if provided
  useEffect(() => {
    if (initialFormValues) {
      const isIndian = Boolean(initialFormValues.isIndianWeddingPlan || initialFormValues.currency === 'INR');
      setIsIndianPlan(isIndian);
      if (initialFormValues.indianFunctions && initialFormValues.indianFunctions.length > 0) {
        setIndianFunctions(initialFormValues.indianFunctions);
      }
      if (initialFormValues.indianCateringDiet) {
        setIndianDiet(initialFormValues.indianCateringDiet);
      }
      setForm((prev) => ({
        ...prev,
        ...initialFormValues,
        title: initialFormValues.title || prev.title,
      }));
    }
  }, [initialFormValues]);

  // Handlers for Indian Wedding Functions
  const handleAddRitual = (type: IndianFunctionType = 'haldi') => {
    const newFn = createCustomIndianRitual(type, form.eventDate, form.guestCount);
    setIndianFunctions((prev) => [...prev, newFn]);
    setEditingFunctionId(newFn.id);
  };

  const handleDeleteRitual = (id: string) => {
    setIndianFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateRitual = (id: string, updates: Partial<IndianFunctionItem>) => {
    setIndianFunctions((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const handleSelectRitualType = (id: string, newType: IndianFunctionType) => {
    const template = INDIAN_RITUAL_TEMPLATES[newType];
    if (template) {
      handleUpdateRitual(id, {
        type: newType,
        title: template.title,
        hindiTitle: template.hindiTitle,
        startTime: template.startTime,
        endTime: template.endTime,
        venueName: template.venueName,
        dressCode: template.dressCode,
        ritualNotes: template.ritualNotes,
      });
    } else {
      handleUpdateRitual(id, { type: newType });
    }
  };

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
    const table = form.currency === 'INR' ? BENCHMARK_COST_PER_GUEST_INR : BENCHMARK_COST_PER_GUEST;
    const costPerGuest = table[form.eventType][tier];
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
      title: form.title.trim() || (isIndianPlan ? 'Grand Indian Wedding Celebration' : `${form.eventType.toUpperCase()} Celebration`),
      currency: isIndianPlan ? 'INR' : form.currency,
      isIndianWeddingPlan: isIndianPlan,
      indianFunctions: isIndianPlan ? indianFunctions : undefined,
      indianCateringDiet: isIndianPlan ? indianDiet : undefined,
    });
  };

  return (
    <div className="modal-backdrop">
      <div className={`modal-content wizard-modal-card ${isIndianPlan ? 'wizard-indian-card' : ''}`}>
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

              {/* Bharat Mode / Indian Wedding Intelligence Toggle */}
              <div
                onClick={() => {
                  const next = !isIndianPlan;
                  setIsIndianPlan(next);
                  if (next) {
                    setForm((prev) => ({
                      ...prev,
                      currency: 'INR',
                      eventType: 'wedding',
                      guestCount: prev.guestCount < 100 ? 250 : prev.guestCount,
                      totalBudget: prev.totalBudget < 50000 ? 2500000 : prev.totalBudget,
                      title: prev.title && prev.title !== 'Untitled Event' ? prev.title : 'Grand Indian Wedding Celebration',
                    }));
                  }
                }}
                className="glass-card-interactive"
                style={{
                  padding: '0.9rem 1.15rem',
                  borderRadius: 'var(--radius-md)',
                  background: isIndianPlan
                    ? 'linear-gradient(135deg, rgba(255, 247, 237, 0.98) 0%, rgba(254, 243, 199, 0.95) 100%)'
                    : 'rgba(255, 255, 255, 0.85)',
                  border: isIndianPlan ? '2px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  cursor: 'pointer',
                  boxShadow: isIndianPlan ? '0 4px 15px rgba(234, 88, 12, 0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🇮🇳</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#140A05' }}>
                        Plan Indian Wedding / Cultural Celebrations (शुभ विवाह)
                      </strong>
                      <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
                        Bharat Mode
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: '#6B4226', lineHeight: 1.4 }}>
                      Multi-day ceremonies (Haldi, Mehendi, Sangeet, Pheras), Pure Veg / Jain catering buffer & INR budget
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: isIndianPlan ? '6px solid #EA580C' : '2px solid #9CA3AF',
                    background: '#FFFFFF',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                />
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

              {/* Indian Multi-Day Ceremonies & Rituals Manager (When Indian Wedding is Active) */}
              {isIndianPlan && (
                <div
                  style={{
                    padding: '1.25rem',
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1.5px solid rgba(234, 88, 12, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 20px rgba(45, 24, 15, 0.06)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.15rem' }}>🇮🇳</span>
                        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                          Multi-Day Wedding Ceremonies & Rituals ({indianFunctions.length})
                        </h3>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: '#6B4226', margin: '0.25rem 0 0 0' }}>
                        Customize your Haldi, Mehendi, Sangeet, Pheras etc. with timings, venues, dress codes & family customs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddRitual('custom_ritual')}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Plus size={14} />
                      <span>Add Custom Ceremony</span>
                    </button>
                  </div>

                  {/* 1-Click Quick-Add Ritual Chips */}
                  <div style={{ background: 'rgba(251, 247, 240, 0.75)', border: '1px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-sm)', padding: '0.65rem 0.85rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                      ⚡ Quick-Add Ceremonies (1-Click):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {[
                        { type: 'haldi' as const, label: '🌼 Haldi' },
                        { type: 'mehendi' as const, label: '🌿 Mehendi' },
                        { type: 'sangeet' as const, label: '💃 Sangeet' },
                        { type: 'cocktail' as const, label: '🍸 Cocktail' },
                        { type: 'roka' as const, label: '💍 Roka' },
                        { type: 'engagement' as const, label: '💎 Ring Ceremony' },
                        { type: 'baraat' as const, label: '🥁 Baraat' },
                        { type: 'wedding_pheras' as const, label: '🔥 Pheras' },
                        { type: 'reception' as const, label: '👑 Reception' },
                        { type: 'vidaai' as const, label: '🌸 Vidaai' },
                        { type: 'custom_ritual' as const, label: '✨ Custom Ritual' },
                      ].map((rit) => (
                        <button
                          key={rit.type}
                          type="button"
                          onClick={() => handleAddRitual(rit.type)}
                          className="btn-ghost"
                          style={{
                            padding: '0.28rem 0.65rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: '#FFFFFF',
                            border: '1px solid rgba(234, 88, 12, 0.25)',
                            borderRadius: '99px',
                            color: '#9A3412',
                            boxShadow: '0 1px 3px rgba(45, 24, 15, 0.05)',
                          }}
                        >
                          <Plus size={11} style={{ marginRight: '0.2rem' }} />
                          <span>{rit.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ceremony Functions List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                    {indianFunctions.map((fn, index) => {
                      const isEditing = editingFunctionId === fn.id;

                      return (
                        <div
                          key={fn.id}
                          style={{
                            border: isEditing ? '2px solid #EA580C' : '1.5px solid rgba(234, 88, 12, 0.22)',
                            borderRadius: 'var(--radius-md)',
                            background: isEditing ? '#FFFFFF' : 'rgba(251, 247, 240, 0.55)',
                            padding: isEditing ? '1.15rem' : '0.9rem 1.1rem',
                            boxShadow: isEditing ? '0 8px 25px rgba(234, 88, 12, 0.12)' : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.65rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <span
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.8rem',
                                  fontWeight: 800,
                                  flexShrink: 0,
                                }}
                              >
                                {index + 1}
                              </span>
                              <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#140A05' }}>
                                  {fn.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>
                                  {fn.hindiTitle || HINDI_TERMS[fn.type] || fn.type}
                                </div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <button
                                type="button"
                                onClick={() => setEditingFunctionId(isEditing ? null : fn.id)}
                                className="btn-secondary"
                                style={{ padding: '0.3rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                <Edit3 size={12} />
                                <span>{isEditing ? 'Close Editor' : 'Edit Details'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRitual(fn.id)}
                                className="btn-ghost"
                                style={{ padding: '0.3rem', color: '#DC2626' }}
                                title="Remove ceremony"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Preview row when NOT editing */}
                          {!isEditing && (
                            <div>
                              <div
                                style={{
                                  marginTop: '0.65rem',
                                  paddingTop: '0.55rem',
                                  borderTop: '1px solid rgba(234, 88, 12, 0.12)',
                                  display: 'flex',
                                  gap: '1rem',
                                  flexWrap: 'wrap',
                                  fontSize: '0.78rem',
                                  color: '#4A2B1A',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Calendar size={13} color="#EA580C" />
                                  <span>{fn.date || 'Date TBD'} ({fn.startTime || 'Start'} - {fn.endTime || 'End'})</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <MapPin size={13} color="#EA580C" />
                                  <span>{fn.venueName || 'Venue TBD'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Users size={13} color="#EA580C" />
                                  <span>{fn.expectedGuests} Guests</span>
                                </div>
                                {fn.dressCode && (
                                  <div style={{ color: '#6B4226', fontWeight: 500 }}>
                                    <strong>Dress Code:</strong> {fn.dressCode}
                                  </div>
                                )}
                              </div>

                              {fn.ritualNotes && (
                                <div
                                  style={{
                                    marginTop: '0.5rem',
                                    padding: '0.4rem 0.65rem',
                                    background: 'rgba(251, 247, 240, 0.85)',
                                    borderLeft: '3px solid #EA580C',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    color: '#5A331E',
                                    lineHeight: 1.4,
                                  }}
                                >
                                  <strong>Custom Rituals & Notes: </strong>
                                  {fn.ritualNotes}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Spacious In-Place Ceremony Editor */}
                          {isEditing && (
                            <div
                              style={{
                                marginTop: '1rem',
                                paddingTop: '0.85rem',
                                borderTop: '1.5px dashed rgba(234, 88, 12, 0.25)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.85rem',
                              }}
                            >
                              {/* Ceremony Type Selector */}
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.25rem' }}>
                                  Ceremony Type (Select to auto-fill smart ritual defaults)
                                </label>
                                <select
                                  value={fn.type}
                                  onChange={(e) => handleSelectRitualType(fn.id, e.target.value as IndianFunctionType)}
                                  className="glass-input"
                                  style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', fontWeight: 600, background: '#FFF' }}
                                >
                                  <option value="haldi">🌼 Haldi & Pithi (हल्दी समारोह)</option>
                                  <option value="mehendi">🌿 Mehendi & Henna (मेहंदी की रस्म)</option>
                                  <option value="sangeet">💃 Sangeet & Dance Night (संगीत संध्या)</option>
                                  <option value="cocktail">🍸 Cocktail & DJ Party (कॉकटेल संध्या)</option>
                                  <option value="roka">💍 Roka & Shagun (रोका समारोह)</option>
                                  <option value="engagement">💎 Ring Exchange & Engagement (सगाई)</option>
                                  <option value="tilak">🚩 Tilak & Sagai (तिलक रस्म)</option>
                                  <option value="baraat">🥁 Baraat Procession (बारात प्रस्थान)</option>
                                  <option value="wedding_pheras">🔥 Varmala & Sacred Pheras (सात फेरे)</option>
                                  <option value="reception">👑 Grand Reception (विवाह प्रीतिभोज)</option>
                                  <option value="vidaai">🌸 Vidaai & Doli (विदाई रस्म)</option>
                                  <option value="custom_ritual">✨ Custom Cultural Ritual (विशेष पारिवारिक रस्म)</option>
                                </select>
                              </div>

                              {/* Row 1: English & Hindi Titles */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    Ceremony Title (English)
                                  </label>
                                  <input
                                    type="text"
                                    value={fn.title}
                                    onChange={(e) => handleUpdateRitual(fn.id, { title: e.target.value })}
                                    className="glass-input"
                                    placeholder="e.g. Phoolon Ki Haldi Ceremony"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    Hindi Title (हिंदी शीर्षक)
                                  </label>
                                  <input
                                    type="text"
                                    value={fn.hindiTitle || ''}
                                    onChange={(e) => handleUpdateRitual(fn.id, { hindiTitle: e.target.value })}
                                    className="glass-input"
                                    placeholder="जैसे: फूलों की हल्दी व पिठी समारोह"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                              </div>

                              {/* Row 2: Date, Start Time & End Time */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    Date
                                  </label>
                                  <input
                                    type="date"
                                    value={fn.date || ''}
                                    onChange={(e) => handleUpdateRitual(fn.id, { date: e.target.value })}
                                    className="glass-input"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    Start Time
                                  </label>
                                  <input
                                    type="text"
                                    value={fn.startTime || ''}
                                    onChange={(e) => handleUpdateRitual(fn.id, { startTime: e.target.value })}
                                    className="glass-input"
                                    placeholder="e.g. 10:00 AM"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    End Time
                                  </label>
                                  <input
                                    type="text"
                                    value={fn.endTime || ''}
                                    onChange={(e) => handleUpdateRitual(fn.id, { endTime: e.target.value })}
                                    className="glass-input"
                                    placeholder="e.g. 01:00 PM"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                              </div>

                              {/* Row 3: Venue, Guests, Dress Code */}
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    Venue / Mandap / Lawn
                                  </label>
                                  <input
                                    type="text"
                                    value={fn.venueName || ''}
                                    onChange={(e) => handleUpdateRitual(fn.id, { venueName: e.target.value })}
                                    className="glass-input"
                                    placeholder="e.g. Sunlit Terrace Garden / Banquet"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    Expected Guests
                                  </label>
                                  <input
                                    type="number"
                                    value={fn.expectedGuests}
                                    onChange={(e) => handleUpdateRitual(fn.id, { expectedGuests: parseInt(e.target.value) || 0 })}
                                    className="glass-input"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                    Dress Code Theme
                                  </label>
                                  <input
                                    type="text"
                                    value={fn.dressCode || ''}
                                    onChange={(e) => handleUpdateRitual(fn.id, { dressCode: e.target.value })}
                                    className="glass-input"
                                    placeholder="e.g. Sunlit Yellow & Pastel Ochre"
                                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                                  />
                                </div>
                              </div>

                              {/* Row 4: Spacious Custom Ritual Details & Traditions */}
                              <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#140A05', marginBottom: '0.2rem' }}>
                                  Custom Ritual Notes, Traditions & Family Roles
                                </label>
                                <textarea
                                  rows={3}
                                  value={fn.ritualNotes || ''}
                                  onChange={(e) => handleUpdateRitual(fn.id, { ritualNotes: e.target.value })}
                                  className="glass-input"
                                  placeholder="e.g. Flower shower petals, 4 mehendi artists, entry choreography, Pandit ji Dakshina, special family rituals..."
                                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.825rem', lineHeight: 1.45, resize: 'vertical' }}
                                />
                              </div>

                              {/* Editor Action Buttons */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.35rem' }}>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRitual(fn.id)}
                                  className="btn-ghost"
                                  style={{ color: '#DC2626', fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                                >
                                  <Trash2 size={13} />
                                  <span>Remove Ceremony</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingFunctionId(null)}
                                  className="btn-primary"
                                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}
                                >
                                  <span>Done</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
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

              {/* Indian Wedding Catering Preference (When Indian Wedding is Active) */}
              {isIndianPlan && (
                <div style={{ marginTop: '0.25rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 700, color: '#140A05', fontSize: '0.9rem' }}>
                    🇮🇳 Indian Catering Preference (खानपान व थाली प्राथमिकता)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.65rem', marginBottom: '0.65rem' }}>
                    {[
                      { id: 'pure_veg' as const, title: '🟢 Pure Vegetarian', desc: '100% vegetarian satvik kitchen & separate buffet counters' },
                      { id: 'jain_veg' as const, title: '🟡 Jain Vegetarian', desc: 'No onion, garlic, or underground root vegetables' },
                      { id: 'swaminarayan' as const, title: '🟠 Swaminarayan Diet', desc: 'Traditional satvik preparation without onion or garlic' },
                      { id: 'mixed_veg_nonveg' as const, title: '🔴 Standard Mixed', desc: 'Strictly segregated veg & non-veg live kitchen stations' },
                    ].map((diet) => (
                      <button
                        key={diet.id}
                        type="button"
                        onClick={() => setIndianDiet(diet.id)}
                        className="btn-secondary"
                        style={{
                          padding: '0.75rem',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          background: indianDiet === diet.id ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.12), rgba(245, 158, 11, 0.12))' : '#FFFFFF',
                          border: indianDiet === diet.id ? '2px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.2)',
                          color: '#140A05',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <strong style={{ fontSize: '0.85rem' }}>{diet.title}</strong>
                        <span style={{ fontSize: '0.72rem', color: '#6B4226', lineHeight: 1.35 }}>{diet.desc}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#92400E', background: 'rgba(254, 243, 199, 0.75)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    ⚡ <strong>Automatic +10% Unannounced Guest Buffer:</strong> Caterers will be instructed with {Math.round(form.guestCount * 1.10)} plate guarantees to ensure food never runs short during peak baarat arrivals.
                  </div>
                </div>
              )}
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
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>{form.eventType}</span>
                    {isIndianPlan && <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>🇮🇳 Bharat Mode</span>}
                  </div>
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
                    {form.currency === 'INR' ? formatIndianCurrency(form.totalBudget) : `${form.currency} ${form.totalBudget.toLocaleString()}`}
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

                {/* Indian Wedding Ceremonies & Bharat Intelligence Summary Card */}
                {isIndianPlan && (
                  <div
                    style={{
                      gridColumn: '1 / -1',
                      background: 'linear-gradient(135deg, rgba(255, 247, 237, 0.98) 0%, rgba(254, 243, 199, 0.92) 100%)',
                      padding: '1rem 1.15rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid rgba(234, 88, 12, 0.35)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>🇮🇳</span>
                        <span style={{ fontSize: '0.85rem', color: '#9A3412', textTransform: 'uppercase', fontWeight: 800 }}>
                          Indian Wedding Ceremonies & Catering Protocol ({indianFunctions.length} Functions)
                        </span>
                      </div>
                      <button type="button" onClick={() => setCurrentStep(2)} className="btn-ghost" style={{ padding: '0.2rem' }}>
                        <Edit3 size={13} color="var(--color-orange-600)" />
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginTop: '0.5rem' }}>
                      {indianFunctions.map((fn, idx) => (
                        <span
                          key={fn.id || idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '99px',
                            background: '#FFFFFF',
                            border: '1px solid rgba(234, 88, 12, 0.3)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#140A05',
                          }}
                        >
                          <span>{fn.title}</span>
                          <span style={{ color: '#EA580C', fontSize: '0.7rem' }}>({fn.expectedGuests} guests)</span>
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#6B4226', marginTop: '0.65rem', fontWeight: 600 }}>
                      🍽️ Catering: {indianDiet === 'pure_veg' ? 'Pure Vegetarian (Satvik)' : indianDiet === 'jain_veg' ? 'Jain Vegetarian' : indianDiet === 'swaminarayan' ? 'Swaminarayan Diet' : 'Standard Mixed'} • Guaranteed +10% unannounced buffer ({Math.round(form.guestCount * 1.10)} plates)
                    </div>
                  </div>
                )}
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
