import React, { useState } from 'react';
import {
  CloudRain,
  Sun,
  CloudLightning,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Send,
  DollarSign,
  Tent,
  Thermometer,
  Wind,
  Umbrella,
  X,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan, BudgetItem, HourlyRunOfShowItem } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

interface WeatherContingencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onUpdateBudget: (updatedItems: BudgetItem[], totalBudget?: number) => void;
  onUpdateRunOfShow?: (updatedRunOfShow: HourlyRunOfShowItem[]) => void;
}

export const WeatherContingencyModal: React.FC<WeatherContingencyModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdateBudget,
  onUpdateRunOfShow,
}) => {
  const [simulatedCondition, setSimulatedCondition] = useState<'clear' | 'rain' | 'storm'>('rain');
  const [isPlanBActive, setIsPlanBActive] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const contingencyItem = plan.budget.items.find((i) => i.isContingency) || plan.budget.items[plan.budget.items.length - 1];
  const contingencyFunds = contingencyItem?.allocatedAmount || 0;
  const estimatedTentCost = Math.min(Math.round(plan.budget.totalBudget * 0.04), 1800);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleActivatePlanB = () => {
    setIsPlanBActive(true);

    // If contingency reserve has enough funds, allocate a tent/indoor staging buffer
    if (contingencyItem && contingencyFunds >= estimatedTentCost) {
      const updatedBudget = plan.budget.items.map((item) => {
        if (item.id === contingencyItem.id) {
          return {
            ...item,
            allocatedAmount: Math.max(0, item.allocatedAmount - estimatedTentCost),
            spentAmount: (item.spentAmount || 0) + estimatedTentCost,
            notes: `${item.notes || ''} [Weather Plan B: $${estimatedTentCost} drawn for marquee tenting & indoor flooring]`.trim(),
          };
        }
        return item;
      });
      onUpdateBudget(updatedBudget);
    }

    // Update Run of Show locations if outdoor
    if (plan.runOfShow && onUpdateRunOfShow) {
      const updatedRunOfShow = plan.runOfShow.map((slot) => {
        const loc = (slot.location || '').toLowerCase();
        if (loc.includes('lawn') || loc.includes('garden') || loc.includes('outdoor')) {
          return {
            ...slot,
            location: 'Covered Pavilion / Grand Hall (Plan B)',
            notes: `${slot.notes ? slot.notes + ' - ' : ''}Shifted indoors due to Weather Plan B`,
          };
        }
        return slot;
      });
      onUpdateRunOfShow(updatedRunOfShow);
    }

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#f59e0b'],
      });
    } catch {}
  };

  const guestSmsDraft = `⚠️ [Planora Weather Alert - ${plan.basics.title}]: Due to rain in the forecast, our celebration is shifting seamlessly to the Covered Pavilion & Ballroom at ${plan.basics.location || 'the venue'}. Valet will have umbrellas ready upon arrival. Ceremony begins promptly as scheduled. See you soon!`;

  const vendorAlertDraft = `📢 URGENT VENDOR NOTICE: ${plan.basics.title} Weather Contingency Plan B is now ACTIVATED. Caterers and sound engineers please stage equipment under covered terrace bay 2. Outdoor acoustic setup relocated indoors. Marquee tent team confirmed. Contact planner with any logistics questions.`;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 10, 5, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel modal-card"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(45, 24, 15, 0.35)',
          border: '1.5px solid rgba(234, 88, 12, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          animation: 'modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid rgba(234, 88, 12, 0.15)', paddingBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #0284C7, #0369A1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <CloudRain size={20} />
              </div>
              <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.12)', border: '1px solid rgba(2, 132, 199, 0.35)', color: '#0369A1' }}>
                Event Weather Guard
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', color: '#140A05', fontWeight: 800 }}>
              Weather "Plan B" Contingency & Rain Simulator
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#4A2B1A', margin: 0, fontWeight: 500 }}>
              Outdoor and hybrid event insurance: simulate forecast disruptions, re-route run of show, and draw emergency tent funds.
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.4rem', borderRadius: '50%', color: '#6B4226' }}
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Weather Simulator Controls */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(245, 158, 11, 0.06) 100%)',
            border: '1.5px solid rgba(2, 132, 199, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0369A1' }}>
                Forecast Simulation Radar
              </span>
              <h4 style={{ fontSize: '1.1rem', color: '#140A05', fontWeight: 700, margin: '0.1rem 0' }}>
                Venue Location: {plan.basics.location || 'Riverside Gardens & Estate'}
              </h4>
            </div>

            {/* Condition Switcher */}
            <div style={{ display: 'flex', gap: '0.35rem', background: '#FFFFFF', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
              <button
                type="button"
                onClick={() => setSimulatedCondition('clear')}
                className="btn-ghost"
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: simulatedCondition === 'clear' ? '#F59E0B' : 'transparent',
                  color: simulatedCondition === 'clear' ? '#FFFFFF' : '#4A2B1A',
                }}
              >
                <Sun size={13} style={{ marginRight: '0.3rem' }} />
                Sunny (10%)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedCondition('rain')}
                className="btn-ghost"
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: simulatedCondition === 'rain' ? '#0284C7' : 'transparent',
                  color: simulatedCondition === 'rain' ? '#FFFFFF' : '#4A2B1A',
                }}
              >
                <CloudRain size={13} style={{ marginRight: '0.3rem' }} />
                Rain Storm (78%)
              </button>
              <button
                type="button"
                onClick={() => setSimulatedCondition('storm')}
                className="btn-ghost"
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: simulatedCondition === 'storm' ? '#7C2D12' : 'transparent',
                  color: simulatedCondition === 'storm' ? '#FFFFFF' : '#4A2B1A',
                }}
              >
                <CloudLightning size={13} style={{ marginRight: '0.3rem' }} />
                Gale & Thunder
              </button>
            </div>
          </div>

          {/* Meteorological telemetry strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0369A1', fontSize: '0.75rem', fontWeight: 700 }}>
                <CloudRain size={13} />
                <span>Precipitation</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', marginTop: '0.2rem' }}>
                {simulatedCondition === 'clear' ? '8%' : simulatedCondition === 'rain' ? '84%' : '96%'}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#D97706', fontSize: '0.75rem', fontWeight: 700 }}>
                <Thermometer size={13} />
                <span>Ambient Temp</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', marginTop: '0.2rem' }}>
                {simulatedCondition === 'clear' ? '26°C / 78°F' : '19°C / 66°F'}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0284C7', fontSize: '0.75rem', fontWeight: 700 }}>
                <Wind size={13} />
                <span>Wind Gusts</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', marginTop: '0.2rem' }}>
                {simulatedCondition === 'clear' ? '6 km/h' : simulatedCondition === 'rain' ? '28 km/h' : '52 km/h'}
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(2, 132, 199, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803D', fontSize: '0.75rem', fontWeight: 700 }}>
                <Tent size={13} />
                <span>Venue Setting</span>
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', marginTop: '0.2rem', textTransform: 'capitalize' }}>
                {plan.basics.venueSetting || 'Hybrid'}
              </div>
            </div>
          </div>
        </div>

        {/* Plan B Activation Card */}
        <div
          style={{
            background: isPlanBActive ? 'rgba(34, 197, 94, 0.08)' : 'rgba(234, 88, 12, 0.06)',
            border: isPlanBActive ? '1.5px solid rgba(34, 197, 94, 0.4)' : '1.5px solid rgba(234, 88, 12, 0.28)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {isPlanBActive ? (
                  <CheckCircle2 size={18} color="#15803D" />
                ) : (
                  <ShieldAlert size={18} color="#C2410C" />
                )}
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: isPlanBActive ? '#15803D' : '#9A3412' }}>
                  {isPlanBActive ? 'Plan B Currently Deployed' : 'Contingency Protection Standby'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', color: '#140A05', fontWeight: 700 }}>
                Automated Covered Relocation & Marquee Staging
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#4A2B1A', margin: 0, fontWeight: 500, maxWidth: '520px' }}>
                Activating Plan B automatically draws {formatCurrency(estimatedTentCost, plan.budget.currency)} from your existing Contingency Reserve without exceeding your total budget, and re-labels outdoor slots to Covered Pavilion.
              </p>
            </div>

            <div>
              {!isPlanBActive ? (
                <button
                  type="button"
                  id="btn-activate-plan-b"
                  onClick={handleActivatePlanB}
                  className="btn-primary pulse-glow"
                  style={{
                    padding: '0.65rem 1.25rem',
                    fontSize: '0.9rem',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                    boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)',
                  }}
                >
                  <Umbrella size={16} />
                  <span>Activate Rain Plan B Now</span>
                </button>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    background: '#15803D',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>Plan B Activated</span>
                </span>
              )}
            </div>
          </div>

          {/* Contingency Math reconciliation pill */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FFFFFF',
              padding: '0.75rem 1.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(234, 88, 12, 0.2)',
              fontSize: '0.85rem',
              color: '#372013',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <span>
              Contingency Reserve: <strong>{formatCurrency(contingencyFunds, plan.budget.currency)}</strong>
            </span>
            <span>
              Tent & Floor Rental Cost: <strong style={{ color: '#C2410C' }}>{formatCurrency(estimatedTentCost, plan.budget.currency)}</strong>
            </span>
            <span>
              Net Reserve Remaining:{' '}
              <strong style={{ color: '#15803D' }}>
                {formatCurrency(Math.max(0, contingencyFunds - (isPlanBActive ? estimatedTentCost : 0)), plan.budget.currency)}
              </strong>
            </span>
          </div>
        </div>

        {/* 1-Click Communications Dispatch */}
        <div>
          <h4 style={{ fontSize: '1rem', color: '#140A05', fontWeight: 800, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Send size={16} color="#EA580C" />
            <span>Instant Dispatch Broadcasts (1-Click Copy & Send)</span>
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
            {/* Guest SMS Alert */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(234, 88, 12, 0.22)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase' }}>
                    Guest SMS / WhatsApp Broadcast
                  </span>
                  <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(234, 88, 12, 0.1)', color: '#9A3412' }}>
                    {plan.basics.guestCount} Recipients
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#2D180F', lineHeight: 1.5, background: 'rgba(251, 247, 240, 0.7)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(234, 88, 12, 0.15)', margin: 0 }}>
                  "{guestSmsDraft}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(guestSmsDraft, 'guest')}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.45rem', fontSize: '0.825rem' }}
              >
                {copiedType === 'guest' ? <Check size={14} color="#15803D" /> : <Copy size={14} />}
                <span>{copiedType === 'guest' ? 'Copied to Clipboard!' : 'Copy Guest SMS'}</span>
              </button>
            </div>

            {/* Vendor Logistics Dispatch */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1.5px solid rgba(234, 88, 12, 0.22)',
                borderRadius: 'var(--radius-md)',
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0369A1', textTransform: 'uppercase' }}>
                    Vendor Critical Notice
                  </span>
                  <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(2, 132, 199, 0.1)', color: '#0369A1' }}>
                    Caterer, DJ, Florist
                  </span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#2D180F', lineHeight: 1.5, background: 'rgba(251, 247, 240, 0.7)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(2, 132, 199, 0.15)', margin: 0 }}>
                  "{vendorAlertDraft}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(vendorAlertDraft, 'vendor')}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '0.45rem', fontSize: '0.825rem' }}
              >
                {copiedType === 'vendor' ? <Check size={14} color="#15803D" /> : <Copy size={14} />}
                <span>{copiedType === 'vendor' ? 'Copied to Clipboard!' : 'Copy Vendor Notice'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(234, 88, 12, 0.15)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.55rem 1.5rem', fontSize: '0.9rem' }}
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
