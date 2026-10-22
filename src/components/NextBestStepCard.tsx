import React, { useState } from 'react';
import {
  Compass,
  CheckCircle,
  X,
  AlertTriangle,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { EventPlan } from '../types';
import { getRecommendedNextStep } from '../utils/deterministicMath';

interface NextBestStepCardProps {
  plan: EventPlan;
  onCompleteTask: (sectionId: string, taskId: string) => void;
  onNavigateToTimeline?: () => void;
}

export const NextBestStepCard: React.FC<NextBestStepCardProps> = ({
  plan,
  onCompleteTask,
  onNavigateToTimeline,
}) => {
  const [dismissedTaskIds, setDismissedTaskIds] = useState<string[]>([]);
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const recommendation = getRecommendedNextStep(plan, dismissedTaskIds);

  const handleComplete = (sectionId: string, taskId: string) => {
    setJustCompletedId(taskId);
    setTimeout(() => {
      onCompleteTask(sectionId, taskId);
      setJustCompletedId(null);
    }, 400);
  };

  const handleDismiss = (taskId: string) => {
    setDismissedTaskIds((prev) => [...prev, taskId]);
  };

  const handleResetDismissed = () => {
    setDismissedTaskIds([]);
  };

  if (!recommendation) {
    return (
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.75rem',
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 253, 244, 0.7))',
          border: '1.5px solid rgba(34, 197, 94, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircle2 size={20} color="#15803D" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#140A05' }}>
              All Priority Milestones Up to Date!
            </h4>
            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.8rem', color: '#166534', fontWeight: 500 }}>
              You have completed all active milestones in your preparation roadmap.
            </p>
          </div>
        </div>

        {dismissedTaskIds.length > 0 && (
          <button
            type="button"
            onClick={handleResetDismissed}
            className="btn-ghost"
            style={{ fontSize: '0.78rem', color: '#78533E', textDecoration: 'underline' }}
          >
            Reset dismissed suggestions ({dismissedTaskIds.length})
          </button>
        )}
      </div>
    );
  }

  const { task, sectionId, sectionPeriod, dateStatus, reason } = recommendation;

  // Date badge color styling
  const renderDateBadge = () => {
    switch (dateStatus.status) {
      case 'overdue':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(239, 68, 68, 0.14)',
              color: '#991B1B',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <AlertTriangle size={12} color="#DC2626" />
            <span>{dateStatus.label}</span>
          </span>
        );
      case 'due_soon':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(245, 158, 11, 0.16)',
              color: '#92400E',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Clock size={12} color="#D97706" />
            <span>{dateStatus.label}</span>
          </span>
        );
      case 'upcoming':
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#1E40AF',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <Calendar size={12} color="#2563EB" />
            <span>{dateStatus.label}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem 1.6rem',
        marginBottom: '1.75rem',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(254, 243, 199, 0.45))',
        border: '1.5px solid rgba(234, 88, 12, 0.32)',
        boxShadow: '0 8px 24px -4px rgba(45, 24, 15, 0.08)',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '0.85rem',
        }}
      >
        {/* Header Label & Metadata */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <span
              className="badge"
              style={{
                background: 'linear-gradient(135deg, #F97316, #D97706)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                padding: '0.2rem 0.65rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 8px rgba(234, 88, 12, 0.35)',
              }}
            >
              <Compass size={13} />
              <span>NEXT BEST STEP</span>
            </span>

            <span
              className="badge"
              style={{
                background: 'rgba(234, 88, 12, 0.08)',
                color: '#78533E',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              {sectionPeriod}
            </span>

            <span
              className="badge"
              style={{
                background:
                  task.priority === 'High'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(234, 88, 12, 0.1)',
                color: task.priority === 'High' ? '#991B1B' : '#9A3412',
                border: '1px solid rgba(234, 88, 12, 0.25)',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              {task.priority} Priority
            </span>

            {renderDateBadge()}
          </div>

          <h3
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#140A05',
              margin: '0.35rem 0',
              lineHeight: 1.3,
            }}
          >
            {task.title}
          </h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.45rem',
              marginTop: '0.45rem',
              fontSize: '0.825rem',
              color: '#573523',
              lineHeight: 1.5,
              fontWeight: 500,
              background: 'rgba(254, 243, 199, 0.55)',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(217, 119, 6, 0.25)',
              maxWidth: '780px',
            }}
          >
            <Sparkles size={14} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Why now:</strong> {reason}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button
            id="btn-complete-next-step"
            type="button"
            onClick={() => handleComplete(sectionId, task.id)}
            disabled={justCompletedId === task.id}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              fontWeight: 700,
            }}
          >
            <CheckCircle size={15} />
            <span>{justCompletedId === task.id ? 'Marking Complete...' : 'Mark Complete'}</span>
          </button>

          <button
            id="btn-dismiss-next-step"
            type="button"
            onClick={() => handleDismiss(task.id)}
            className="btn-secondary"
            title="Dismiss this recommendation and see the next candidate"
            style={{
              padding: '0.55rem 0.95rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#78533E',
              borderColor: 'rgba(234, 88, 12, 0.25)',
            }}
          >
            <X size={14} />
            <span>Dismiss</span>
          </button>

          {onNavigateToTimeline && (
            <button
              type="button"
              onClick={onNavigateToTimeline}
              className="btn-ghost"
              style={{
                padding: '0.55rem 0.75rem',
                fontSize: '0.825rem',
                color: '#C2410C',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontWeight: 700,
              }}
            >
              <span>View Timeline</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
