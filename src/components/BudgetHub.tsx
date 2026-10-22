import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Receipt,
} from 'lucide-react';
import { BudgetItem, EventPlan } from '../types';
import {
  formatCurrency,
  calculatePerGuest,
  generateDeterministicBudget,
  assessBudgetFeasibility,
} from '../utils/deterministicMath';

interface BudgetHubProps {
  plan: EventPlan;
  onUpdateBudget: (updatedItems: BudgetItem[], totalBudget?: number) => void;
  onOpenWhatIfSimulator?: () => void;
  onOpenExpenseLedger?: () => void;
}

export const BudgetHub: React.FC<BudgetHubProps> = ({ plan, onUpdateBudget, onOpenWhatIfSimulator, onOpenExpenseLedger }) => {
  const { budget, basics } = plan;
  const [editingTotal, setEditingTotal] = useState(false);
  const [newTotalValue, setNewTotalValue] = useState(budget.totalBudget);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState(500);
  const [showAddModal, setShowAddModal] = useState(false);

  // Arithmetic reconciliation
  const totalAllocated = budget.items.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const totalSpent = budget.items.reduce((sum, item) => sum + item.spentAmount, 0);
  const ledgerPaidTotal = plan.expenses
    ? plan.expenses.filter((e) => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
    : 0;
  const effectiveTotalSpent = ledgerPaidTotal > 0 ? ledgerPaidTotal : totalSpent;

  const getCategoryActualSpent = (categoryName: string, defaultSpent: number) => {
    if (!plan.expenses || plan.expenses.length === 0) return defaultSpent;
    const matching = plan.expenses.filter(
      (e) => e.category.toLowerCase() === categoryName.toLowerCase() && e.status === 'paid'
    );
    if (matching.length === 0) return defaultSpent;
    return matching.reduce((sum, e) => sum + e.amount, 0);
  };

  const unallocated = budget.totalBudget - totalAllocated;
  const isOverBudget = totalAllocated > budget.totalBudget;
  const perGuest = calculatePerGuest(budget.totalBudget, basics.guestCount);
  const feasibility = assessBudgetFeasibility(basics.eventType, budget.totalBudget, basics.guestCount, budget.currency);

  // Category allocation slider change
  const handleSliderChange = (id: string, newAmount: number) => {
    const updated = budget.items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          allocatedAmount: newAmount,
          percentage: budget.totalBudget > 0 ? Math.round((newAmount / budget.totalBudget) * 100) : 0,
        };
      }
      return item;
    });
    onUpdateBudget(updated);
  };

  // Spent amount change
  const handleSpentChange = (id: string, newSpent: number) => {
    const updated = budget.items.map((item) => {
      if (item.id === id) {
        return { ...item, spentAmount: Math.max(0, newSpent) };
      }
      return item;
    });
    onUpdateBudget(updated);
  };

  // Auto-balance remaining difference into Contingency
  const handleReconcileBalance = () => {
    if (unallocated === 0) return;
    const contingencyItem =
      budget.items.find((i) => i.isContingency) || budget.items[budget.items.length - 1];

    if (!contingencyItem) return;

    const updated = budget.items.map((item) => {
      if (item.id === contingencyItem.id) {
        const newAllocated = Math.max(0, item.allocatedAmount + unallocated);
        return {
          ...item,
          allocatedAmount: newAllocated,
          percentage: budget.totalBudget > 0 ? Math.round((newAllocated / budget.totalBudget) * 100) : 0,
        };
      }
      return item;
    });

    onUpdateBudget(updated);
  };

  // Reset to default deterministic split
  const handleResetToStandard = () => {
    const newItems = generateDeterministicBudget(basics.eventType, budget.totalBudget);
    onUpdateBudget(newItems);
  };

  // Add custom category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newItem: BudgetItem = {
      id: `custom-cat-${Date.now()}`,
      category: newCategoryName.trim(),
      allocatedAmount: Number(newCategoryAmount) || 0,
      spentAmount: 0,
      percentage: budget.totalBudget > 0 ? Math.round((newCategoryAmount / budget.totalBudget) * 100) : 0,
      notes: 'Custom user-defined allocation',
    };

    onUpdateBudget([...budget.items, newItem]);
    setNewCategoryName('');
    setShowAddModal(false);
  };

  // Delete category
  const handleDeleteCategory = (id: string) => {
    const updated = budget.items.filter((item) => item.id !== id);
    onUpdateBudget(updated);
  };

  // Save new total budget
  const handleSaveTotalBudget = () => {
    const parsed = Math.max(100, Number(newTotalValue));
    onUpdateBudget(budget.items, parsed);
    setEditingTotal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Card 1: Total Budget */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Master Event Budget
            </span>
            <button
              onClick={() => {
                setNewTotalValue(budget.totalBudget);
                setEditingTotal(!editingTotal);
              }}
              className="btn-ghost"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              {editingTotal ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editingTotal ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              <input
                type="number"
                className="glass-input"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', padding: '0.35rem 0.75rem' }}
                value={newTotalValue}
                onChange={(e) => setNewTotalValue(Number(e.target.value))}
              />
              <button onClick={handleSaveTotalBudget} className="btn-primary" style={{ padding: '0.35rem 0.85rem' }}>
                Save
              </button>
            </div>
          ) : (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#140A05' }}>
              {formatCurrency(budget.totalBudget, budget.currency)}
            </div>
          )}

          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.35rem', fontWeight: 500 }}>
            Allocated: <strong style={{ color: '#9A3412', fontWeight: 700 }}>{formatCurrency(totalAllocated, budget.currency)}</strong>
          </div>
        </div>

        {/* Card 2: Spent Tracker */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#78533E', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Actual Spent So Far
            </span>
            {onOpenExpenseLedger && (
              <button
                type="button"
                onClick={onOpenExpenseLedger}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#15803D',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                View Ledger →
              </button>
            )}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#9A3412', margin: '0.35rem 0' }}>
            {formatCurrency(effectiveTotalSpent, budget.currency)}
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Remaining liquid balance:{' '}
            <strong style={{ color: '#15803D', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              {formatCurrency(Math.max(0, budget.totalBudget - effectiveTotalSpent), budget.currency)}
            </strong>
          </div>
        </div>

        {/* Card 3: Per Guest Arithmetic */}
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: '#78533E', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
            Deterministic Headcount Math
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#140A05', margin: '0.35rem 0' }}>
            {formatCurrency(perGuest, budget.currency)}
            <span style={{ fontSize: '0.85rem', color: '#78533E', fontWeight: 500 }}> / guest</span>
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Based on {basics.guestCount} confirmed attendees
          </div>
        </div>

        {/* Card 4: Reconciliation Status */}
        <div
          className="glass-panel"
          style={{
            padding: '1.25rem 1.5rem',
            borderColor: isOverBudget
              ? 'rgba(239, 68, 68, 0.45)'
              : unallocated > 0
              ? 'rgba(245, 158, 11, 0.45)'
              : 'rgba(34, 197, 94, 0.35)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
            {isOverBudget ? (
              <AlertTriangle size={18} color="#dc2626" />
            ) : unallocated > 0 ? (
              <TrendingUp size={18} color="#d97706" />
            ) : (
              <CheckCircle size={18} color="#15803D" />
            )}
            <span
              style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: isOverBudget ? '#B91C1C' : unallocated > 0 ? '#B45309' : '#15803D',
              }}
            >
              {isOverBudget
                ? 'Over Budget Warning'
                : unallocated > 0
                ? 'Unallocated Funds Available'
                : '100% Balanced to the Dollar'}
            </span>
          </div>

          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 800, color: '#140A05', margin: '0.2rem 0' }}>
            {unallocated !== 0 ? formatCurrency(Math.abs(unallocated), budget.currency) : 'Zero Variance'}
          </div>

          {unallocated !== 0 && (
            <button
              onClick={handleReconcileBalance}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', marginTop: '0.35rem', borderColor: 'var(--color-orange-400)' }}
            >
              <Sparkles size={12} />
              <span>Balance into Contingency</span>
            </button>
          )}
        </div>
      </div>

      {/* Priority 3.4: Estimate vs. Actual Summary */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1.5px solid rgba(234, 88, 12, 0.22)',
          boxShadow: '0 4px 15px rgba(45, 24, 15, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Receipt size={18} color="#C2410C" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#140A05', fontWeight: 800 }}>
              Estimate vs. Actual Spending Summary
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#78533E', fontWeight: 600 }}>
            Budget totals are calculated by the app; prices and vendor ranges are estimates.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ background: '#FAF6EF', padding: '0.85rem 1rem', borderRadius: '0.65rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#78533E', textTransform: 'uppercase', fontWeight: 700 }}>
              Estimated Planned Budget
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#140A05' }}>
              {formatCurrency(budget.totalBudget, budget.currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#78533E' }}>
              Allocated across {budget.items.length} categories
            </div>
          </div>

          <div style={{ background: '#FAF6EF', padding: '0.85rem 1rem', borderRadius: '0.65rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#78533E', textTransform: 'uppercase', fontWeight: 700 }}>
              Actual Recorded Expenses
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#C2410C' }}>
              {formatCurrency(effectiveTotalSpent, budget.currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#78533E' }}>
              {Math.round((effectiveTotalSpent / (budget.totalBudget || 1)) * 100)}% of planned budget used
            </div>
          </div>

          <div style={{ background: '#FAF6EF', padding: '0.85rem 1rem', borderRadius: '0.65rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#78533E', textTransform: 'uppercase', fontWeight: 700 }}>
              Remaining Amount
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: budget.totalBudget - effectiveTotalSpent < 0 ? '#DC2626' : '#15803D',
              }}
            >
              {formatCurrency(budget.totalBudget - effectiveTotalSpent, budget.currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: budget.totalBudget - effectiveTotalSpent < 0 ? '#DC2626' : '#15803D', fontWeight: 600 }}>
              {budget.totalBudget - effectiveTotalSpent < 0 ? '⚠️ Exceeding planned target' : '✓ Available for upcoming expenses'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#78533E', fontWeight: 600, marginBottom: '0.35rem' }}>
            <span>Spending Progress</span>
            <span>{Math.round((effectiveTotalSpent / (budget.totalBudget || 1)) * 100)}% spent</span>
          </div>
          <div style={{ height: '8px', background: '#E5DCCE', borderRadius: '99px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(100, Math.round((effectiveTotalSpent / (budget.totalBudget || 1)) * 100))}%`,
                background: effectiveTotalSpent > budget.totalBudget ? '#DC2626' : 'linear-gradient(90deg, #F97316, #D97706)',
                borderRadius: '99px',
              }}
            />
          </div>
        </div>
      </div>

      {/* FR-13: Budget Feasibility & Respectful Constraint Advisor */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderLeft: `5px solid ${
            feasibility.status === 'tight' ? '#EA580C' : feasibility.status === 'generous' ? '#7C3AED' : '#15803D'
          }`,
          background:
            feasibility.status === 'tight'
              ? 'rgba(254, 242, 242, 0.85)'
              : feasibility.status === 'generous'
              ? 'rgba(245, 243, 255, 0.85)'
              : 'rgba(240, 253, 244, 0.85)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              {feasibility.status === 'tight' ? (
                <ShieldAlert size={18} color="#C2410C" />
              ) : (
                <CheckCircle2 size={18} color="#15803D" />
              )}
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: feasibility.status === 'tight' ? '#9A3412' : '#14532D',
                }}
              >
                Budget Feasibility Advisor (FR-13) • {feasibility.status === 'tight' ? 'Budget Constraint Notice' : 'Healthy Allocation'}
              </span>
            </div>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#2D180F', fontWeight: 600 }}>
              {feasibility.message}
            </p>
          </div>

          <span
            className="badge"
            style={{
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(234, 88, 12, 0.25)',
              color: '#9A3412',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            {formatCurrency(perGuest, budget.currency)} / guest
          </span>
        </div>

        {feasibility.recommendations && feasibility.recommendations.length > 0 && (
          <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#573523', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Practical Adaptation Strategies:
            </span>
            <ul style={{ margin: '0.35rem 0 0', paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#372013', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {feasibility.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Trade-off Assistant Notice */}
      <div
        className="glass-panel-subtle"
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          background: 'rgba(234, 88, 12, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sparkles size={20} color="#D97706" />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#9A3412' }}>
              Planora Trade-off Assistant: Deterministic Budget Arithmetic
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Adjust category sliders below. Changing one category updates allocations. Budget totals are calculated by the app; prices and vendor ranges are estimates.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onOpenExpenseLedger && (
            <button
              id="btn-open-expense-ledger"
              onClick={onOpenExpenseLedger}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderColor: '#16a34a',
                color: '#15803D',
                fontWeight: 700,
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
              title="Open real-time expense and receipt ledger"
            >
              <Receipt size={13} color="#15803D" />
              <span>Expense & Receipt Ledger</span>
            </button>
          )}
          {onOpenWhatIfSimulator && (
            <button
              id="btn-whatif-simulator"
              onClick={onOpenWhatIfSimulator}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderColor: '#ea580c',
                color: '#9a3412',
                fontWeight: 700,
              }}
            >
              <Sliders size={13} color="#ea580c" />
              <span>"What-If" Sensitivity Simulator</span>
            </button>
          )}
          <button onClick={handleResetToStandard} className="btn-secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
            <RefreshCw size={13} />
            <span>Reset to Standard Splits</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}>
            <Plus size={14} />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Categories Breakdown Table / Cards */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#140A05' }}>Budget Category Allocations</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {budget.items.map((item) => {
            const isContingency = item.isContingency || item.category.toLowerCase().includes('contingency');
            const percentOfBudget = budget.totalBudget > 0 ? ((item.allocatedAmount / budget.totalBudget) * 100).toFixed(1) : '0';
            const actualCategorySpent = getCategoryActualSpent(item.category, item.spentAmount);
            const isCategoryOverBudget = actualCategorySpent > item.allocatedAmount;
            const spentPercent = item.allocatedAmount > 0 ? Math.min(100, Math.round((actualCategorySpent / item.allocatedAmount) * 100)) : 0;

            return (
              <div
                key={item.id}
                style={{
                  background: isContingency ? 'rgba(254, 243, 199, 0.55)' : 'rgba(255, 255, 255, 0.98)',
                  border: isCategoryOverBudget
                    ? '1.5px solid #ef4444'
                    : isContingency
                    ? '1.5px dashed rgba(217, 119, 6, 0.4)'
                    : '1px solid rgba(234, 88, 12, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.4rem',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(45, 24, 15, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#140A05' }}>
                        {item.category}
                      </span>
                      {isContingency && (
                        <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                          Safety Reserve
                        </span>
                      )}
                      <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                        {percentOfBudget}% of budget
                      </span>
                      {isCategoryOverBudget && (
                        <span className="badge" style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#b91c1c', border: '1px solid #ef4444', fontWeight: 700 }}>
                          ⚠ Over Budget by {formatCurrency(actualCategorySpent - item.allocatedAmount, budget.currency)}
                        </span>
                      )}
                      <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(234, 88, 12, 0.08)', color: '#78533E', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
                        Estimate (FR-11)
                      </span>
                    </div>
                    {item.notes && (
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                        {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Amounts & Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    {/* Allocated Input */}
                    <div>
                      <div style={{ fontSize: '0.725rem', color: '#78533E', textTransform: 'uppercase', fontWeight: 700 }}>
                        Allocated
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#C2410C', fontWeight: 700 }}>
                          {budget.currency}
                        </span>
                        <input
                          type="number"
                          className="glass-input"
                          style={{
                            width: '120px',
                            padding: '0.25rem 0.5rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '1rem',
                            fontWeight: 700,
                          }}
                          value={item.allocatedAmount}
                          onChange={(e) => handleSliderChange(item.id, Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                    </div>

                    {/* Spent Input */}
                    <div>
                      <div style={{ fontSize: '0.725rem', color: '#78533E', textTransform: 'uppercase', fontWeight: 700 }}>
                        Spent
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: '#C2410C', fontWeight: 700 }}>
                          {budget.currency}
                        </span>
                        <input
                          type="number"
                          className="glass-input"
                          style={{
                            width: '110px',
                            padding: '0.25rem 0.5rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                          }}
                          value={item.spentAmount}
                          onChange={(e) => handleSpentChange(item.id, Math.max(0, Number(e.target.value)))}
                        />
                      </div>
                    </div>

                    {!isContingency && (
                      <button
                        onClick={() => handleDeleteCategory(item.id)}
                        className="btn-ghost"
                        style={{ color: '#ef4444', padding: '0.4rem' }}
                        title="Delete Category"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Range Slider for Interactive Allocation */}
                <div style={{ marginTop: '0.5rem' }}>
                  <input
                    type="range"
                    min="0"
                    max={budget.totalBudget}
                    step="50"
                    value={item.allocatedAmount}
                    onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                  />
                </div>

                {/* Spent Progress Bar */}
                {item.spentAmount > 0 && (
                  <div style={{ marginTop: '0.65rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#573523', fontWeight: 600, marginBottom: '0.2rem' }}>
                      <span>Spent: {spentPercent}% of category</span>
                      <span>
                        Remaining in category: {formatCurrency(Math.max(0, item.allocatedAmount - item.spentAmount), budget.currency)}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(234, 88, 12, 0.15)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${spentPercent}%`,
                          background: spentPercent > 90 ? '#ef4444' : 'linear-gradient(90deg, #F59E0B, #EA580C)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#140A05', fontWeight: 800 }}>
              Add Custom Budget Category
            </h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Category Name
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Vintage Photobooth or Midnight Snack Truck"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Allocated Amount ({budget.currency})
                </label>
                <input
                  type="number"
                  className="glass-input"
                  value={newCategoryAmount}
                  onChange={(e) => setNewCategoryAmount(Math.max(0, Number(e.target.value)))}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

