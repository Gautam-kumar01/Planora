import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  ArrowRight,
  Filter,
  EyeOff,
  Undo2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { EventPlan } from '../types';
import { runPlanConflictAudit } from '../utils/conflictCheckerEngine';

interface PlanConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onUpdatePlan: (updatedFields: Partial<EventPlan>) => void;
}

export const PlanConflictModal: React.FC<PlanConflictModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdatePlan,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'needs_attention' | 'worth_checking' | 'dismissed'>('all');

  if (!isOpen) return null;

  const allFindings = runPlanConflictAudit(plan);

  const activeFindings = allFindings.filter((f) => !f.isDismissed && !f.isResolved);
  const resolvedFindings = allFindings.filter((f) => f.isResolved);
  const dismissedFindings = allFindings.filter((f) => f.isDismissed);

  const needsAttentionCount = activeFindings.filter((f) => f.severity === 'needs_attention').length;
  const worthCheckingCount = activeFindings.filter((f) => f.severity === 'worth_checking').length;

  const handleResolveFinding = (id: string) => {
    const currentResolved = new Set(plan.resolvedConflictIds || []);
    currentResolved.add(id);

    // Also remove from dismissed if present
    const currentDismissed = (plan.dismissedConflictIds || []).filter((d) => d !== id);

    onUpdatePlan({
      resolvedConflictIds: Array.from(currentResolved),
      dismissedConflictIds: currentDismissed,
    });
  };

  const handleDismissFinding = (id: string) => {
    const currentDismissed = new Set(plan.dismissedConflictIds || []);
    currentDismissed.add(id);

    const currentResolved = (plan.resolvedConflictIds || []).filter((r) => r !== id);

    onUpdatePlan({
      dismissedConflictIds: Array.from(currentDismissed),
      resolvedConflictIds: currentResolved,
    });
  };

  const handleUnmarkFinding = (id: string) => {
    const currentResolved = (plan.resolvedConflictIds || []).filter((r) => r !== id);
    const currentDismissed = (plan.dismissedConflictIds || []).filter((d) => d !== id);

    onUpdatePlan({
      resolvedConflictIds: currentResolved,
      dismissedConflictIds: currentDismissed,
    });
  };

  const displayedFindings = allFindings.filter((f) => {
    if (filterMode === 'dismissed') {
      return f.isDismissed || f.isResolved;
    }
    if (f.isDismissed || f.isResolved) return false;
    if (filterMode === 'needs_attention') return f.severity === 'needs_attention';
    if (filterMode === 'worth_checking') return f.severity === 'worth_checking';
    return true;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="conflict-dialog-title"
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
          maxWidth: '820px',
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
              <ShieldAlert size={20} color="#C2410C" />
              <span className="badge badge-orange">Plan Conflict Checker</span>
            </div>
            <h2 id="conflict-dialog-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#140A05' }}>
              Plan Conflict & Inconsistency Audit
            </h2>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#78533E', fontWeight: 500 }}>
              Checks capacity, budget allocations, timeline sequencing, and vendor booking deadlines for inconsistencies.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            aria-label="Close conflict checker modal"
            style={{ padding: '0.4rem', color: '#78533E' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Severity Count Summary Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: needsAttentionCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.08)',
              border: needsAttentionCount > 0 ? '1.5px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: needsAttentionCount > 0 ? '#991B1B' : '#15803D' }}>
              ⚠️ Needs Attention
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: needsAttentionCount > 0 ? '#DC2626' : '#16A34A' }}>
              {needsAttentionCount}
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: worthCheckingCount > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(34, 197, 94, 0.08)',
              border: worthCheckingCount > 0 ? '1.5px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(34, 197, 94, 0.3)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400E' }}>
              💡 Worth Checking
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: '#D97706' }}>
              {worthCheckingCount}
            </div>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D' }}>
              ✓ Resolved / Dismissed
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', fontWeight: 800, color: '#16A34A' }}>
              {resolvedFindings.length + dismissedFindings.length}
            </div>
          </div>
        </div>

        {/* Filter Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#573523' }}>Filter:</span>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={filterMode === 'all' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
          >
            All Active ({activeFindings.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('needs_attention')}
            className={filterMode === 'needs_attention' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
          >
            Needs Attention ({needsAttentionCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('worth_checking')}
            className={filterMode === 'worth_checking' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
          >
            Worth Checking ({worthCheckingCount})
          </button>
          {(resolvedFindings.length > 0 || dismissedFindings.length > 0) && (
            <button
              type="button"
              onClick={() => setFilterMode('dismissed')}
              className={filterMode === 'dismissed' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
            >
              Resolved / Dismissed ({resolvedFindings.length + dismissedFindings.length})
            </button>
          )}
        </div>

        {/* Findings List */}
        {displayedFindings.length === 0 ? (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(240, 253, 244, 0.7), rgba(255, 255, 255, 0.95))',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(34, 197, 94, 0.35)',
              marginBottom: '1.5rem',
            }}
          >
            <CheckCircle2 size={36} color="#16A34A" style={{ margin: '0 auto 0.65rem auto', display: 'block' }} />
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 800, color: '#140A05' }}>
              No Active Conflicts Found!
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#15803D', fontWeight: 500 }}>
              Your guest seating, budget allocations, task timelines, and vendor lead times look consistent.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {displayedFindings.map((finding) => {
              const isNeedsAttention = finding.severity === 'needs_attention';

              return (
                <div
                  key={finding.id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: finding.isResolved
                      ? 'rgba(240, 253, 244, 0.8)'
                      : finding.isDismissed
                      ? 'rgba(243, 244, 246, 0.7)'
                      : '#FFFFFF',
                    border: finding.isResolved
                      ? '1px solid rgba(34, 197, 94, 0.4)'
                      : isNeedsAttention
                      ? '1.5px solid rgba(239, 68, 68, 0.35)'
                      : '1.5px solid rgba(245, 158, 11, 0.35)',
                    boxShadow: '0 4px 14px rgba(20, 10, 5, 0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span
                        className="badge"
                        style={{
                          background: isNeedsAttention ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isNeedsAttention ? '#991B1B' : '#92400E',
                          border: isNeedsAttention ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                          fontSize: '0.725rem',
                          fontWeight: 800,
                        }}
                      >
                        {isNeedsAttention ? '⚠️ Needs attention' : '💡 Worth checking'}
                      </span>

                      <span
                        className="badge"
                        style={{
                          background: 'rgba(234, 88, 12, 0.08)',
                          color: '#78533E',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                        }}
                      >
                        {finding.category}
                      </span>

                      {finding.isResolved && (
                        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#15803D', fontSize: '0.7rem', fontWeight: 700 }}>
                          ✓ Resolved
                        </span>
                      )}

                      {finding.isDismissed && (
                        <span className="badge" style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#4B5563', fontSize: '0.7rem' }}>
                          Dismissed
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {!finding.isResolved && !finding.isDismissed && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleResolveFinding(finding.id)}
                            className="btn-secondary"
                            title="Mark this conflict resolved"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', color: '#15803D', borderColor: 'rgba(34, 197, 94, 0.4)' }}
                          >
                            <CheckCircle2 size={13} />
                            <span>Mark Resolved</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDismissFinding(finding.id)}
                            className="btn-ghost"
                            title="Dismiss this finding"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', color: '#78533E' }}
                          >
                            <EyeOff size={13} />
                            <span>Dismiss</span>
                          </button>
                        </>
                      )}

                      {(finding.isResolved || finding.isDismissed) && (
                        <button
                          type="button"
                          onClick={() => handleUnmarkFinding(finding.id)}
                          className="btn-ghost"
                          title="Restore finding to active status"
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', color: '#C2410C' }}
                        >
                          <Undo2 size={13} />
                          <span>Reopen</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#140A05' }}>
                    {finding.title}
                  </h4>

                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#2C1810', lineHeight: 1.5, fontWeight: 500 }}>
                    {finding.explanation}
                  </p>

                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: '#78533E',
                      background: 'rgba(234, 88, 12, 0.06)',
                      padding: '0.45rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(234, 88, 12, 0.15)',
                    }}
                  >
                    <strong>Plan Details:</strong> {finding.affectedDetails}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.45rem',
                      fontSize: '0.825rem',
                      color: '#15803D',
                      fontWeight: 600,
                      background: 'rgba(240, 253, 244, 0.6)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(34, 197, 94, 0.25)',
                    }}
                  >
                    <ArrowRight size={14} color="#16A34A" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>
                      <strong>Suggested next step:</strong> {finding.suggestedNextStep}
                    </span>
                  </div>

                  {finding.disclaimer && (
                    <div
                      style={{
                        fontSize: '0.74rem',
                        color: '#78533E',
                        fontStyle: 'italic',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        marginTop: '0.15rem',
                      }}
                    >
                      <Info size={12} color="#D97706" style={{ flexShrink: 0 }} />
                      <span>{finding.disclaimer}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Global Advisory Notice */}
        <div
          style={{
            fontSize: '0.78rem',
            color: '#78533E',
            background: 'rgba(254, 243, 199, 0.45)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}
        >
          ⚖️ <strong>Professional Confirmation Disclaimer:</strong> Planora flags mathematical and chronological discrepancies to assist coordination. Food allergies, building occupancy limits, municipal permits, and contractual commitments must always be confirmed directly with licensed caterers, venue management, and local municipal authorities.
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.6rem 1.4rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
