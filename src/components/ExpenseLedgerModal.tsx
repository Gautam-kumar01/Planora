import React, { useState } from 'react';
import {
  X,
  Receipt,
  DollarSign,
  Plus,
  Trash2,
  Calendar,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { EventPlan, ExpenseRecord, PaymentMethod, PaymentStatus } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

interface ExpenseLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onUpdateExpenses: (expenses: ExpenseRecord[]) => void;
}

export const ExpenseLedgerModal: React.FC<ExpenseLedgerModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdateExpenses,
}) => {
  const { budget, basics } = plan;
  const currency = budget.currency || basics.currency || 'USD';

  // Seed sample expenses if none exist
  const getInitialExpenses = (): ExpenseRecord[] => {
    if (plan.expenses && plan.expenses.length > 0) return plan.expenses;
    // Default demonstration records derived from budget items
    const sampleItems: ExpenseRecord[] = [];
    budget.items.forEach((item, idx) => {
      if (item.spentAmount > 0) {
        sampleItems.push({
          id: `exp-init-${idx + 1}`,
          budgetItemId: item.id,
          vendorName: `${item.category} Partner / Supplier`,
          category: item.category,
          amount: item.spentAmount,
          paymentDate: new Date(Date.now() - (idx + 1) * 7 * 86400000).toISOString().split('T')[0],
          paymentMethod: idx % 2 === 0 ? 'credit_card' : 'wire_transfer',
          status: 'paid',
          receiptNumber: `REC-${1000 + idx * 47}`,
          notes: `Initial booking deposit for ${item.category.toLowerCase()}`,
        });
      }
    });
    return sampleItems;
  };

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(getInitialExpenses());
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [copied, setCopied] = useState(false);

  // New Expense Form State
  const [vendorName, setVendorName] = useState('');
  const [category, setCategory] = useState(budget.items[0]?.category || 'General');
  const [amount, setAmount] = useState<number | ''>('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paid');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  // Financial Computations
  const totalAllocated = budget.totalBudget;
  const totalPaid = expenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPending = expenses
    .filter((e) => e.status !== 'paid')
    .reduce((sum, e) => sum + e.amount, 0);
  const remainingCash = totalAllocated - totalPaid;
  const percentSpent = totalAllocated > 0 ? Math.min(100, Math.round((totalPaid / totalAllocated) * 100)) : 0;

  // Category Spends
  const categorySpends = budget.items.map((bItem) => {
    const spent = expenses
      .filter((e) => e.category.toLowerCase() === bItem.category.toLowerCase() && e.status === 'paid')
      .reduce((sum, e) => sum + e.amount, 0);
    const variance = bItem.allocatedAmount - spent;
    return {
      category: bItem.category,
      allocated: bItem.allocatedAmount,
      spent,
      variance,
      isOver: spent > bItem.allocatedAmount,
    };
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || amount === '' || Number(amount) <= 0) return;

    const matchedBudgetItem = budget.items.find(
      (b) => b.category.toLowerCase() === category.toLowerCase()
    );

    const newRecord: ExpenseRecord = {
      id: `exp-${Date.now()}`,
      budgetItemId: matchedBudgetItem?.id,
      vendorName: vendorName.trim(),
      category,
      amount: Number(amount),
      paymentDate,
      paymentMethod,
      status: paymentStatus,
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    const updated = [newRecord, ...expenses];
    setExpenses(updated);
    onUpdateExpenses(updated);

    // Reset Form
    setVendorName('');
    setAmount('');
    setReceiptNumber('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    onUpdateExpenses(updated);
  };

  const handleToggleStatus = (id: string) => {
    const updated = expenses.map((e) => {
      if (e.id === id) {
        return {
          ...e,
          status: (e.status === 'paid' ? 'pending' : 'paid') as PaymentStatus,
        };
      }
      return e;
    });
    setExpenses(updated);
    onUpdateExpenses(updated);
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.receiptNumber && e.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCopySummary = () => {
    const lines = [
      `PLANORA EXPENSE & RECEIPT LEDGER: ${basics.title}`,
      `Total Budget: ${formatCurrency(totalAllocated, currency)}`,
      `Total Paid: ${formatCurrency(totalPaid, currency)} (${percentSpent}%)`,
      `Pending Commitments: ${formatCurrency(totalPending, currency)}`,
      `Remaining Cash Buffer: ${formatCurrency(remainingCash, currency)}`,
      '',
      'TRANSACTION LOG:',
      ...expenses.map(
        (e) =>
          `• [${e.paymentDate}] ${e.vendorName} (${e.category}): ${formatCurrency(e.amount, currency)} [${e.status.toUpperCase()}] - ${e.paymentMethod.replace('_', ' ')} ${e.receiptNumber ? `(Receipt #${e.receiptNumber})` : ''}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard size={13} color="#C2410C" />;
      case 'cash':
        return <DollarSign size={13} color="#15803D" />;
      default:
        return <Receipt size={13} color="#D97706" />;
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1150 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          padding: '2rem',
          maxWidth: '920px',
          width: '95%',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.98)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.25rem',
            paddingBottom: '1rem',
            borderBottom: '1.5px solid rgba(234, 88, 12, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              }}
            >
              <Receipt size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800, margin: 0 }}>
                  Event Expense & Receipt Ledger
                </h3>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(234, 88, 12, 0.12)',
                    border: '1px solid rgba(234, 88, 12, 0.3)',
                    color: '#9A3412',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}
                >
                  Live Ledger
                </span>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#573523', margin: '0.15rem 0 0 0', fontWeight: 500 }}>
                Log vendor deposits, payment receipts, and balance dues with real-time budget variance tracking
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Financial KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Card 1: Total Allocated */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.22)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              boxShadow: '0 2px 6px rgba(45, 24, 15, 0.04)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase' }}>
              Allocated Budget
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#140A05', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalAllocated, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#78533E', marginTop: '0.2rem' }}>
              {budget.items.length} budgeted categories
            </div>
          </div>

          {/* Card 2: Actual Spent */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(22, 163, 74, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              boxShadow: '0 2px 6px rgba(45, 24, 15, 0.04)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
              Total Paid Out
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#15803D', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalPaid, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.2rem', fontWeight: 600 }}>
              {percentSpent}% of total budget executed
            </div>
          </div>

          {/* Card 3: Pending Commitments */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(217, 119, 6, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              boxShadow: '0 2px 6px rgba(45, 24, 15, 0.04)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#B45309', textTransform: 'uppercase' }}>
              Pending Balances
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#B45309', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
              {formatCurrency(totalPending, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#78350F', marginTop: '0.2rem' }}>
              Due prior to event dates
            </div>
          </div>

          {/* Card 4: Remaining Cash Buffer */}
          <div
            style={{
              background: remainingCash >= 0 ? '#FFFFFF' : 'rgba(254, 242, 242, 0.9)',
              border: remainingCash >= 0 ? '1.5px solid rgba(234, 88, 12, 0.22)' : '1.5px solid #ef4444',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              boxShadow: '0 2px 6px rgba(45, 24, 15, 0.04)',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: remainingCash >= 0 ? '#78533E' : '#B91C1C', textTransform: 'uppercase' }}>
              Remaining Cash
            </div>
            <div
              style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: remainingCash >= 0 ? '#140A05' : '#B91C1C',
                marginTop: '0.2rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {formatCurrency(remainingCash, currency)}
            </div>
            <div style={{ fontSize: '0.75rem', color: remainingCash >= 0 ? '#15803D' : '#B91C1C', marginTop: '0.2rem', fontWeight: 600 }}>
              {remainingCash >= 0 ? '✓ Within overall allocation' : '⚠ Over total budget!'}
            </div>
          </div>
        </div>

        {/* Category Variance Quick Chips */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.5rem' }}>
            Category Real-Time Spend vs Allocated:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categorySpends.map((cs) => (
              <div
                key={cs.category}
                style={{
                  background: cs.isOver ? 'rgba(254, 242, 242, 0.95)' : 'rgba(234, 88, 12, 0.07)',
                  border: cs.isOver ? '1px solid #ef4444' : '1px solid rgba(234, 88, 12, 0.22)',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.775rem',
                  color: cs.isOver ? '#b91c1c' : '#140A05',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span>{cs.category}:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                  {formatCurrency(cs.spent, currency)} / {formatCurrency(cs.allocated, currency)}
                </span>
                {cs.isOver ? (
                  <span style={{ color: '#ef4444', fontWeight: 800 }}>⚠ (+{formatCurrency(Math.abs(cs.variance), currency)})</span>
                ) : (
                  <span style={{ color: '#16a34a', fontSize: '0.7rem' }}>({formatCurrency(cs.variance, currency)} left)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls: Log Expense Toggle & Export */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary"
            style={{ padding: '0.5rem 1.15rem', fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>{showAddForm ? 'Close Entry Form' : '+ Record New Payment / Receipt'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="btn-secondary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.825rem' }}
            title="Copy full expense ledger to clipboard"
          >
            {copied ? <Check size={15} color="#15803D" /> : <Copy size={15} color="#C2410C" />}
            <span>{copied ? 'Ledger Copied!' : 'Copy Ledger Summary'}</span>
          </button>
        </div>

        {/* Add Expense Form Accordion */}
        {showAddForm && (
          <form
            onSubmit={handleAddExpense}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              boxShadow: '0 4px 14px rgba(45, 24, 15, 0.06)',
            }}
          >
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 800, color: '#140A05' }}>
              Record Payment Receipt
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                  Vendor / Payee Name *
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Glasshouse Pavilion, DJ Dave"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                  Budget Category *
                </label>
                <select
                  className="glass-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ background: '#FFFFFF' }}
                >
                  {budget.items.map((item) => (
                    <option key={item.id} value={item.category}>
                      {item.category} (Allocated: {formatCurrency(item.allocatedAmount, currency)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                  Amount ({currency}) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="glass-input"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                  Payment Date
                </label>
                <input
                  type="date"
                  className="glass-input"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                  Payment Method
                </label>
                <select
                  className="glass-input"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  style={{ background: '#FFFFFF' }}
                >
                  <option value="credit_card">Credit / Debit Card</option>
                  <option value="wire_transfer">Wire / Bank Transfer</option>
                  <option value="venmo_zelle">Venmo / Zelle</option>
                  <option value="cash">Cash</option>
                  <option value="check">Paper Check</option>
                  <option value="other">Other Method</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                  Payment Status
                </label>
                <select
                  className="glass-input"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                  style={{ background: '#FFFFFF' }}
                >
                  <option value="paid">✓ Paid & Cleared</option>
                  <option value="pending">⏱ Pending / Scheduled</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                  Receipt / Invoice # (Optional)
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. INV-9041"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#140A05', marginBottom: '0.3rem' }}>
                Payment Notes / Description
              </label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g. 50% deposit required upon contract signature"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Payment Record
              </button>
            </div>
          </form>
        )}

        {/* Filter and Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 240px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                color="#78533E"
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="glass-input"
                placeholder="Search vendor, receipt #, or note..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.1rem', fontSize: '0.825rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              className="glass-input"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.825rem', background: '#FFFFFF' }}
            >
              <option value="all">All Categories</option>
              {budget.items.map((b) => (
                <option key={b.id} value={b.category}>
                  {b.category}
                </option>
              ))}
            </select>

            <select
              className="glass-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.825rem', background: '#FFFFFF' }}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1.5px solid rgba(234, 88, 12, 0.22)',
            borderRadius: 'var(--radius-md)',
            overflowX: 'auto',
            boxShadow: '0 2px 8px rgba(45, 24, 15, 0.04)',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: 'rgba(234, 88, 12, 0.06)', borderBottom: '1.5px solid rgba(234, 88, 12, 0.2)' }}>
                <th style={{ padding: '0.65rem 0.85rem', color: '#140A05', fontWeight: 800 }}>Date</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#140A05', fontWeight: 800 }}>Vendor / Payee</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#140A05', fontWeight: 800 }}>Category</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#140A05', fontWeight: 800 }}>Method</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#140A05', fontWeight: 800 }}>Status</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#140A05', fontWeight: 800, textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '0.65rem 0.85rem', color: '#140A05', fontWeight: 800, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#78533E', fontWeight: 500 }}>
                    No payments found matching the current search criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid rgba(234, 88, 12, 0.12)' }}>
                    <td style={{ padding: '0.65rem 0.85rem', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#573523' }}>
                      {e.paymentDate}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <div style={{ fontWeight: 700, color: '#140A05' }}>{e.vendorName}</div>
                      {e.receiptNumber && (
                        <div style={{ fontSize: '0.725rem', color: '#78533E', fontFamily: 'var(--font-mono)' }}>
                          Receipt #{e.receiptNumber}
                        </div>
                      )}
                      {e.notes && <div style={{ fontSize: '0.725rem', color: '#78533E' }}>{e.notes}</div>}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <span
                        style={{
                          background: 'rgba(234, 88, 12, 0.08)',
                          border: '1px solid rgba(234, 88, 12, 0.2)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          color: '#9A3412',
                        }}
                      >
                        {e.category}
                      </span>
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', textTransform: 'capitalize' }}>
                        {renderPaymentMethodIcon(e.paymentMethod)}
                        <span>{e.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(e.id)}
                        style={{
                          background: e.status === 'paid' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(217, 119, 6, 0.12)',
                          border: e.status === 'paid' ? '1px solid #16a34a' : '1px solid #d97706',
                          color: e.status === 'paid' ? '#15803D' : '#B45309',
                          borderRadius: 'var(--radius-full)',
                          padding: '0.2rem 0.6rem',
                          fontSize: '0.725rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}
                        title="Click to toggle status"
                      >
                        {e.status === 'paid' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        <span>{e.status === 'paid' ? 'Paid' : 'Pending'}</span>
                      </button>
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#140A05' }}>
                      {formatCurrency(e.amount, currency)}
                    </td>

                    <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(e.id)}
                        className="btn-ghost"
                        style={{ padding: '0.3rem', color: '#dc2626' }}
                        title="Delete record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
