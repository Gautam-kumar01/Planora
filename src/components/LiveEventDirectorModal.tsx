import React, { useState, useEffect } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  MapPin,
  Sparkles,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  Volume2,
  FastForward,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { EventPlan, HourlyRunOfShowItem } from '../types';

interface LiveEventDirectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onUpdateRunOfShow?: (updatedRunOfShow: HourlyRunOfShowItem[]) => void;
}

export const LiveEventDirectorModal: React.FC<LiveEventDirectorModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdateRunOfShow,
}) => {
  const runOfShow = plan.runOfShow || [];
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [delayMinutesAdded, setDelayMinutesAdded] = useState<number>(0);

  // Live ticking clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const currentSlot = runOfShow[currentSlotIndex] || {
    id: 'placeholder',
    time: '18:00',
    activity: 'Reception Commences',
    owner: 'Master of Ceremonies',
    location: 'Main Ballroom',
    notes: 'Ensure ambient lighting and welcome drinks are poured',
  };

  const nextSlot = runOfShow[currentSlotIndex + 1];

  const handleCompleteAndAdvance = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f97316', '#f59e0b', '#10b981', '#fbbf24'],
      });
    } catch {}

    if (currentSlotIndex < runOfShow.length - 1) {
      setCurrentSlotIndex((prev) => prev + 1);
    }
  };

  const handleAddBuffer = (mins: number) => {
    setDelayMinutesAdded((prev) => prev + mins);
  };

  const totalSlots = Math.max(1, runOfShow.length);
  const progressPercent = Math.round(((currentSlotIndex + 1) / totalSlots) * 100);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 8, 4, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isFullscreen ? '0' : '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isFullscreen) onClose();
      }}
    >
      <div
        className="glass-panel modal-card"
        style={{
          width: '100%',
          maxWidth: isFullscreen ? '100vw' : '900px',
          height: isFullscreen ? '100vh' : 'auto',
          maxHeight: isFullscreen ? '100vh' : '90vh',
          borderRadius: isFullscreen ? '0' : 'var(--radius-lg)',
          overflowY: 'auto',
          padding: '2rem',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #FBF7F0 100%)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.45)',
          border: '1.5px solid rgba(234, 88, 12, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          animation: 'modalScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Top Director Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1.5px solid rgba(234, 88, 12, 0.18)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 15px rgba(234, 88, 12, 0.35)',
              }}
            >
              <FastForward size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                  Live Conductor
                </span>
                <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
                  LIVE EVENT BROADCAST
                </span>
              </div>
              <h2 style={{ fontSize: '1.45rem', color: '#140A05', fontWeight: 800, margin: '0.1rem 0' }}>
                Day-Of Event Director Mode
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Live Real-time Clock */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#1C110A',
                color: '#FED7AA',
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem',
                fontWeight: 800,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              <Clock size={15} color="#F97316" />
              <span>{currentTimeStr || '12:00:00 PM'}</span>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="btn-ghost"
              style={{ padding: '0.45rem', borderRadius: '8px', color: '#6B4226' }}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Stage Mode'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            <button
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '0.45rem', borderRadius: '50%', color: '#6B4226' }}
              title="Close Director Mode"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Run of Show Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: '#4A2B1A', fontWeight: 700 }}>
            <span>Run-of-Show Progress: Slot {currentSlotIndex + 1} of {totalSlots}</span>
            <span style={{ color: '#C2410C' }}>{progressPercent}% Event Completed</span>
          </div>
          <div
            style={{
              width: '100%',
              height: '8px',
              background: 'rgba(234, 88, 12, 0.12)',
              borderRadius: '99px',
              overflow: 'hidden',
              border: '1px solid rgba(234, 88, 12, 0.2)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #F97316, #16A34A)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* ACTIVE CUE SPOTLIGHT CARD */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
            border: '2px solid #EA580C',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            boxShadow: '0 12px 30px -8px rgba(234, 88, 12, 0.25)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                background: '#EA580C',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Sparkles size={14} />
              <span>CURRENT ACTIVE CUE</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 900, color: '#9A3412' }}>
                {currentSlot.time}
              </span>
              {delayMinutesAdded > 0 && (
                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#DC2626', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  +{delayMinutesAdded}m buffer
                </span>
              )}
            </div>
          </div>

          <h1 style={{ fontSize: '1.85rem', color: '#140A05', fontWeight: 800, marginBottom: '0.65rem' }}>
            {currentSlot.activity}
          </h1>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#3D2214', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} color="#EA580C" />
              <span>Owner / Lead: <strong style={{ color: '#140A05' }}>{currentSlot.owner}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={16} color="#0284C7" />
              <span>Location: <strong style={{ color: '#140A05' }}>{currentSlot.location}</strong></span>
            </div>
          </div>

          {currentSlot.notes && (
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1.15rem',
                fontSize: '0.875rem',
                color: '#372013',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              <strong>Director Cue Note:</strong> {currentSlot.notes}
            </div>
          )}

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              id="btn-complete-advance-cue"
              onClick={handleCompleteAndAdvance}
              className="btn-primary pulse-glow"
              style={{
                padding: '0.85rem 1.75rem',
                fontSize: '1rem',
                background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                boxShadow: '0 6px 20px rgba(22, 163, 74, 0.35)',
              }}
            >
              <CheckCircle2 size={18} />
              <span>Complete Cue & Advance to Next</span>
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => handleAddBuffer(15)}
              className="btn-secondary"
              style={{ padding: '0.75rem 1.15rem', fontSize: '0.875rem' }}
              title="Add 15 min buffer if running late"
            >
              <Clock size={16} />
              <span>Add +15m Stage Buffer</span>
            </button>

            {currentSlotIndex > 0 && (
              <button
                type="button"
                onClick={() => setCurrentSlotIndex((prev) => Math.max(0, prev - 1))}
                className="btn-ghost"
                style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#6B4226' }}
              >
                <RotateCcw size={15} />
                <span>Prev Cue</span>
              </button>
            )}
          </div>
        </div>

        {/* Up Next Preview & Full Run of Show Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Next Cue Card */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                On Deck (Next Cue)
              </span>
              {nextSlot ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.35rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#9A3412', fontSize: '1.1rem' }}>
                      {nextSlot.time}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6B4226' }}>({nextSlot.location})</span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: '#140A05', fontWeight: 700, margin: '0.25rem 0' }}>
                    {nextSlot.activity}
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: '#4A2B1A', margin: 0 }}>
                    Responsible: <strong>{nextSlot.owner}</strong>
                  </p>
                </>
              ) : (
                <p style={{ fontSize: '0.9rem', color: '#15803D', fontWeight: 700, marginTop: '0.5rem' }}>
                  🎉 Final Cue of the Evening! Celebration Finale!
                </p>
              )}
            </div>
          </div>

          {/* Quick Vendor Speed-Dial & Stage Logistics */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1.5px solid rgba(234, 88, 12, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284C7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Stage Lead Speed-Dial (Ready to Ring)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', padding: '0.35rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span><strong>Audio & DJ Booth</strong>: Mark V.</span>
                <a href="tel:+15551234567" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Phone size={12} /> Call Booth
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', padding: '0.35rem 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span><strong>Head Chef / Catering</strong>: Chef Elena</span>
                <a href="tel:+15559876543" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Phone size={12} /> Call Kitchen
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem', padding: '0.35rem 0' }}>
                <span><strong>Venue Floor Manager</strong>: Sarah T.</span>
                <a href="tel:+15554567890" style={{ color: '#0284C7', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Phone size={12} /> Call Radios
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(234, 88, 12, 0.15)', paddingTop: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.55rem 1.5rem', fontSize: '0.9rem' }}
          >
            <span>Exit Director Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
