import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { EventPlan, PlanImpactSuggestion } from '../types';
import { analyzePlanChangeImpact, applyAcceptedImpactSuggestions } from '../utils/changeImpactEngine';
import { formatCurrency } from '../utils/deterministicMath';

interface ChangeImpactModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onApplyChanges: (updatedPlan: EventPlan) => void;
  initialProposedChanges?: {
    guestCount?: number;
    totalBudget?: number;
    eventDate?: string;
    location?: string;
    vibe?: string;
  };
}

export const ChangeImpactModal: React.FC<ChangeImpactModalProps> = ({
  isOpen,
  onClose,
  plan,
  onApplyChanges,
  initialProposedChanges,
}) => {
  const [guestCount, setGuestCount] = useState<number>(
    initialProposedChanges?.guestCount ?? plan.basics.guestCount ?? 100
  );
  const [totalBudget, setTotalBudget] = useState<number>(
    initialProposedChanges?.totalBudget ?? plan.budget.totalBudget ?? 10000
  );
  const [eventDate, setEventDate] = useState<string>(
    initialProposedChanges?.eventDate ?? plan.basics.eventDate ?? ''
  );
  const [location, setLocation] = useState<string>(
    initialProposedChanges?.location ?? plan.basics.location ?? ''
  );
  const [vibe, setVibe] = useState<string>(
    initialProposedChanges?.vibe ?? plan.basics.preferences.vibe ?? ''
  );

  const [acceptedSuggestionIds, setAcceptedSuggestionIds] = useState<Set<string>>(new Set());
  const [showReviewStep, setShowReviewStep] = useState<boolean>(true);

  if (!isOpen) return null;

  // Run deterministic change impact analysis
  const impactAnalysis = analyzePlanChangeImpact(plan, {
    guestCount,
    totalBudget,
    eventDate,
    location,
    vibe,
  });

  const hasAnyChanges = impactAnalysis.changedFields.length > 0;

  const toggleAcceptSuggestion = (id: string) => {
    setAcceptedSuggestionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApply = () => {
    const acceptedList: PlanImpactSuggestion[] = impactAnalysis.suggestions
      .filter((s) => acceptedSuggestionIds.has(s.id))
      .map((s) => ({ ...s, accepted: true }));

    const updated = applyAcceptedImpactSuggestions(plan, acceptedList, {
      guestCount,
      totalBudget,
      eventDate,
      location,
      preferences: {
        ...plan.basics.preferences,
        vibe,
      },
    });

    onApplyChanges(updated);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="impact-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 10, 5, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 48px rgba(20, 10, 5, 0.25)',
          border: '1.5px solid rgba(234, 88, 12, 0.35)',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Sparkles size={18} color="#C2410C" />
              <span className="badge badge-orange">Change Impact Assistant</span>
            </div>
            <h2 id="impact-modal-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#140A05' }}>
              Review Plan Impact & Suggested Updates
            </h2>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#78533E', fontWeight: 500 }}>
              Modify event parameters and review downstream impacts on your budget, capacity, and deadlines before confirming.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            aria-label="Close change impact assistant"
            style={{ padding: '0.4rem', color: '#78533E' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Input Parameters Form */}
        <div
          style={{
            background: 'rgba(254, 243, 199, 0.35)',
            border: '1.5px solid rgba(234, 88, 12, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#140A05', marginBottom: '0.85rem' }}>
            Event Planning Parameters
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                <Users size={14} color="#C2410C" />
                <span>Guest Count</span>
              </label>
              <input
                type="number"
                min={1}
                max={5000}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#140A05',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                <DollarSign size={14} color="#C2410C" />
                <span>Total Budget ({plan.budget.currency})</span>
              </label>
              <input
                type="number"
                min={100}
                step={500}
                value={totalBudget}
                onChange={(e) => setTotalBudget(Math.max(0, parseInt(e.target.value) || 0))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  color: '#140A05',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                <Calendar size={14} color="#C2410C" />
                <span>Target Event Date</span>
              </label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  fontSize: '0.85rem',
                  color: '#140A05',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                <MapPin size={14} color="#C2410C" />
                <span>Venue / Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Botanical Pavilion, Downtown Hotel"
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(234, 88, 12, 0.3)',
                  fontSize: '0.85rem',
                  color: '#140A05',
                }}
              />
            </div>
          </div>
        </div>

        {/* Change Impact Analysis Section */}
        {hasAnyChanges ? (
          <div>
            {/* Plain-Language Explanations */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#140A05', marginBottom: '0.65rem' }}>
                Impact Summary
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {impactAnalysis.plainLanguageExplanation.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#2C1810',
                      lineHeight: 1.5,
                      background: 'rgba(255, 255, 255, 0.9)',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(234, 88, 12, 0.2)',
                    }}
                  >
                    <ArrowRight size={14} color="#C2410C" style={{ flexShrink: 0, marginTop: '3px' }} />
                    <span>{exp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Updates / Diff List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#140A05' }}>
                  Suggested Plan Updates ({impactAnalysis.suggestions.length})
                </div>
                <div style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 600 }}>
                  Select which recommendations to apply. Unchecked items will remain unchanged.
                </div>
              </div>

              {impactAnalysis.suggestions.length === 0 ? (
                <div
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    background: 'rgba(243, 244, 246, 0.6)',
                    borderRadius: 'var(--radius-md)',
                    color: '#6B7280',
                    fontSize: '0.85rem',
                  }}
                >
                  No specific downstream item edits required for this change.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {impactAnalysis.suggestions.map((sugg) => {
                    const isChecked = acceptedSuggestionIds.has(sugg.id);
                    return (
                      <div
                        key={sugg.id}
                        onClick={() => toggleAcceptSuggestion(sugg.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          background: isChecked ? 'rgba(34, 197, 94, 0.08)' : '#FFFFFF',
                          border: isChecked
                            ? '1.5px solid rgba(34, 197, 94, 0.45)'
                            : '1px solid rgba(234, 88, 12, 0.25)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleAcceptSuggestion(sugg.id)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ marginTop: '3px', cursor: 'pointer' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                              <span
                                className="badge"
                                style={{
                                  background: 'rgba(234, 88, 12, 0.1)',
                                  color: '#9A3412',
                                  fontSize: '0.7rem',
                                  textTransform: 'uppercase',
                                  fontWeight: 700,
                                }}
                              >
                                {sugg.section}
                              </span>
                              <strong style={{ fontSize: '0.9rem', color: '#140A05' }}>
                                {sugg.targetItemTitle}
                              </strong>
                              {sugg.isEstimate && (
                                <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.15)', color: '#92400E' }}>
                                  Estimate
                                </span>
                              )}
                            </div>

                            <div style={{ fontSize: '0.8rem', color: '#573523', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                              <span>Current: <del style={{ color: '#78533E' }}>{sugg.currentValue}</del></span>
                              <ArrowRight size={12} color="#C2410C" />
                              <strong style={{ color: '#15803D' }}>Suggested: {sugg.suggestedValue}</strong>
                            </div>

                            <p style={{ margin: 0, fontSize: '0.78rem', color: '#78533E', lineHeight: 1.4 }}>
                              {sugg.rationale}
                            </p>
                          </div>
                        </div>

                        <div>
                          {isChecked ? (
                            <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#15803D', fontSize: '0.72rem', fontWeight: 700 }}>
                              ✓ Will Apply
                            </span>
                          ) : (
                            <span className="badge" style={{ background: 'rgba(209, 213, 219, 0.5)', color: '#4B5563', fontSize: '0.72rem' }}>
                              Ignore
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '1.25rem',
              textAlign: 'center',
              background: 'rgba(243, 244, 246, 0.5)',
              borderRadius: 'var(--radius-md)',
              color: '#78533E',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
            }}
          >
            Adjust any of the parameters above (e.g. increase guest count or budget) to calculate downstream planning impacts.
          </div>
        )}

        {/* Safety & Non-Overwrite Disclaimer */}
        <div
          style={{
            fontSize: '0.78rem',
            color: '#78533E',
            background: 'rgba(254, 243, 199, 0.5)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <ShieldCheck size={16} color="#C2410C" style={{ flexShrink: 0 }} />
          <span>
            <strong>Non-destructive Safety Design:</strong> Planora never silently overwrites your customizations. Only the parameters and suggestions you explicitly confirm will be applied. Unrelated plan sections remain preserved.
          </span>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem' }}
          >
            Cancel
          </button>

          <button
            id="btn-confirm-change-impact"
            type="button"
            onClick={handleApply}
            disabled={!hasAnyChanges}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.35rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Check size={16} />
            <span>Apply Confirmed Changes ({acceptedSuggestionIds.size} accepted)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
