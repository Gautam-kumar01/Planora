import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Sparkles,
  ArrowRight,
  Check,
  RefreshCw,
  Sliders,
  X,
  HelpCircle,
} from 'lucide-react';
import { EventPlan, BudgetItem } from '../types';
import { formatCurrency, calculatePerGuest, assessBudgetFeasibility } from '../utils/deterministicMath';

interface WhatIfSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onApplyScenario: (newBudget: number, newGuestCount: number, updatedItems?: BudgetItem[]) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  isOpen,
  onClose,
  plan,
  onApplyScenario,
}) => {
  const { basics, budget } = plan;

  const [guestDeltaPercent, setGuestDeltaPercent] = useState<number>(0);
  const [budgetDeltaAmount, setBudgetDeltaAmount] = useState<number>(0);
  const [isVenueFree, setIsVenueFree] = useState<boolean>(false);

  if (!isOpen) return null;

  // Compute simulated values
  const simulatedGuests = Math.max(1, Math.round(basics.guestCount * (1 + guestDeltaPercent / 100)));
  const simulatedBudget = Math.max(100, budget.totalBudget + budgetDeltaAmount);

  const basePerGuest = calculatePerGuest(budget.totalBudget, basics.guestCount);
  const simulatedPerGuest = calculatePerGuest(simulatedBudget, simulatedGuests);

  // Feasibility of simulated scenario
  const simFeasibility = assessBudgetFeasibility(
    basics.eventType,
    simulatedBudget,
    simulatedGuests,
    budget.currency
  );

  // Compute simulated item allocations
  const venueCat = budget.items.find((i) => i.category.toLowerCase().includes('venue'));
  const cateringCat = budget.items.find((i) => i.category.toLowerCase().includes('food') || i.category.toLowerCase().includes('catering'));

  const handleApply = () => {
    // Generate scaled budget items
    const ratio = simulatedBudget / budget.totalBudget;
    let newItems: BudgetItem[] = budget.items.map((item) => {
      let allocated = Math.round(item.allocatedAmount * ratio);

      // If free venue selected, reduce venue by 70% and reallocate to catering & buffer
      if (isVenueFree && item.category.toLowerCase().includes('venue')) {
        allocated = Math.round(allocated * 0.25);
      }
      return {
        ...item,
        allocatedAmount: allocated,
        percentage: Math.round((allocated / simulatedBudget) * 100),
      };
    });

    // Reconcile discrepancy into contingency
    const sum = newItems.reduce((acc, cur) => acc + cur.allocatedAmount, 0);
    const diff = simulatedBudget - sum;
    const contingency = newItems.find((i) => i.isContingency) || newItems[newItems.length - 1];
    if (contingency && diff !== 0) {
      contingency.allocatedAmount += diff;
      contingency.percentage = Math.round((contingency.allocatedAmount / simulatedBudget) * 100);
    }

    onApplyScenario(simulatedBudget, simulatedGuests, newItems);
    onClose();
  };

  const handleReset = () => {
    setGuestDeltaPercent(0);
    setBudgetDeltaAmount(0);
    setIsVenueFree(false);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.98)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
              }}
            >
              <Sliders size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#140A05', fontWeight: 800 }}>
                "What-If" Sensitivity Simulator
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#78533E', fontWeight: 600 }}>
                Test Headcount & Budget Variances in Real-Time
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem', color: '#78533E' }}>
            <X size={18} />
          </button>
        </div>

        {/* Live Comparison Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            gap: '1rem',
            alignItems: 'center',
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1.5px solid rgba(234, 88, 12, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Baseline */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase' }}>
              Current Plan Baseline
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#140A05' }}>
              {formatCurrency(budget.totalBudget, budget.currency)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#573523' }}>
              {basics.guestCount} guests • {formatCurrency(basePerGuest, budget.currency)}/guest
            </div>
          </div>

          <ArrowRight size={22} color="#C2410C" />

          {/* Simulated */}
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase' }}>
              Simulated Scenario
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#C2410C' }}>
              {formatCurrency(simulatedBudget, budget.currency)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#573523' }}>
              {simulatedGuests} guests ({guestDeltaPercent > 0 ? `+${guestDeltaPercent}%` : `${guestDeltaPercent}%`}) •{' '}
              <strong>{formatCurrency(simulatedPerGuest, budget.currency)}/guest</strong>
            </div>
          </div>
        </div>

        {/* Interactive Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* 1. Guest Count Shift Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#140A05' }}>Guest Headcount Shift</span>
              <strong style={{ color: '#C2410C', fontFamily: 'var(--font-mono)' }}>
                {guestDeltaPercent > 0 ? `+${guestDeltaPercent}%` : `${guestDeltaPercent}%`} ({simulatedGuests} Attendees)
              </strong>
            </div>
            <input
              type="range"
              min="-40"
              max="60"
              step="5"
              value={guestDeltaPercent}
              onChange={(e) => setGuestDeltaPercent(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#78533E', marginTop: '0.2rem' }}>
              <span>-40% (Smaller intimate group)</span>
              <span>0% (No change)</span>
              <span>+60% (Large RSVP surge)</span>
            </div>
          </div>

          {/* 2. Budget Variance Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
              <span style={{ fontWeight: 700, color: '#140A05' }}>Budget Variance</span>
              <strong style={{ color: '#C2410C', fontFamily: 'var(--font-mono)' }}>
                {budgetDeltaAmount > 0 ? `+${formatCurrency(budgetDeltaAmount, budget.currency)}` : formatCurrency(budgetDeltaAmount, budget.currency)}
              </strong>
            </div>
            <input
              type="range"
              min={-Math.min(5000, Math.round(budget.totalBudget * 0.4))}
              max={Math.max(5000, Math.round(budget.totalBudget * 0.5))}
              step="250"
              value={budgetDeltaAmount}
              onChange={(e) => setBudgetDeltaAmount(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#78533E', marginTop: '0.2rem' }}>
              <span>Tighter budget limit</span>
              <span>Unchanged</span>
              <span>Expanded investment</span>
            </div>
          </div>

          {/* 3. Venue Free Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: '#FFFFFF',
              border: '1px solid rgba(234, 88, 12, 0.25)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#140A05', fontSize: '0.875rem' }}>
                Test Free / Donated Venue Scenario
              </div>
              <div style={{ fontSize: '0.75rem', color: '#78533E' }}>
                Simulate hosting in a public park, family backyard, or donated community hall (reallocates 70% venue fees to food & entertainment)
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isVenueFree}
                onChange={(e) => setIsVenueFree(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#C2410C' }}
              />
              <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#140A05' }}>
                {isVenueFree ? 'Active' : 'Off'}
              </span>
            </label>
          </div>
        </div>

        {/* Feasibility Assessment of Scenario */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1.5rem',
            background: simFeasibility.status === 'tight' ? 'rgba(254, 242, 242, 0.9)' : 'rgba(240, 253, 244, 0.9)',
            border: simFeasibility.status === 'tight' ? '1px solid #ef4444' : '1px solid #16a34a',
            fontSize: '0.825rem',
          }}
        >
          <div style={{ fontWeight: 700, color: simFeasibility.status === 'tight' ? '#b91c1c' : '#15803D', marginBottom: '0.25rem' }}>
            {simFeasibility.status === 'tight' ? '⚠️ Scenario Budget Feasibility Warning' : '✓ Feasible & Well-Balanced Scenario'}
          </div>
          <div style={{ color: '#2D180F' }}>{simFeasibility.message}</div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={handleReset} className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
            <RefreshCw size={14} />
            <span>Reset Sliders</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleApply} className="btn-primary" style={{ padding: '0.45rem 1.25rem', fontSize: '0.85rem' }}>
              <Check size={16} />
              <span>Apply Scenario to Plan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
