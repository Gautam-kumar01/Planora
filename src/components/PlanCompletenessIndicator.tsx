import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Briefcase,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { EventPlan } from '../types';
import { calculatePlanCompleteness } from '../utils/deterministicMath';

interface PlanCompletenessIndicatorProps {
  plan: EventPlan;
}

export const PlanCompletenessIndicator: React.FC<PlanCompletenessIndicatorProps> = ({ plan }) => {
  const [isOpen, setIsOpen] = useState(false);
  const completeness = calculatePlanCompleteness(plan);

  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'eventDate':
        return <Calendar size={15} color="#C2410C" />;
      case 'guestCount':
        return <Users size={15} color="#C2410C" />;
      case 'budget':
        return <DollarSign size={15} color="#C2410C" />;
      case 'location':
        return <MapPin size={15} color="#C2410C" />;
      case 'vendors':
        return <Briefcase size={15} color="#C2410C" />;
      default:
        return <Sparkles size={15} color="#C2410C" />;
    }
  };

  return (
    <>
      {/* Clickable Badge Trigger */}
      <button
        id="btn-plan-completeness-trigger"
        type="button"
        onClick={() => setIsOpen(true)}
        className="badge"
        title="Click to view core planning details checklist"
        style={{
          background:
            completeness.score === 100
              ? 'rgba(34, 197, 94, 0.14)'
              : 'rgba(234, 88, 12, 0.12)',
          border:
            completeness.score === 100
              ? '1px solid rgba(34, 197, 94, 0.35)'
              : '1px solid rgba(234, 88, 12, 0.35)',
          color: completeness.score === 100 ? '#15803D' : '#9A3412',
          fontSize: '0.78rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
        }}
      >
        <ShieldCheck size={14} color={completeness.score === 100 ? '#16A34A' : '#C2410C'} />
        <span>
          Plan Completeness: <strong>{completeness.score}%</strong> ({completeness.completedCount}/{completeness.totalCount})
        </span>
        <ChevronDown size={12} />
      </button>

      {/* Popover / Modal Details */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="completeness-dialog-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 10, 5, 0.55)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '1.75rem 2rem',
              background: '#FFFFFF',
              boxShadow: '0 20px 40px rgba(20, 10, 5, 0.25)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px solid rgba(234, 88, 12, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={20} color="#C2410C" />
                  <h3 id="completeness-dialog-title" style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#140A05' }}>
                    Plan Completeness Tracker
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.825rem', color: '#78533E', fontWeight: 500 }}>
                  Evaluates 5 fundamental planning details without blocking your momentum.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-ghost"
                aria-label="Close completeness modal"
                style={{ padding: '0.35rem', color: '#78533E' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Score Progress Bar */}
            <div
              style={{
                background: 'rgba(234, 88, 12, 0.08)',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#573523' }}>Overall Readiness</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#140A05' }}>
                  {completeness.score}%
                </span>
              </div>

              <div
                style={{
                  width: '100%',
                  height: '8px',
                  background: 'rgba(234, 88, 12, 0.15)',
                  borderRadius: '99px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${completeness.score}%`,
                    background:
                      completeness.score === 100
                        ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                        : 'linear-gradient(135deg, #F97316, #D97706)',
                    borderRadius: '99px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* 5 Checklist Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
              {completeness.metrics.map((metric) => (
                <div
                  key={metric.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    background: metric.isComplete ? 'rgba(34, 197, 94, 0.06)' : 'rgba(245, 158, 11, 0.08)',
                    border: metric.isComplete
                      ? '1px solid rgba(34, 197, 94, 0.25)'
                      : '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                      }}
                    >
                      {getMetricIcon(metric.key)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#140A05' }}>
                        {metric.label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 500 }}>
                        {metric.valueDescription}
                      </div>
                    </div>
                  </div>

                  <div>
                    {metric.isComplete ? (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(34, 197, 94, 0.15)',
                          color: '#15803D',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>Entered</span>
                      </span>
                    ) : (
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#92400E',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        <Clock size={12} />
                        <span>Optional</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Non-Blocking Note */}
            <div
              style={{
                fontSize: '0.78rem',
                color: '#573523',
                lineHeight: 1.5,
                padding: '0.65rem 0.85rem',
                background: 'rgba(254, 243, 199, 0.5)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(217, 119, 6, 0.2)',
                marginBottom: '1rem',
              }}
            >
              💡 <strong>Non-blocking design:</strong> Planora allows you to explore budgets, timelines, and vendors at any stage even if your exact date or location is still undecided.
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Close Tracker
            </button>
          </div>
        </div>
      )}
    </>
  );
};
