import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  DollarSign,
  Users,
  PlusCircle,
  FileText,
  Share2,
  Sliders,
  Bot,
  LogOut,
  Layers,
  ArrowRight,
  Printer,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Compass,
  FileCheck,
  Search,
  ChevronRight,
  ShieldCheck,
  Send,
  HelpCircle,
} from 'lucide-react';
import { EventPlan, UserProfile } from '../types';
import { formatCurrency, calculateDaysRemaining } from '../utils/deterministicMath';

interface UserDashboardProps {
  currentUser: UserProfile;
  plans: EventPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onOpenWizard: () => void;
  onOpenExpenseLedger: () => void;
  onOpenAiDocumentStudio: () => void;
  onOpenWhatIfSimulator: () => void;
  onToggleCopilot: () => void;
  onPrintPlan: (plan: EventPlan) => void;
  onSharePlan: (plan: EventPlan) => void;
  onRenamePlan: (id: string, newTitle: string) => void;
  onDuplicatePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onSignOut: () => void;
  onNavigateHome: () => void;
  onGoToEventWorkspace: (planId?: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  plans,
  activePlanId,
  onSelectPlan,
  onOpenWizard,
  onOpenExpenseLedger,
  onOpenAiDocumentStudio,
  onOpenWhatIfSimulator,
  onToggleCopilot,
  onPrintPlan,
  onSharePlan,
  onRenamePlan,
  onDuplicatePlan,
  onDeletePlan,
  onSignOut,
  onNavigateHome,
  onGoToEventWorkspace,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [showVendorExplainer, setShowVendorExplainer] = useState(true);

  // Aggregated Portfolio Metrics across all user plans
  const currency = plans[0]?.budget?.currency || 'INR';
  const totalBudgetManaged = plans.reduce((acc, p) => acc + (p.budget?.totalBudget || 0), 0);
  const totalActualSpent = plans.reduce(
    (acc, p) => acc + (p.budget?.items?.reduce((s, it) => s + (it.spentAmount || 0), 0) || 0),
    0
  );
  const totalGuests = plans.reduce((acc, p) => acc + (p.basics?.guestCount || 0), 0);
  const totalVendors = plans.reduce((acc, p) => acc + (p.vendors?.length || 0), 0);

  // Filter plans
  const filteredPlans = plans.filter((p) => {
    const matchesSearch =
      p.basics.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.basics.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.basics.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || p.basics.eventType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleOpenPlan = (id: string) => {
    onSelectPlan(id);
    onGoToEventWorkspace(id);
  };

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '85vh' }}>
      {/* 1. User Header & Profile Overview Banner */}
      <div
        className="glass-card"
        style={{
          background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
          borderRadius: '1.25rem',
          border: '1.5px solid rgba(234, 88, 12, 0.22)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 30px rgba(45, 24, 15, 0.05)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          {/* User Identity Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F97316 0%, #C2410C 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)',
                border: '2px solid #FFFFFF',
              }}
            >
              {getInitials(currentUser.fullName)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.85rem', color: '#140A05', fontWeight: 800, margin: 0 }}>
                  Welcome back, {currentUser.fullName}
                </h1>
                <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={12} color="#15803D" />
                  <span>Cloud Verified Account</span>
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#78533E', margin: '0.35rem 0 0 0', fontWeight: 600 }}>
                {currentUser.email} • Your Private Celebration Portfolio & Event Command Center
              </p>
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              id="btn-user-create-event"
              onClick={onOpenWizard}
              className="btn-primary"
              style={{
                padding: '0.65rem 1.25rem',
                fontSize: '0.9rem',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)',
              }}
            >
              <PlusCircle size={18} />
              <span>Create New Event Plan</span>
            </button>

            <button
              onClick={onSignOut}
              className="btn-secondary"
              style={{ padding: '0.65rem 1.1rem', fontSize: '0.85rem' }}
              title="Sign out of your account and return to guest mode"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* 2. Executive Portfolio KPI Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginTop: '2rem',
            paddingTop: '1.75rem',
            borderTop: '1px solid rgba(234, 88, 12, 0.12)',
          }}
        >
          <div
            style={{
              background: '#FAF6EF',
              border: '1px solid #E4DACB',
              borderRadius: '0.85rem',
              padding: '1.1rem 1.25rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase' }}>
              Active Celebrations
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#140A05', marginTop: '0.3rem' }}>
              {plans.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78533E', fontWeight: 500, marginTop: '0.2rem' }}>
              Weddings, Birthdays & Festivals
            </div>
          </div>

          <div
            style={{
              background: '#FAF6EF',
              border: '1px solid #E4DACB',
              borderRadius: '0.85rem',
              padding: '1.1rem 1.25rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase' }}>
              Total Budget Managed
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#C2410C', marginTop: '0.3rem' }}>
              {formatCurrency(totalBudgetManaged, currency)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78533E', fontWeight: 500, marginTop: '0.2rem' }}>
              Deterministic 100% arithmetic
            </div>
          </div>

          <div
            style={{
              background: '#FAF6EF',
              border: '1px solid #E4DACB',
              borderRadius: '0.85rem',
              padding: '1.1rem 1.25rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase' }}>
              Total Paid Out & Logged
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#15803D', marginTop: '0.3rem' }}>
              {formatCurrency(totalActualSpent, currency)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78533E', fontWeight: 500, marginTop: '0.2rem' }}>
              Verified receipt audit trail
            </div>
          </div>

          <div
            style={{
              background: '#FAF6EF',
              border: '1px solid #E4DACB',
              borderRadius: '0.85rem',
              padding: '1.1rem 1.25rem',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase' }}>
              Total Attendees Expected
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#140A05', marginTop: '0.3rem' }}>
              {totalGuests}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#78533E', fontWeight: 500, marginTop: '0.2rem' }}>
              Across {totalVendors} booked vendor partners
            </div>
          </div>
        </div>
      </div>

      {/* 3. Client & Vendor Relationship Explainer (Answers User's Question Directly in UI) */}
      {showVendorExplainer && (
        <div
          className="glass-card"
          style={{
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)',
            border: '1.5px solid #F59E0B',
            borderRadius: '1rem',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <Compass size={22} color="#D97706" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#92400E', margin: '0 0 0.35rem 0' }}>
                  How Planora Works For You & Your Vendors
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#78350F', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
                  <strong>You are in full control!</strong> As the host or planner, you design your master wedding or event
                  plan here—including your exact budget, run-of-show schedule, dietary manifest, and seating chart. You can
                  share this read-only plan with family, or export the <strong>Master Event Dossier (PDF)</strong> and send the{' '}
                  <strong>AI Vendor Quote Inquiry Brief</strong> directly to caterers, venues, and photographers. The vendors then
                  execute according to your clear instructions, while you track contracts and deposits in your live ledger.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowVendorExplainer(false)}
              className="btn-ghost"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#92400E' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 4. Quick Launch Modules Strip */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#140A05', marginBottom: '1rem' }}>
          Event Studio Quick Launch
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => {
              if (activePlanId) handleOpenPlan(activePlanId);
              onOpenExpenseLedger();
            }}
            className="glass-card clickable"
            style={{
              padding: '1.1rem',
              borderRadius: '0.85rem',
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <DollarSign size={18} color="#EA580C" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#140A05' }}>Expense Ledger</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#78533E', margin: 0, fontWeight: 500 }}>
              Track receipts, payments, and category variances live.
            </p>
          </div>

          <div
            onClick={() => {
              if (activePlanId) handleOpenPlan(activePlanId);
              onOpenAiDocumentStudio();
            }}
            className="glass-card clickable"
            style={{
              padding: '1.1rem',
              borderRadius: '0.85rem',
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <FileText size={18} color="#EA580C" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#140A05' }}>AI Document Studio</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#78533E', margin: 0, fontWeight: 500 }}>
              Draft speeches, toasts, digital invites & vendor letters.
            </p>
          </div>

          <div
            onClick={() => {
              if (activePlanId) handleOpenPlan(activePlanId);
              onOpenWhatIfSimulator();
            }}
            className="glass-card clickable"
            style={{
              padding: '1.1rem',
              borderRadius: '0.85rem',
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <Sliders size={18} color="#EA580C" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#140A05' }}>What-If Simulator</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#78533E', margin: 0, fontWeight: 500 }}>
              Test guest headcount elasticity & budget variances.
            </p>
          </div>

          <div
            onClick={onToggleCopilot}
            className="glass-card clickable"
            style={{
              padding: '1.1rem',
              borderRadius: '0.85rem',
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <Bot size={18} color="#EA580C" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#140A05' }}>AI Planning Concierge</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#78533E', margin: 0, fontWeight: 500 }}>
              Chat with Google Gemini 2.5 Flash on any planning advice.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Master Events & Celebrations Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
              My Celebrations & Events ({filteredPlans.length})
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#78533E', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
              Select any event to open its complete synchronized planning workspace
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} color="#A88B7B" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search your events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glass-input"
                style={{ padding: '0.45rem 0.85rem 0.45rem 2.2rem', fontSize: '0.825rem', width: '200px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['all', 'wedding', 'birthday', 'community'].map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTypeFilter(t)}
                  className="btn-ghost"
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: selectedTypeFilter === t ? 'linear-gradient(135deg, #F97316, #D97706)' : '#FFFFFF',
                    color: selectedTypeFilter === t ? '#FFFFFF' : '#78533E',
                    border: selectedTypeFilter === t ? 'none' : '1px solid #E4DACB',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State if No Events match */}
        {filteredPlans.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '3.5rem 2rem',
              textAlign: 'center',
              background: '#FFFFFF',
              borderRadius: '1.25rem',
              border: '2px dashed #E4DACB',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FFF7ED',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <Calendar size={28} color="#EA580C" />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#140A05', marginBottom: '0.5rem' }}>
              No Event Plans Found
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#78533E', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
              {searchTerm || selectedTypeFilter !== 'all'
                ? 'No events matched your current search or filter. Try clearing filters.'
                : 'You have not created any celebrations yet. Start your first master plan in 15 seconds!'}
            </p>
            <button onClick={onOpenWizard} className="btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
              <PlusCircle size={17} />
              <span>Create Your First Event Plan</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {filteredPlans.map((plan) => {
              const { basics, budget, vendors: planVendors } = plan;
              const daysRemaining = calculateDaysRemaining(basics.eventDate);
              const spentTotal = budget.items?.reduce((s, it) => s + (it.spentAmount || 0), 0) || 0;
              const spentPct = budget.totalBudget > 0 ? Math.round((spentTotal / budget.totalBudget) * 100) : 0;
              const isSelected = plan.id === activePlanId;

              return (
                <div
                  key={plan.id}
                  className="glass-card"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '1.15rem',
                    border: isSelected ? '2px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.18)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isSelected
                      ? '0 8px 25px rgba(234, 88, 12, 0.15)'
                      : '0 4px 15px rgba(45, 24, 15, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div>
                    {/* Top Row: Event Type & Days Countdown Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <span className="badge badge-orange" style={{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {basics.eventType}
                      </span>
                      {daysRemaining !== null && (
                        <span
                          className="badge"
                          style={{
                            background: daysRemaining < 30 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 88, 12, 0.1)',
                            color: daysRemaining < 30 ? '#DC2626' : '#C2410C',
                            border: '1px solid currentColor',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          <Clock size={11} style={{ marginRight: '0.25rem' }} />
                          {daysRemaining > 0 ? `${daysRemaining} Days to Go` : 'Event Day / Past'}
                        </span>
                      )}
                    </div>

                    {/* Title & Date */}
                    <h3
                      onClick={() => handleOpenPlan(plan.id)}
                      style={{
                        fontSize: '1.3rem',
                        fontWeight: 800,
                        color: '#140A05',
                        margin: '0 0 0.4rem 0',
                        cursor: 'pointer',
                        lineHeight: 1.3,
                      }}
                      title="Open event workspace"
                    >
                      {basics.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#78533E', margin: '0 0 1rem 0', fontWeight: 600 }}>
                      📅 {basics.eventDate || 'Flexible Timeline'} • 📍 {basics.location || 'Location TBD'}
                    </p>

                    {/* Summary Excerpt */}
                    <p
                      style={{
                        fontSize: '0.825rem',
                        color: '#573523',
                        lineHeight: 1.45,
                        margin: '0 0 1.25rem 0',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {plan.summary}
                    </p>

                    {/* Key Stats Row */}
                    <div
                      style={{
                        background: '#FAF6EF',
                        borderRadius: '0.75rem',
                        padding: '0.85rem 1rem',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#78533E', fontWeight: 700, textTransform: 'uppercase' }}>
                          Budget
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#140A05' }}>
                          {formatCurrency(budget.totalBudget, budget.currency)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#78533E' }}>
                          Spent: {formatCurrency(spentTotal, budget.currency)} ({spentPct}%)
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#78533E', fontWeight: 700, textTransform: 'uppercase' }}>
                          Attendees
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#140A05' }}>
                          {basics.guestCount} Guests
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#78533E' }}>
                          {planVendors?.length || 0} Vendors Tracked
                        </div>
                      </div>
                    </div>

                    {/* Mini Budget Spent Progress Bar */}
                    <div style={{ marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          height: '6px',
                          background: '#E4DACB',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(spentPct, 100)}%`,
                            background: spentPct > 100 ? '#DC2626' : 'linear-gradient(90deg, #F97316, #D97706)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Bottom Strip */}
                  <div style={{ borderTop: '1px solid #F0E6D8', paddingTop: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem' }}>
                      <button
                        onClick={() => handleOpenPlan(plan.id)}
                        className="btn-primary"
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.85rem',
                          justifyContent: 'center',
                        }}
                      >
                        <span>Open Event Studio</span>
                        <ArrowRight size={15} />
                      </button>

                      <button
                        onClick={() => onPrintPlan(plan)}
                        className="btn-secondary"
                        style={{ padding: '0.6rem', color: '#78533E' }}
                        title="Print or export PDF dossier"
                      >
                        <Printer size={15} />
                      </button>

                      <button
                        onClick={() => onSharePlan(plan)}
                        className="btn-secondary"
                        style={{ padding: '0.6rem', color: '#78533E' }}
                        title="Share brief with vendors and collaborators"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>

                    {/* Utility links: Duplicate & Delete */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => onDuplicatePlan(plan.id)}
                        className="btn-ghost"
                        style={{ fontSize: '0.75rem', color: '#78533E', padding: '0.2rem 0.4rem' }}
                      >
                        <Copy size={12} style={{ marginRight: '0.25rem' }} />
                        <span>Duplicate</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${basics.title}"? This cannot be undone.`)) {
                            onDeletePlan(plan.id);
                          }
                        }}
                        className="btn-ghost"
                        style={{ fontSize: '0.75rem', color: '#DC2626', padding: '0.2rem 0.4rem' }}
                        title="Delete this event plan"
                      >
                        <Trash2 size={12} style={{ marginRight: '0.25rem' }} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
