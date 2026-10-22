import React from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  Sparkles,
  PieChart,
  Heart,
  Cake,
  Megaphone,
  CheckCircle,
  ShieldCheck,
  Home,
  Sun,
  CloudSun,
  Info,
  Share2,
  Printer,
  FileText,
  Globe,
  ShieldAlert,
} from 'lucide-react';
import { EventPlan } from '../types';
import { formatCurrency, calculatePerGuest } from '../utils/deterministicMath';
import { PlanCompletenessIndicator } from './PlanCompletenessIndicator';
import { runPlanConflictAudit } from '../utils/conflictCheckerEngine';

interface EventHeaderProps {
  plan: EventPlan;
  onOpenAiTransparency?: () => void;
  onOpenShareModal?: () => void;
  onOpenAiDocs?: () => void;
  onPrint?: () => void;
  onExportICS?: () => void;
  onOpenChangeImpact?: () => void;
  onOpenConflictChecker?: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  plan,
  onOpenAiTransparency,
  onOpenShareModal,
  onOpenAiDocs,
  onPrint,
  onExportICS,
  onOpenChangeImpact,
  onOpenConflictChecker,
}) => {
  const { basics, budget, updatedAt } = plan;

  const activeConflictCount = runPlanConflictAudit(plan).filter((f) => !f.isDismissed && !f.isResolved).length;

  // Calculate Days Remaining or T-Minus
  const calculateDaysLeft = (): { text: string; isPast: boolean } => {
    if (!basics.eventDate || basics.dateType === 'undecided') {
      return { text: 'Flexible Timeline (T-Minus Mode)', isPast: false };
    }
    const target = new Date(basics.eventDate).getTime();
    const now = new Date().getTime();
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));

    if (diff > 0) {
      return { text: `${diff} Days to Go!`, isPast: false };
    } else if (diff === 0) {
      return { text: "Today is the Big Day! 🎉", isPast: false };
    } else {
      return { text: `Event was ${Math.abs(diff)} days ago`, isPast: true };
    }
  };

  const daysInfo = calculateDaysLeft();

  // Budget calculations
  const totalAllocated = budget.items.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const totalSpent = budget.items.reduce((sum, item) => sum + item.spentAmount, 0);
  const percentAllocated = budget.totalBudget > 0 ? Math.min(100, Math.round((totalAllocated / budget.totalBudget) * 100)) : 100;
  const perGuest = calculatePerGuest(budget.totalBudget, basics.guestCount);

  // Type badge styling
  const renderTypeIcon = () => {
    switch (basics.eventType) {
      case 'wedding':
        return <Heart size={16} color="#fb7185" />;
      case 'birthday':
        return <Cake size={16} color="#fbbf24" />;
      case 'community':
        return <Megaphone size={16} color="#38bdf8" />;
      default:
        return <Sparkles size={16} color="#f97316" />;
    }
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <section className="glass-panel" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '2rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Left Column: Title & Key Badges */}
        <div style={{ flex: '1 1 500px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: 'rgba(234, 88, 12, 0.12)',
                border: '1px solid rgba(234, 88, 12, 0.35)',
                color: '#9A3412',
                textTransform: 'capitalize',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              {renderTypeIcon()}
              <span>{basics.eventType} Master Plan</span>
            </span>

            <span
              className="badge"
              style={{
                background: 'rgba(245, 158, 11, 0.14)',
                border: '1px solid rgba(217, 119, 6, 0.35)',
                color: '#92400E',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <Clock size={14} />
              <span>{daysInfo.text}</span>
            </span>

            {/* FR-31: Last Updated Indicator */}
            <span
              className="badge"
              style={{
                background: 'rgba(22, 163, 74, 0.14)',
                border: '1px solid rgba(22, 163, 74, 0.35)',
                color: '#15803D',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
              title="FR-31: Last modified time recorded locally"
            >
              <CheckCircle size={12} />
              <span>Saved {formatRelativeTime(updatedAt)}</span>
            </span>

            {/* Priority 3.2: Plan Completeness Indicator */}
            <PlanCompletenessIndicator plan={plan} />

            {onOpenAiTransparency && (
              <button
                type="button"
                onClick={onOpenAiTransparency}
                className="badge"
                style={{
                  background: 'rgba(234, 88, 12, 0.12)',
                  border: '1px solid rgba(234, 88, 12, 0.35)',
                  color: '#9A3412',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                title="View AI Transparency, Ethics & Safeguards (Challenge 5)"
              >
                <ShieldCheck size={12} color="#C2410C" />
                <span>AI Ethics & Disclosure</span>
              </button>
            )}

            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="badge"
                style={{
                  background: 'rgba(249, 115, 22, 0.12)',
                  border: '1px solid rgba(251, 146, 60, 0.35)',
                  color: '#9A3412',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
                title="Share Read-Only Plan or Manage Collaborators"
              >
                <Share2 size={12} color="#C2410C" />
                <span>Share & Team</span>
              </button>
            )}
          </div>

          <h1
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              color: '#140A05',
              letterSpacing: '-0.025em',
            }}
          >
            {basics.title}
          </h1>

          <p style={{ color: '#2C1810', fontSize: '1rem', marginBottom: '1.25rem', maxWidth: '750px', lineHeight: 1.6, fontWeight: 500 }}>
            {plan.summary}
          </p>

          {/* Metadata Chips: Explicit User Fact vs AI Estimate Badging (FR-11) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
            {basics.eventDate && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  color: '#2D180F',
                  fontWeight: 600,
                  background: 'rgba(234, 88, 12, 0.08)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(234, 88, 12, 0.22)',
                }}
                title="User Confirmed Fact"
              >
                <Calendar size={15} color="#C2410C" />
                <span>{new Date(basics.eventDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(22, 163, 74, 0.14)', color: '#15803D', border: '1px solid rgba(22, 163, 74, 0.3)' }}>Fact</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                color: '#2D180F',
                fontWeight: 600,
                background: 'rgba(234, 88, 12, 0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(234, 88, 12, 0.22)',
              }}
              title="User Confirmed Fact"
            >
              <Users size={15} color="#C2410C" />
              <span>{basics.guestCount} Attendees ({formatCurrency(perGuest, basics.currency)} / guest)</span>
              <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', background: 'rgba(22, 163, 74, 0.14)', color: '#15803D', border: '1px solid rgba(22, 163, 74, 0.3)' }}>Fact</span>
            </div>

            {/* Explicit Location, Currency & Time Zone (Priority 3.5) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                color: '#2D180F',
                fontWeight: 600,
                background: 'rgba(234, 88, 12, 0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(234, 88, 12, 0.22)',
              }}
              title="Event Location"
            >
              <MapPin size={15} color="#C2410C" />
              <span>{basics.location || 'Location Pending'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                color: '#2D180F',
                fontWeight: 600,
                background: 'rgba(234, 88, 12, 0.08)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(234, 88, 12, 0.22)',
              }}
              title="Regional Currency & Time Zone"
            >
              <Globe size={15} color="#C2410C" />
              <span>
                {basics.currency} ({basics.timeZone || 'UTC'})
              </span>
            </div>

            {/* Venue Setting Chip */}
            {basics.venueSetting && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.85rem',
                  color: '#2D180F',
                  fontWeight: 600,
                  background: 'rgba(234, 88, 12, 0.08)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(234, 88, 12, 0.22)',
                  textTransform: 'capitalize',
                }}
              >
                {basics.venueSetting === 'indoor' ? <Home size={14} color="#C2410C" /> : basics.venueSetting === 'outdoor' ? <Sun size={14} color="#C2410C" /> : <CloudSun size={14} color="#C2410C" />}
                <span>{basics.venueSetting} Setting</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontSize: '0.85rem',
                color: '#9A3412',
                fontWeight: 600,
                background: 'rgba(234, 88, 12, 0.12)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
              }}
            >
              <Sparkles size={14} color="#D97706" />
              <span>{basics.preferences.vibe}</span>
            </div>
          </div>

          {/* Transparent Cost & Pricing Disclaimer (Priority 1.5 & 3.5) */}
          <div
            style={{
              marginTop: '0.85rem',
              fontSize: '0.78rem',
              color: '#78533E',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 500,
            }}
          >
            <Info size={14} color="#C2410C" style={{ flexShrink: 0 }} />
            <span>
              Budget totals are calculated by the app; prices and vendor ranges are planning estimates (not verified live local market quotes).
            </span>
          </div>
        </div>

        {/* Right Column: Financial Health Gauge */}
        <div
          style={{
            flex: '0 0 320px',
            background: 'rgba(255, 255, 255, 0.96)',
            border: '1.5px solid rgba(234, 88, 12, 0.24)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem 1.4rem',
            boxShadow: '0 8px 24px -4px rgba(45, 24, 15, 0.06)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#78533E', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Deterministic Budget
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#C2410C', fontSize: '0.825rem', fontWeight: 700 }}>
              <PieChart size={14} />
              <span>{percentAllocated}% Allocated</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.85rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.95rem',
                fontWeight: 800,
                color: '#140A05',
                letterSpacing: '-0.02em',
              }}
            >
              {formatCurrency(budget.totalBudget, budget.currency)}
            </span>
            <span style={{ color: '#78533E', fontSize: '0.85rem', fontWeight: 600 }}>Total</span>
          </div>

          {/* Progress Bar (Restrained Orange-to-Amber Gradient) */}
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(234, 88, 12, 0.15)',
              borderRadius: '99px',
              overflow: 'hidden',
              marginBottom: '0.75rem',
              border: '1px solid rgba(234, 88, 12, 0.2)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${percentAllocated}%`,
                background: 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)',
                borderRadius: '99px',
                boxShadow: '0 0 10px rgba(249, 115, 22, 0.4)',
              }}
            />
          </div>

          {/* Spent vs Remaining details */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#573523' }}>
            <div>
              <span>Spent so far: </span>
              <strong style={{ color: '#9A3412', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {formatCurrency(totalSpent, budget.currency)}
              </strong>
            </div>
            <div>
              <span>Categories: </span>
              <strong style={{ color: '#140A05', fontWeight: 700 }}>{budget.items.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Planning Workspace Action Toolbar (Phase 6): Share, Export PDF, Sync Calendar, AI Ethics */}
      <div
        className="no-print"
        style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1.5px solid rgba(234, 88, 12, 0.16)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#573523', fontWeight: 700 }}>
          <Sparkles size={16} color="var(--color-orange-500)" />
          <span>Plan Actions & Exports:</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {onOpenChangeImpact && (
            <button
              id="btn-workspace-change-impact"
              type="button"
              onClick={onOpenChangeImpact}
              className="btn-secondary"
              title="Change event parameters (guests, budget, date, venue) and review downstream impacts"
              style={{
                padding: '0.5rem 1.05rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(45, 24, 15, 0.05)',
              }}
            >
              <Sparkles size={15} color="#C2410C" />
              <span>Review Plan Impact</span>
            </button>
          )}

          {onOpenConflictChecker && (
            <button
              id="btn-workspace-conflict-checker"
              type="button"
              onClick={onOpenConflictChecker}
              className="btn-secondary"
              title="Audit plan for capacity deficits, budget overages, overdue dates, and lead times"
              style={{
                padding: '0.5rem 1.05rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: activeConflictCount > 0 ? 'rgba(254, 243, 199, 0.6)' : '#FFFFFF',
                borderColor: activeConflictCount > 0 ? 'rgba(234, 88, 12, 0.4)' : 'rgba(234, 88, 12, 0.25)',
                boxShadow: '0 2px 6px rgba(45, 24, 15, 0.05)',
              }}
            >
              <ShieldAlert size={15} color="#C2410C" />
              <span>Check My Plan</span>
              {activeConflictCount > 0 && (
                <span
                  className="badge"
                  style={{
                    background: '#EA580C',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '99px',
                  }}
                >
                  {activeConflictCount}
                </span>
              )}
            </button>
          )}

          {onOpenShareModal && (
            <button
              id="btn-workspace-share"
              onClick={onOpenShareModal}
              className="btn-secondary"
              title="Share read-only plan link or manage co-planner roles"
              style={{
                padding: '0.5rem 1.05rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(45, 24, 15, 0.05)',
              }}
            >
              <Share2 size={15} color="#C2410C" />
              <span>Share & Team</span>
            </button>
          )}

          {onOpenAiDocs && (
            <button
              id="btn-workspace-docs"
              onClick={onOpenAiDocs}
              className="btn-secondary"
              title="Generate Invitations, Speeches, Toasts & Vendor Inquiries with AI"
              style={{
                padding: '0.5rem 1.05rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12), rgba(245, 158, 11, 0.16))',
                border: '1.5px solid rgba(234, 88, 12, 0.35)',
                color: '#9A3412',
                boxShadow: '0 2px 6px rgba(45, 24, 15, 0.05)',
                cursor: 'pointer',
              }}
            >
              <FileText size={15} color="#C2410C" />
              <span>AI Document Studio</span>
            </button>
          )}

          {onPrint && (
            <button
              id="btn-workspace-print"
              onClick={onPrint}
              className="btn-secondary"
              title="Print master plan or save as PDF"
              style={{
                padding: '0.5rem 1.05rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(45, 24, 15, 0.05)',
              }}
            >
              <Printer size={15} color="#C2410C" />
              <span>Export PDF / Print</span>
            </button>
          )}

          {onExportICS && (
            <button
              id="btn-workspace-ical"
              onClick={onExportICS}
              className="btn-secondary"
              title="Download iCal (.ics) with reminder alarms"
              style={{
                padding: '0.5rem 1.05rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(45, 24, 15, 0.05)',
              }}
            >
              <Calendar size={15} color="#C2410C" />
              <span>Sync Calendar (.ics)</span>
            </button>
          )}

          {onOpenAiTransparency && (
            <button
              id="btn-workspace-ethics"
              onClick={onOpenAiTransparency}
              className="btn-ghost"
              title="Review AI transparency, safeguards and limitations"
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#78533E',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <ShieldCheck size={15} color="#D97706" />
              <span>AI Ethics & Disclosure</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
