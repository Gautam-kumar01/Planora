import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  Heart,
  Cake,
  Megaphone,
  CheckCircle,
  Clock,
  Layers,
  Database,
  Users,
  Palette,
  FileText,
  Cloud,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calculator,
  Sliders,
  Wand2,
  TrendingUp,
  CloudRain,
  Zap,
  UserCheck,
  Check,
  Send,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import { EventPlan, UserProfile, EventType, OnboardingFormValues } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

interface HomePageProps {
  plans: EventPlan[];
  onOpenWizard: (initialValues?: Partial<OnboardingFormValues>) => void;
  onSelectPlanAndOpenDashboard: (planId: string) => void;
  onOpenPlanManager: () => void;
  onOpenAuthModal: () => void;
  onNavigateUserDashboard?: () => void;
  currentUser: UserProfile | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  plans,
  onOpenWizard,
  onSelectPlanAndOpenDashboard,
  onOpenPlanManager,
  onOpenAuthModal,
  onNavigateUserDashboard,
  currentUser,
}) => {
  // Interactive Sandbox State
  const [sandboxType, setSandboxType] = useState<EventType>('wedding');
  const [sandboxGuests, setSandboxGuests] = useState<number>(120);
  const [sandboxBudget, setSandboxBudget] = useState<number>(20000);
  const [sandboxSetting, setSandboxSetting] = useState<'hybrid' | 'indoor' | 'outdoor'>('hybrid');

  // Interactive 5-Module Feature Showcase Tour State
  const [activeTourTab, setActiveTourTab] = useState<'budget' | 'timeline' | 'vendors' | 'guests' | 'weather'>('budget');

  // Live Event Readiness Scorecard Calculator State
  const [readinessHeadcount, setReadinessHeadcount] = useState<number>(120);
  const [readinessBudgetStatus, setReadinessBudgetStatus] = useState<'locked' | 'estimated' | 'untracked'>('locked');
  const [readinessVendorStatus, setReadinessVendorStatus] = useState<'some' | 'all' | 'none'>('some');
  const [readinessWeatherPlan, setReadinessWeatherPlan] = useState<boolean>(true);
  const [readinessDaysLeft, setReadinessDaysLeft] = useState<number>(90);

  // Dynamic Readiness Calculation
  let readinessScore = 40;
  if (readinessBudgetStatus === 'locked') readinessScore += 25;
  else if (readinessBudgetStatus === 'estimated') readinessScore += 12;

  if (readinessVendorStatus === 'all') readinessScore += 20;
  else if (readinessVendorStatus === 'some') readinessScore += 10;

  if (readinessWeatherPlan) readinessScore += 15;
  if (readinessDaysLeft < 30 && readinessVendorStatus === 'none') readinessScore -= 15;
  readinessScore = Math.min(100, Math.max(20, readinessScore));

  // Math Calculations
  const costPerGuest = Math.round(sandboxBudget / Math.max(1, sandboxGuests));

  // Determine Tier and Benchmarks
  let tierBadgeText = 'Moderate Balanced ($165/guest avg)';
  let feasibilityPercentage = 95;
  let feasibilityLabel = 'Optimal Financial Balance';

  if (sandboxType === 'wedding') {
    if (costPerGuest < 110) {
      tierBadgeText = 'Economy Tier ($90/guest avg)';
      feasibilityPercentage = 82;
      feasibilityLabel = 'Tight - Needs DIY & Savvy Sourcing';
    } else if (costPerGuest <= 200) {
      tierBadgeText = 'Moderate Balanced ($165/guest avg)';
      feasibilityPercentage = 96;
      feasibilityLabel = 'Optimal Financial Balance';
    } else if (costPerGuest <= 350) {
      tierBadgeText = 'Premium Tier ($250/guest avg)';
      feasibilityPercentage = 98;
      feasibilityLabel = 'High Quality Vendor Freedom';
    } else {
      tierBadgeText = 'Luxury Tier ($420+/guest avg)';
      feasibilityPercentage = 99;
      feasibilityLabel = 'Top Tier Concierge Event';
    }
  } else if (sandboxType === 'birthday') {
    if (costPerGuest < 20) {
      tierBadgeText = 'Economy Tier ($15/guest avg)';
      feasibilityPercentage = 84;
      feasibilityLabel = 'DIY Games & Home Baked Focus';
    } else if (costPerGuest <= 40) {
      tierBadgeText = 'Moderate Balanced ($25/guest avg)';
      feasibilityPercentage = 95;
      feasibilityLabel = 'Balanced Pizza & Arcade Package';
    } else {
      tierBadgeText = 'Premium / Venue Rental ($50+/guest avg)';
      feasibilityPercentage = 98;
      feasibilityLabel = 'All-Inclusive Entertainment';
    }
  } else {
    if (costPerGuest < 10) {
      tierBadgeText = 'Economy Community Grant ($8/guest avg)';
      feasibilityPercentage = 85;
      feasibilityLabel = 'Permit & Sanitation Focused';
    } else if (costPerGuest <= 22) {
      tierBadgeText = 'Moderate Festival ($14/guest avg)';
      feasibilityPercentage = 95;
      feasibilityLabel = 'Live Music & Refreshment Ready';
    } else {
      tierBadgeText = 'Large Scale Block Party ($25+/guest avg)';
      feasibilityPercentage = 98;
      feasibilityLabel = 'Full Stage & Staging Rentals';
    }
  }

  // Category distributions strictly summing to 100%
  const venueAmt = Math.round(sandboxBudget * 0.32);
  const cateringAmt = Math.round(sandboxBudget * 0.34);
  const photoAmt = Math.round(sandboxBudget * 0.12);
  const decorAmt = Math.round(sandboxBudget * 0.08);
  const musicAmt = Math.round(sandboxBudget * 0.06);
  const contingencyAmt = sandboxBudget - (venueAmt + cateringAmt + photoAmt + decorAmt + musicAmt);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '3rem' }}>
      {/* 1. Hero Landing Section */}
      <section
        className="glass-panel responsive-section-padding"
        style={{
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Challenge Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 1rem',
            background: 'rgba(234, 88, 12, 0.12)',
            border: '1.5px solid rgba(234, 88, 12, 0.35)',
            borderRadius: 'var(--radius-full)',
            color: '#9A3412',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
          }}
        >
          <Sparkles size={16} color="#EA580C" />
        </div>

        {/* Main Title */}
        <h1
          className="hero-heading"
          style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            color: '#140A05',
            letterSpacing: '-0.03em',
            wordBreak: 'break-word',
          }}
        >
          Transform Scattered Event Ideas Into a{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#C2410C',
              fontWeight: 900,
            }}
          >
            Master Plan
          </span>{' '}
          in 15 Seconds
        </h1>

        {/* Subtitle */}
        <p
          className="hero-subtitle"
          style={{
            fontSize: '1.15rem',
            color: '#2C1810',
            maxWidth: '820px',
            margin: '0 auto 2rem auto',
            lineHeight: 1.65,
            fontWeight: 500,
          }}
        >
          Planora fuses <strong style={{ color: '#9A3412', fontWeight: 700 }}>GenAI creativity</strong> with{' '}
          <strong style={{ color: '#9A3412', fontWeight: 700 }}>deterministic financial arithmetic</strong> for weddings,
          birthdays, and community events. Deterministic budget arithmetic, hourly run-of-show schedules, vendor interview guides, and instant iCal sync.
        </p>

        {/* CTAs */}
        <div className="hero-cta-buttons">
          <button
            onClick={() => onOpenWizard()}
            className="btn-primary pulse-glow"
            style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
          >
            <Sparkles size={19} />
            <span>Create Your Event Plan</span>
            <ArrowRight size={18} />
          </button>

          {currentUser && onNavigateUserDashboard ? (
            <button
              id="btn-home-go-dashboard"
              onClick={onNavigateUserDashboard}
              className="btn-secondary"
              style={{
                padding: '0.85rem 1.8rem',
                fontSize: '1rem',
                background: '#FFFFFF',
                border: '1.5px solid #EA580C',
                color: '#C2410C',
                fontWeight: 700,
              }}
            >
              <Users size={18} color="#C2410C" />
              <span>Go to My Dashboard ({currentUser.fullName.split(' ')[0]})</span>
            </button>
          ) : (
            <button
              onClick={onOpenPlanManager}
              className="btn-secondary"
              style={{ padding: '0.85rem 1.8rem', fontSize: '1rem' }}
            >
              <Layers size={18} />
              <span>My Saved Plans ({plans.length})</span>
            </button>
          )}
        </div>

        {/* Value Differentiator Badges */}
        <div className="hero-value-badges">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>Deterministic Math (Sum == 100%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>Hourly Run of Show</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>Interactive Trade-off Simulator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>1-Click .ICS & PDF Export</span>
          </div>
        </div>
      </section>

      {/* 2. Interactive Instant Feasibility & Budget Sandbox (Zero-Click Playground) */}
      <section
        id="homepage-feasibility-sandbox"
        className="glass-panel responsive-section-padding"
        style={{
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid rgba(234, 88, 12, 0.3)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(251, 247, 240, 0.95) 100%)',
          boxShadow: '0 12px 40px rgba(45, 24, 15, 0.08)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.85rem', background: 'rgba(234, 88, 12, 0.12)', border: '1px solid rgba(234, 88, 12, 0.3)', borderRadius: '99px', color: '#9A3412', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              <Calculator size={15} color="#EA580C" />
              <span>Zero-Click Feasibility Playground • Test Before Generating</span>
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
              Live Event Feasibility & Budget Sandbox
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#4A2B1A', marginTop: '0.35rem', fontWeight: 500, maxWidth: '680px' }}>
              Drag the headcount and budget sliders to watch our deterministic financial engine rebalance category splits to 100% in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#FFFFFF', border: '1px solid rgba(234, 88, 12, 0.25)', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 8px #16A34A' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#140A05' }}>Deterministic Engine: Active</span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="sandbox-two-col">
          {/* Column 1: Sliders & Controls */}
          <div className="responsive-panel-padding" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(234, 88, 12, 0.2)' }}>
            {/* Event Type Buttons */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.6rem' }}>
                1. Select Event Type
              </label>
              <div className="event-type-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {[
                  { id: 'wedding', label: 'Wedding', icon: Heart, defaultBudget: 25000, defaultGuests: 130 },
                  { id: 'birthday', label: 'Birthday', icon: Cake, defaultBudget: 750, defaultGuests: 25 },
                  { id: 'community', label: 'Community Event', icon: Megaphone, defaultBudget: 2000, defaultGuests: 120 },
                ].map((t) => {
                  const Icon = t.icon;
                  const isSelected = sandboxType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSandboxType(t.id as EventType);
                        setSandboxBudget(t.defaultBudget);
                        setSandboxGuests(t.defaultGuests);
                      }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.85rem 0.5rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid #EA580C' : '1px solid rgba(0,0,0,0.1)',
                        background: isSelected ? 'rgba(234, 88, 12, 0.08)' : '#FAFAF9',
                        color: isSelected ? '#C2410C' : '#374151',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Icon size={20} color={isSelected ? '#EA580C' : '#6B7280'} />
                      <span style={{ fontSize: '0.85rem' }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guest Count Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#140A05' }}>
                  2. Expected Guest Headcount
                </label>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#C2410C', fontFamily: 'var(--font-mono)' }}>
                  {sandboxGuests} Guests
                </span>
              </div>
              <input
                type="range"
                min="10"
                max={sandboxType === 'wedding' ? 350 : sandboxType === 'birthday' ? 100 : 500}
                step="5"
                value={sandboxGuests}
                onChange={(e) => setSandboxGuests(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#EA580C', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                <span>10 guests</span>
                <span>Preset: {sandboxType === 'wedding' ? '120' : sandboxType === 'birthday' ? '25' : '100'}</span>
                <span>{sandboxType === 'wedding' ? '350+' : sandboxType === 'birthday' ? '100' : '500+'}</span>
              </div>
            </div>

            {/* Total Budget Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#140A05' }}>
                  3. Total Target Budget (USD)
                </label>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#16A34A', fontFamily: 'var(--font-mono)' }}>
                  ${sandboxBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min={sandboxType === 'birthday' ? 200 : sandboxType === 'community' ? 500 : 3000}
                max={sandboxType === 'wedding' ? 75000 : sandboxType === 'birthday' ? 5000 : 15000}
                step={sandboxType === 'birthday' ? 50 : 250}
                value={sandboxBudget}
                onChange={(e) => setSandboxBudget(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#16A34A', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                <span>{sandboxType === 'birthday' ? '$200' : sandboxType === 'community' ? '$500' : '$3,000'}</span>
                <span>Average: {sandboxType === 'wedding' ? '$25,000' : sandboxType === 'birthday' ? '$650' : '$1,500'}</span>
                <span>{sandboxType === 'wedding' ? '$75k+' : sandboxType === 'birthday' ? '$5k' : '$15k'}</span>
              </div>
            </div>

            {/* Venue Setting Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.45rem' }}>
                4. Venue Environment
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['hybrid', 'indoor', 'outdoor'] as const).map((setting) => (
                  <button
                    key={setting}
                    type="button"
                    onClick={() => setSandboxSetting(setting)}
                    style={{
                      flex: 1,
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      border: sandboxSetting === setting ? '1.5px solid #EA580C' : '1px solid rgba(0,0,0,0.1)',
                      background: sandboxSetting === setting ? 'rgba(234, 88, 12, 0.1)' : '#FFFFFF',
                      color: sandboxSetting === setting ? '#C2410C' : '#4B5563',
                      cursor: 'pointer',
                    }}
                  >
                    {setting}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Instant Results & Zero-Waste Distribution */}
          <div className="responsive-panel-padding" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: '#FFFFFF', borderRadius: 'var(--radius-lg)', border: '1.5px solid rgba(234, 88, 12, 0.25)', boxShadow: '0 8px 30px rgba(45, 24, 15, 0.05)' }}>
            {/* Top Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(234, 88, 12, 0.06)', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B4226', textTransform: 'uppercase' }}>Cost Per Guest</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#C2410C', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  ${costPerGuest}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#9A3412', marginTop: '0.25rem' }}>
                  {tierBadgeText}
                </div>
              </div>

              <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'rgba(22, 163, 74, 0.06)', border: '1px solid rgba(22, 163, 74, 0.2)' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Feasibility Score</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#15803D', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                  {feasibilityPercentage}%
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#166534', marginTop: '0.25rem' }}>
                  {feasibilityLabel}
                </div>
              </div>
            </div>

            {/* Visual 100% Zero-Waste Distribution Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#140A05' }}>Deterministic Budget Allocations</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#16A34A' }}>Sum: 100% (${sandboxBudget.toLocaleString()})</span>
              </div>

              {/* Multi-Color Segmented Bar */}
              <div style={{ display: 'flex', height: '14px', borderRadius: '99px', overflow: 'hidden', gap: '2px', background: '#E5E7EB', marginBottom: '1rem' }}>
                <div style={{ width: '32%', background: '#F97316' }} title="Venue (32%)" />
                <div style={{ width: '34%', background: '#EA580C' }} title="Catering (34%)" />
                <div style={{ width: '12%', background: '#D97706' }} title="Photography (12%)" />
                <div style={{ width: '8%', background: '#CA8A04' }} title="Decor (8%)" />
                <div style={{ width: '6%', background: '#84CC16' }} title="Music (6%)" />
                <div style={{ width: '8%', background: '#10B981' }} title="Contingency Reserve (8%)" />
              </div>

              {/* Category Breakdown Rows */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#F9FAFB', borderRadius: '6px' }}>
                  <span style={{ color: '#4B5563' }}>🏛️ Venue & Setup (32%)</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>${venueAmt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#F9FAFB', borderRadius: '6px' }}>
                  <span style={{ color: '#4B5563' }}>🍽️ Food & Bar (34%)</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>${cateringAmt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#F9FAFB', borderRadius: '6px' }}>
                  <span style={{ color: '#4B5563' }}>📸 Photography (12%)</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>${photoAmt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#F9FAFB', borderRadius: '6px' }}>
                  <span style={{ color: '#4B5563' }}>🌸 Decor & Florals (8%)</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>${decorAmt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: '#F9FAFB', borderRadius: '6px' }}>
                  <span style={{ color: '#4B5563' }}>🎵 Music & DJ (6%)</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>${musicAmt.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.45rem 0.65rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px' }}>
                  <span style={{ color: '#065F46', fontWeight: 700 }}>🛡️ Contingency (8%)</span>
                  <span style={{ fontWeight: 800, color: '#065F46' }}>${contingencyAmt.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Launch Master Plan Action */}
            <button
              id="btn-sandbox-launch-plan"
              onClick={() => {
                onOpenWizard({
                  eventType: sandboxType,
                  guestCount: sandboxGuests,
                  totalBudget: sandboxBudget,
                  currency: 'USD',
                  venueSetting: sandboxSetting,
                  title: `${sandboxType === 'wedding' ? 'Enchanted' : sandboxType === 'birthday' ? 'Exciting' : 'Grand'} ${sandboxType.toUpperCase()} Celebration`,
                });
              }}
              className="btn-primary pulse-glow"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                justifyContent: 'center',
                marginTop: '0.5rem',
              }}
            >
              <Wand2 size={18} />
              <span>Turn Sandbox into Master Plan ✨</span>
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Interactive 5-Module Feature Showcase Tour */}
      <section className="glass-panel responsive-section-padding" style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2rem auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <Sparkles size={16} color="#EA580C" />
            <span className="badge badge-orange">End-To-End Architecture</span>
          </div>
          <h2 style={{ fontSize: '2rem', color: '#140A05', fontWeight: 800 }}>
            Test-Drive Planora's 5 Core Planning Engines
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4A2B1A', marginTop: '0.35rem', fontWeight: 500 }}>
            Inspect our synchronized data models: live financial math, minute-by-minute run of show, vendor RFP briefs, smart seating, and weather contingency.
          </p>
        </div>

        {/* Tour Navigation Tabs */}
        <div
          className="tab-navigation-bar"
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.65rem',
            marginBottom: '1.75rem',
            borderBottom: '1px solid rgba(234, 88, 12, 0.18)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {[
            { id: 'budget', label: '1. Deterministic Financial Math', icon: DollarSign },
            { id: 'timeline', label: '2. Hourly Run of Show & Director', icon: Clock },
            { id: 'vendors', label: '3. AI Vendor RFP & Vetting', icon: ShieldCheck },
            { id: 'guests', label: '4. Smart Seating & Allergen Guard', icon: UserCheck },
            { id: 'weather', label: '5. Weather Plan B & Rain Guard', icon: CloudRain },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTourTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTourTab(tab.id as any)}
                className="btn-ghost"
                style={{
                  padding: '0.65rem 1.15rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  background: isActive ? 'linear-gradient(135deg, #F97316, #EA580C)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#140A05',
                  border: isActive ? '1px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.2)',
                  boxShadow: isActive ? '0 4px 14px rgba(234, 88, 12, 0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                }}
              >
                <Icon size={15} style={{ marginRight: '0.35rem' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Budget Showcase */}
        {activeTourTab === 'budget' && (
          <div
            className="responsive-panel-padding"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-orange" style={{ marginBottom: '0.3rem' }}>
                  App-Calculated Budget Math
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800 }}>
                  Deterministic Category Allocation Engine (Sum == 100%)
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#78533E', margin: '0.2rem 0 0 0', fontWeight: 500 }}>
                  Budget totals are calculated by the app; vendor prices and AI suggestions are estimates and should be reviewed.
                </p>
              </div>
              <span style={{ fontSize: '0.9rem', color: '#15803D', fontWeight: 800, background: 'rgba(22, 163, 74, 0.1)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
                ✓ 100% Balanced ($20,000 Total)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '0.85rem' }}>
              {[
                { cat: 'Catering & Beverages', amt: '$6,800', pct: '34%', col: '#EA580C' },
                { cat: 'Venue & Staging', amt: '$6,400', pct: '32%', col: '#C2410C' },
                { cat: 'Photography & Film', amt: '$2,400', pct: '12%', col: '#D97706' },
                { cat: 'Floral & Ambience', amt: '$1,600', pct: '8%', col: '#F59E0B' },
                { cat: 'Emergency Contingency', amt: '$2,000', pct: '10%', col: '#16A34A', special: true },
              ].map((item, idx) => (
                <div key={idx} style={{ background: item.special ? 'rgba(34, 197, 94, 0.08)' : 'rgba(251, 247, 240, 0.7)', border: `1px solid ${item.col}40`, padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#4A2B1A' }}>
                    <span>{item.cat}</span>
                    <span style={{ color: item.col }}>{item.pct}</span>
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#140A05', margin: '0.35rem 0' }}>
                    {item.amt}
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ width: item.pct, height: '100%', background: item.col }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(234, 88, 12, 0.15)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: 0, fontWeight: 500 }}>
                Includes auto-adjusting sliders: rebalance one category and contingency automatically absorbs the delta.
              </p>
              <button
                type="button"
                onClick={() => onSelectPlanAndOpenDashboard('preset-wedding-01')}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Test Live Budget Sliders</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Timeline & Live Director */}
        {activeTourTab === 'timeline' && (
          <div
            className="responsive-panel-padding"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-orange" style={{ marginBottom: '0.3rem' }}>
                  Execution Command Center
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800 }}>
                  Day-Of Run-of-Show & Live Event Director Mode
                </h3>
              </div>
              <span className="badge" style={{ background: 'rgba(234, 88, 12, 0.12)', color: '#C2410C' }}>
                <Zap size={13} style={{ marginRight: '0.25rem' }} /> Live Stage Conductor Ready
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { time: '16:00', act: 'Guest Arrival & Acoustic Welcome Strings', owner: 'String Trio Lead', loc: 'Garden Terrace', status: 'Completed' },
                { time: '17:00', act: 'Sunset Vows Ceremony & Floral Blessing', owner: 'Officiant / MC', loc: 'Main Lawn Stage', status: 'ACTIVE NOW', active: true },
                { time: '18:15', act: 'Cocktail Hour & Passed Hors d’Oeuvres', owner: 'Executive Chef', loc: 'Veranda Lounge', status: 'Up Next' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.9rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: item.active ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)' : 'rgba(251, 247, 240, 0.7)',
                    border: item.active ? '1.5px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.15)',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#C2410C', fontSize: '1.05rem' }}>
                      {item.time}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: '#140A05', fontSize: '0.95rem' }}>
                        {item.act}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: '#6B4226' }}>
                        Owner: <strong>{item.owner}</strong> • Location: <strong>{item.loc}</strong>
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: item.active ? '#EA580C' : '#FFFFFF',
                      color: item.active ? '#FFFFFF' : '#6B4226',
                      border: '1px solid rgba(234, 88, 12, 0.25)',
                    }}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(234, 88, 12, 0.15)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: 0, fontWeight: 500 }}>
                Includes 1-Click .ICS calendar export for Apple/Google Calendar and full-screen event floor mode.
              </p>
              <button
                type="button"
                onClick={() => onSelectPlanAndOpenDashboard('preset-wedding-01')}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Inspect Run of Show</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Vendor RFP */}
        {activeTourTab === 'vendors' && (
          <div
            className="responsive-panel-padding"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-orange" style={{ marginBottom: '0.3rem' }}>
                  Professional Procurement
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800 }}>
                  1-Click Vendor RFP Briefs & Targeted Vetting Questions
                </h3>
              </div>
              <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#15803D' }}>
                <Check size={13} style={{ marginRight: '0.25rem' }} /> Auto-Drafted Inquiries
              </span>
            </div>

            <div
              style={{
                background: 'rgba(251, 247, 240, 0.8)',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                fontSize: '0.85rem',
                color: '#2D180F',
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: '#C2410C' }}>Sample Auto-Generated RFP (Catering Vendor):</strong>
              <div style={{ marginTop: '0.4rem', fontFamily: 'var(--font-sans)', fontStyle: 'italic', color: '#4A2B1A' }}>
                "Dear Partner, We are organizing Priya & Arjun's Celestial Botanical Wedding on Oct 18 with 150 guests. We have allocated $6,800 for full dining, cocktail hour, and dietary handling (nut allergy & vegan stations). Please advise on tasting availability, staffing ratios, and service deposit schedule."
              </div>
              <div style={{ marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid rgba(234, 88, 12, 0.15)', fontSize: '0.8rem', color: '#9A3412', fontWeight: 700 }}>
                💡 Includes 3 Hard-Hitting Interview Questions: (1) Overtime hourly penalty rates? (2) Backup generator protocols? (3) Final headcount deadline?
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(234, 88, 12, 0.15)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: 0, fontWeight: 500 }}>
                Generate vendor contracts, compare quotes, and monitor payment deposit milestones.
              </p>
              <button
                type="button"
                onClick={() => onSelectPlanAndOpenDashboard('preset-wedding-01')}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <span>View Vendor Checklist</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Guests & Seating */}
        {activeTourTab === 'guests' && (
          <div
            className="responsive-panel-padding"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge badge-orange" style={{ marginBottom: '0.3rem' }}>
                  Smart Floorplan & Hospitality
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800 }}>
                  Intelligent Table Seating & Dietary Conflict Flags
                </h3>
              </div>
              <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#DC2626' }}>
                <AlertTriangle size={13} style={{ marginRight: '0.25rem' }} /> Allergen Safety Guard
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(251, 247, 240, 0.8)', border: '1.5px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ color: '#140A05', fontSize: '0.95rem' }}>Table 1: Immediate Family</strong>
                  <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>8 / 8 Seats</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#4A2B1A', lineHeight: 1.5 }}>
                  Assigned: Dev Sharma, Sunita Sharma, Priya Sharma...
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#15803D', fontSize: '0.65rem' }}>Vegetarian (3)</span>
                  <span className="badge" style={{ background: 'rgba(234, 88, 12, 0.15)', color: '#C2410C', fontSize: '0.65rem' }}>Near Head Stage</span>
                </div>
              </div>

              <div style={{ background: 'rgba(254, 242, 242, 0.8)', border: '1.5px solid rgba(239, 68, 68, 0.35)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ color: '#991B1B', fontSize: '0.95rem' }}>Table 2: College Cohort</strong>
                  <span className="badge" style={{ background: '#DC2626', color: '#FFFFFF', fontSize: '0.65rem' }}>⚠️ 2 Allergen Flags</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#4A2B1A', lineHeight: 1.5 }}>
                  Assigned: Marcus Vance, Emily Chen, David Miller...
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.65rem', fontWeight: 800 }}>🚨 Severe Peanut Allergy</span>
                  <span className="badge" style={{ background: '#FEE2E2', color: '#991B1B', fontSize: '0.65rem' }}>Gluten-Free</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(234, 88, 12, 0.15)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: 0, fontWeight: 500 }}>
                Includes 1-click Auto-Seat by Group (Family, College, VIP, Community) and CSV guest import.
              </p>
              <button
                type="button"
                onClick={() => onSelectPlanAndOpenDashboard('preset-wedding-01')}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Explore Seating Matrix</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Weather Plan B */}
        {activeTourTab === 'weather' && (
          <div
            className="responsive-panel-padding"
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(2, 132, 199, 0.3)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0369A1', marginBottom: '0.3rem' }}>
                  Outdoor Event Insurance
                </span>
                <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800 }}>
                  Weather "Plan B" Contingency & Rain Simulator
                </h3>
              </div>
              <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.15)', color: '#0284C7' }}>
                <CloudRain size={13} style={{ marginRight: '0.25rem' }} /> Live Weather Guard
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(240, 249, 255, 0.8)', border: '1px solid rgba(2, 132, 199, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase' }}>
                  Simulated Precipitation Radar
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#140A05', margin: '0.3rem 0' }}>
                  84% Heavy Rain Storm
                </div>
                <p style={{ fontSize: '0.8rem', color: '#4A2B1A', margin: 0 }}>
                  1-Click activates tent rental and auto-draws from the 10% contingency reserve without exceeding budget.
                </p>
              </div>

              <div style={{ background: 'rgba(251, 247, 240, 0.8)', border: '1px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EA580C', textTransform: 'uppercase' }}>
                  Instant Guest Broadcast SMS
                </div>
                <div style={{ fontSize: '0.825rem', color: '#2D180F', fontStyle: 'italic', margin: '0.3rem 0', lineHeight: 1.4 }}>
                  "⚠️ Attention Guests: Ceremony relocated to the Covered Glass Pavilion. Valet umbrellas standing by."
                </div>
                <span className="badge" style={{ fontSize: '0.65rem', background: '#FFFFFF', color: '#15803D' }}>
                  ✓ 1-Click Copy Ready
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(2, 132, 199, 0.15)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6B4226', margin: 0, fontWeight: 500 }}>
                Never get caught in a downpour unprepared: structured covered alternatives and vendor shift notices.
              </p>
              <button
                type="button"
                onClick={() => onSelectPlanAndOpenDashboard('preset-wedding-01')}
                className="btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                <span>Test Weather Simulator</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Live Event Readiness Scorecard Calculator Widget */}
      <section
        className="responsive-section-padding readiness-two-col"
        style={{
          background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
          border: '1.5px solid rgba(234, 88, 12, 0.28)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 10px 30px rgba(45, 24, 15, 0.05)',
        }}
      >
        {/* Left: Interactive Scorecard Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
              <Calculator size={18} color="#EA580C" />
              <span className="badge badge-orange">Interactive Health Check</span>
            </div>
            <h2 style={{ fontSize: '1.75rem', color: '#140A05', fontWeight: 800 }}>
              Live Event Readiness Calculator
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', margin: 0, fontWeight: 500 }}>
              Gauge how prepared your celebration is right now. We assess your headcount, budget precision, and contingency status.
            </p>
          </div>

          {/* Slider 1: Headcount */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
              <span>Expected Guest Headcount</span>
              <strong style={{ color: '#EA580C' }}>{readinessHeadcount} Guests</strong>
            </div>
            <input
              type="range"
              min={15}
              max={350}
              step={5}
              value={readinessHeadcount}
              onChange={(e) => setReadinessHeadcount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#EA580C', cursor: 'pointer' }}
            />
          </div>

          {/* Toggle: Budget Precision */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.4rem' }}>
              Financial Budget Status
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {[
                { id: 'locked', label: '100% Locked' },
                { id: 'estimated', label: 'Rough Estimate' },
                { id: 'untracked', label: 'Not Decided' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setReadinessBudgetStatus(b.id as any)}
                  className="btn-ghost"
                  style={{
                    padding: '0.45rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: readinessBudgetStatus === b.id ? '#EA580C' : '#FFFFFF',
                    color: readinessBudgetStatus === b.id ? '#FFFFFF' : '#140A05',
                    border: readinessBudgetStatus === b.id ? '1px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.2)',
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle: Vendor Status */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.4rem' }}>
              Vendor & Venue Contracts
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {[
                { id: 'all', label: 'All Booked' },
                { id: 'some', label: 'Some Vetted' },
                { id: 'none', label: 'None Yet' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setReadinessVendorStatus(v.id as any)}
                  className="btn-ghost"
                  style={{
                    padding: '0.45rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: readinessVendorStatus === v.id ? '#EA580C' : '#FFFFFF',
                    color: readinessVendorStatus === v.id ? '#FFFFFF' : '#140A05',
                    border: readinessVendorStatus === v.id ? '1px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.2)',
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Checkbox: Weather Contingency */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
            <input
              id="chk-weather-plan"
              type="checkbox"
              checked={readinessWeatherPlan}
              onChange={(e) => setReadinessWeatherPlan(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#EA580C', cursor: 'pointer' }}
            />
            <label htmlFor="chk-weather-plan" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#140A05', cursor: 'pointer' }}>
              We have a covered Rain "Plan B" & Emergency Tent Reserve
            </label>
          </div>
        </div>

        {/* Right: Dynamic Readiness Gauge & Action */}
        <div
          className="responsive-panel-padding"
          style={{
            background: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '2px solid rgba(234, 88, 12, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '1.25rem',
            boxShadow: '0 12px 35px rgba(45, 24, 15, 0.08)',
          }}
        >
          {/* Radial Circular Score Display */}
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: `conic-gradient(#16A34A ${readinessScore * 3.6}deg, rgba(234, 88, 12, 0.12) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              boxShadow: '0 8px 25px rgba(22, 163, 74, 0.2)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: '#FFFFFF',
                borderRadius: '50%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: readinessScore >= 80 ? '#15803D' : readinessScore >= 55 ? '#D97706' : '#DC2626', fontFamily: 'var(--font-mono)' }}>
                {readinessScore}%
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#6B4226' }}>
                Readiness
              </span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800, margin: '0.2rem 0' }}>
              {readinessScore >= 85
                ? 'High Execution Readiness ✨'
                : readinessScore >= 60
                  ? 'Moderate Readiness (Gaps Detected)'
                  : 'High Risk (Immediate Action Recommended)'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#4A2B1A', margin: 0, fontWeight: 500, maxWidth: '340px' }}>
              {readinessScore >= 85
                ? 'Your celebration has solid fundamentals. Planora can lock in your minute-by-minute cues and vendor briefs.'
                : 'Missing contingency reserves or untracked vendor dates pose major day-of stress. Generate a master plan to bridge these gaps.'}
            </p>
          </div>

          {/* Auto-Recommendations List */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: readinessBudgetStatus === 'locked' ? '#15803D' : '#D97706', fontWeight: 600 }}>
              {readinessBudgetStatus === 'locked' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>{readinessBudgetStatus === 'locked' ? 'Financial arithmetic reconciled' : 'Budget requires strict 100% category allocation'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: readinessWeatherPlan ? '#15803D' : '#DC2626', fontWeight: 600 }}>
              {readinessWeatherPlan ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>{readinessWeatherPlan ? 'Rain Plan B & Tent buffer accounted' : 'Risk: No bad-weather contingency protocol'}</span>
            </div>
          </div>

          {/* 1-Click Action to Launch Wizard with pre-fills */}
          <button
            type="button"
            id="btn-readiness-launch-plan"
            onClick={() => {
              onOpenWizard({
                guestCount: readinessHeadcount,
                eventType: 'wedding',
                totalBudget: readinessHeadcount * 165,
                currency: 'USD',
                title: `Structured Master Plan (${readinessHeadcount} Guests)`,
              });
            }}
            className="btn-primary pulse-glow"
            style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', fontSize: '0.95rem' }}
          >
            <Sparkles size={16} />
            <span>Generate Structured Master Plan ✨</span>
          </button>
        </div>
      </section>

      {/* 4. My Saved Plans Shelf (Active Event Quick Access) */}
      {plans.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Layers size={18} color="#EA580C" />
                <span className="badge badge-orange">Your Event Workspace</span>
              </div>
              <h2 style={{ fontSize: '1.75rem', color: '#140A05', fontWeight: 800 }}>
                My Saved Master Plans
              </h2>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.825rem', color: '#78533E', fontWeight: 500 }}>
                {currentUser
                  ? `Signed in as ${currentUser.fullName} • Plans are saved and synchronized to cloud storage.`
                  : 'Guest Mode: Plans are saved in your current browser/device. Sign in or create an account to sync across devices.'}
              </p>
            </div>

            <button
              onClick={onOpenPlanManager}
              className="btn-secondary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <span>Manage All Plans ({plans.length})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.25rem' }}>
            {plans.map((plan) => {
              const totalAllocated = plan.budget.items.reduce((sum, item) => sum + item.allocatedAmount, 0);
              const totalSpent = plan.budget.items.reduce((sum, item) => sum + item.spentAmount, 0);

              return (
                <div
                  key={plan.id}
                  onClick={() => onSelectPlanAndOpenDashboard(plan.id)}
                  className="glass-card-interactive"
                  style={{
                    padding: '1.4rem 1.6rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span className="badge badge-orange" style={{ textTransform: 'capitalize' }}>
                        {plan.basics.eventType}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: '#9A3412', fontWeight: 800 }}>
                        {formatCurrency(plan.budget.totalBudget, plan.budget.currency)}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', color: '#140A05', fontWeight: 700, marginBottom: '0.4rem' }}>
                      {plan.basics.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#4A2B1A', lineHeight: 1.5, marginBottom: '1rem', fontWeight: 500 }}>
                      {plan.summary.length > 110 ? `${plan.summary.substring(0, 110)}...` : plan.summary}
                    </p>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6B4226', fontWeight: 600, marginBottom: '0.4rem' }}>
                      <span>{plan.basics.guestCount} Guests</span>
                      <span>Spent: {formatCurrency(totalSpent, plan.budget.currency)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid rgba(234, 88, 12, 0.15)', color: '#C2410C', fontWeight: 700, fontSize: '0.9rem' }}>
                      <span>Open Master Plan Workspace</span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Real Showcase Presets (3 PRD Personas) */}
      <section>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={18} color="#EA580C" />
            <span className="badge badge-orange">Preloaded Showcase Demonstrations</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', color: '#140A05', fontWeight: 800 }}>
            Explore Real Event Archetypes
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#4A2B1A', fontWeight: 500, marginTop: '0.25rem' }}>
            Click any persona to inspect their synchronized budget, timeline, and vendor checklist.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
          {/* Preset 1: Wedding */}
          <div
            onClick={() => onSelectPlanAndOpenDashboard('preset-wedding-01')}
            className="glass-card-interactive"
            style={{ padding: '1.6rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.12)', border: '1px solid rgba(225, 29, 72, 0.35)', color: '#9F1239' }}>
                <Heart size={14} style={{ marginRight: '0.25rem' }} />
                Wedding Master Plan
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#9A3412', fontWeight: 800 }}>
                $25,000 Budget
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem', color: '#140A05', fontWeight: 700 }}>
              Priya & Arjun's Celestial Botanical Wedding
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', lineHeight: 1.55, marginBottom: '1.25rem', fontWeight: 500 }}>
              150 guests, 9 months out, rich heritage fusion, terracotta & gold styling, sequenced vendor roadmaps, and contingency reserves.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#C2410C', fontWeight: 700 }}>
              <span>Launch Wedding Master Plan</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Preset 2: Birthday */}
          <div
            onClick={() => onSelectPlanAndOpenDashboard('preset-birthday-02')}
            className="glass-card-interactive"
            style={{ padding: '1.6rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.14)', border: '1px solid rgba(217, 119, 6, 0.35)', color: '#92400E' }}>
                <Cake size={14} style={{ marginRight: '0.25rem' }} />
                Birthday Party Plan
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#9A3412', fontWeight: 800 }}>
                $600 Budget
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem', color: '#140A05', fontWeight: 700 }}>
              Marcus's 7th Retro Arcade & Cosmic Blast
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', lineHeight: 1.55, marginBottom: '1.25rem', fontWeight: 500 }}>
              25 kids, 3 weeks out, DIY games, nut-safe pizza schedule, hourly run of show, and allergen safety guardrails.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#C2410C', fontWeight: 700 }}>
              <span>Launch Birthday Master Plan</span>
              <ArrowRight size={16} />
            </div>
          </div>

          {/* Preset 3: Community */}
          <div
            onClick={() => onSelectPlanAndOpenDashboard('preset-community-03')}
            className="glass-card-interactive"
            style={{ padding: '1.6rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.14)', border: '1px solid rgba(2, 132, 199, 0.35)', color: '#0369A1' }}>
                <Megaphone size={14} style={{ marginRight: '0.25rem' }} />
                Community Festival
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: '#9A3412', fontWeight: 800 }}>
                $1,500 Grant
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.45rem', color: '#140A05', fontWeight: 700 }}>
              Oakridge River Clean-Up & Harvest Festival
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', lineHeight: 1.55, marginBottom: '1.25rem', fontWeight: 500 }}>
              120 attendees, municipal permits, volunteer shift assignments, waste disposal contracts, and acoustic folk music.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem', color: '#C2410C', fontWeight: 700 }}>
              <span>Launch Community Master Plan</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* 4. How Planora Works (3 Simple Steps) */}
      <section className="glass-panel responsive-section-padding">
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>
            Intuitive 3-Step Process
          </span>
          <h2 style={{ fontSize: '2rem', color: '#140A05', fontWeight: 800 }}>
            How Planora Builds Your Master Plan
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#4A2B1A', marginTop: '0.35rem', fontWeight: 500 }}>
            From scattered thoughts to a structured master plan where budget totals reconcile deterministically.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.75rem' }}>
          {/* Step 1 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.15rem',
                marginBottom: '1rem',
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#140A05', fontWeight: 700, marginBottom: '0.4rem' }}>
              Input Scale & Vision
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', lineHeight: 1.6, fontWeight: 500 }}>
              Select your event type, guest headcount, target date (or flexible T-minus timeline), total budget, and aesthetic vibe.
            </p>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.15rem',
                marginBottom: '1rem',
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#140A05', fontWeight: 700, marginBottom: '0.4rem' }}>
              Deterministic AI Synthesis
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', lineHeight: 1.6, fontWeight: 500 }}>
              Gemini crafts tailored themes and creative ideas while application logic reconciles budget category totals to 100%.
            </p>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-md)',
              padding: '1.75rem',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F97316, #EA580C)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '1.15rem',
                marginBottom: '1rem',
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#140A05', fontWeight: 700, marginBottom: '0.4rem' }}>
              Execute, Sync & Export
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', lineHeight: 1.6, fontWeight: 500 }}>
              Rebalance budget sliders live, check off milestones, sync to Apple/Google calendars via `.ics`, and generate print-ready PDFs.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Feature Comparison Grid (Spreadsheets & ChatGPT vs Planora) */}
      <section>
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
          <span className="badge badge-orange" style={{ marginBottom: '0.5rem' }}>
            Why Planora Wins
          </span>
          <h2 style={{ fontSize: '2rem', color: '#140A05', fontWeight: 800 }}>
            Spreadsheets vs. ChatGPT vs. Planora
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#4A2B1A', marginTop: '0.35rem', fontWeight: 500 }}>
            Why combining deterministic arithmetic with generative AI creates the ultimate event planning tool.
          </p>
        </div>

        <div className="mobile-only-indicator">
          ↔ Swipe horizontally to compare all features
        </div>

        <div
          className="comparison-table-scroll"
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(234, 88, 12, 0.25)',
            borderRadius: 'var(--radius-lg)',
            overflowX: 'auto',
            boxShadow: '0 8px 30px rgba(45, 24, 15, 0.06)',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr',
              minWidth: '640px',
              background: 'rgba(234, 88, 12, 0.08)',
              padding: '1rem 1.5rem',
              fontWeight: 800,
              fontSize: '0.875rem',
              color: '#140A05',
              borderBottom: '1px solid rgba(234, 88, 12, 0.2)',
            }}
          >
            <div>Capability</div>
            <div>Static Spreadsheet</div>
            <div>Generic ChatGPT</div>
            <div style={{ color: '#EA580C' }}>Planora Copilot</div>
          </div>

          {[
            {
              capability: 'Deterministic Financial Math',
              sheet: 'Manual formulas required',
              gpt: 'Hallucinates arithmetic errors',
              planora: 'App calculates exact sum to 100%',
            },
            {
              capability: 'Live Trade-off Assistant',
              sheet: 'None (breaks easily)',
              gpt: 'Text only (no sliders)',
              planora: 'Reactive rebalancing sliders',
            },
            {
              capability: 'Day-of Hourly Run of Show',
              sheet: 'Blank rows',
              gpt: 'Generic list',
              planora: 'Hourly slots with owners & venues',
            },
            {
              capability: 'Vendor Candidate Vetting',
              sheet: 'Names only',
              gpt: 'Generic tips',
              planora: 'Top 3 targeted AI interview questions',
            },
            {
              capability: 'Calendar & PDF Export',
              sheet: 'Manual copy-pasting',
              gpt: 'Plain text markdown',
              planora: '1-Click .ICS & CSS Print PDF',
            },
            {
              capability: 'Storage & Cloud Sync',
              sheet: 'Local file',
              gpt: 'Chat history only',
              planora: 'Option C: Local + Cloud DB Sync',
            },
          ].map((row, idx) => (
            <div
              key={idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr',
                minWidth: '640px',
                padding: '1.1rem 1.5rem',
                borderBottom: idx < 5 ? '1px solid rgba(234, 88, 12, 0.12)' : 'none',
                fontSize: '0.875rem',
                alignItems: 'center',
                background: idx % 2 === 1 ? 'rgba(251, 247, 240, 0.5)' : '#FFFFFF',
              }}
            >
              <div style={{ fontWeight: 700, color: '#140A05' }}>{row.capability}</div>
              <div style={{ color: '#6B4226', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <XCircle size={15} color="#94A3B8" />
                <span>{row.sheet}</span>
              </div>
              <div style={{ color: '#6B4226', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <XCircle size={15} color="#F87171" />
                <span>{row.gpt}</span>
              </div>
              <div style={{ color: '#15803D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} color="#15803D" />
                <span>{row.planora}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Option C Hybrid Cloud Sync Banner */}
      <section
        className="responsive-section-padding"
        style={{
          background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
          border: '1.5px solid rgba(234, 88, 12, 0.28)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Cloud size={20} color="#EA580C" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Hybrid Cloud Persistence
            </span>
          </div>
          <h3 style={{ fontSize: '1.5rem', color: '#140A05', fontWeight: 800, marginBottom: '0.5rem' }}>
            Use Free as a Guest, or Sync Across All Devices
          </h3>
          <p style={{ fontSize: '0.925rem', color: '#3D2214', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
            {currentUser
              ? `You are signed in as ${currentUser.fullName} (${currentUser.email}). All your plans are backed up to the cloud.`
              : 'You have complete freedom: plan right now with zero sign-up (saved locally in your browser), or link your account and database URL for multi-device synchronization.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenAuthModal}
            className="btn-primary"
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
          >
            <Cloud size={17} />
            <span>{currentUser ? 'Manage Cloud Account' : 'Connect Cloud / Sign In'}</span>
          </button>
        </div>
      </section>
    </div>
  );
};
