import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  Heart,
  Cake,
  Megaphone,
  CheckCircle,
  Zap,
} from 'lucide-react';
import { EventPlan } from '../types';

interface HeroLandingProps {
  onOpenWizard: () => void;
  onSelectSample: (presetId: string) => void;
  plans: EventPlan[];
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onOpenWizard,
  onSelectSample,
  plans,
}) => {
  return (
    <section className="no-print" style={{ marginBottom: '2.5rem' }}>
      {/* Banner / Value Proposition */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.35rem 0.9rem',
            background: 'rgba(234, 88, 12, 0.12)',
            border: '1px solid rgba(234, 88, 12, 0.35)',
            borderRadius: 'var(--radius-full)',
            color: '#9A3412',
            fontSize: '0.8rem',
            fontWeight: 700,
            marginBottom: '1.25rem',
          }}
        >
          <Sparkles size={15} color="#D97706" />
          <span>PromptWars Challenge 5: Celebration & Event Planner</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.1rem, 4.2vw, 3.4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            marginBottom: '1rem',
            color: '#140A05',
            letterSpacing: '-0.025em',
          }}
        >
          Transform Scattered Event Ideas Into a{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #D97706 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: '#C2410C',
              fontWeight: 900,
            }}
          >
            Master Plan
          </span>{' '}
          in 15 Seconds
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: '#2C1810',
            maxWidth: '780px',
            margin: '0 auto 1.75rem auto',
            lineHeight: 1.65,
            fontWeight: 500,
          }}
        >
          Planora fuses <strong style={{ color: '#9A3412', fontWeight: 700 }}>GenAI creativity</strong> with{' '}
          <strong style={{ color: '#9A3412', fontWeight: 700 }}>deterministic financial math</strong> for weddings,
          birthdays, and community festivals. Zero hallucinated arithmetic, dynamic timelines, vendor vetting guides, and instant iCal sync.
        </p>

        {/* Action CTAs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenWizard}
            className="btn-primary pulse-glow"
            style={{ padding: '0.8rem 2rem', fontSize: '1.05rem' }}
          >
            <span>Create Your Event Plan</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Differentiator Highlights */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '2rem',
            marginTop: '2rem',
            flexWrap: 'wrap',
            fontSize: '0.9rem',
            color: '#140A05',
            fontWeight: 700,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>Deterministic Math (Sum == 100%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>Hourly Run of Show</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>Interactive "What-If" Simulator</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <CheckCircle size={18} color="#15803D" />
            <span>1-Click .ICS & PDF Export</span>
          </div>
        </div>
      </div>

      {/* Preset Quick Showcase Cards (PRD Section 2 Personas) */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800 }}>
              Or Explore Real Showcase Presets:
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#4A2B1A', fontWeight: 500, marginTop: '0.2rem' }}>
              Click any persona to inspect their synchronized budget, timeline, and vendor checklist.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {/* Preset 1: Wedding */}
          <div
            onClick={() => onSelectSample('preset-wedding-01')}
            className="glass-card-interactive"
            style={{ padding: '1.4rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(225, 29, 72, 0.12)', border: '1px solid rgba(225, 29, 72, 0.35)', color: '#9F1239' }}>
                <Heart size={14} style={{ marginRight: '0.25rem' }} />
                Wedding
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#9A3412', fontWeight: 800 }}>
                $25,000 Budget
              </span>
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: '#140A05', fontWeight: 700 }}>
              Priya & Arjun's Celestial Botanical Wedding
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              150 guests, 9 months out, rich heritage fusion, terracotta & gold styling, and sequenced vendor roadmaps.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#C2410C', fontWeight: 700 }}>
              <span>Load Wedding Master Plan</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Preset 2: Birthday */}
          <div
            onClick={() => onSelectSample('preset-birthday-02')}
            className="glass-card-interactive"
            style={{ padding: '1.4rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(217, 119, 6, 0.14)', border: '1px solid rgba(217, 119, 6, 0.35)', color: '#92400E' }}>
                <Cake size={14} style={{ marginRight: '0.25rem' }} />
                Birthday Party
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#9A3412', fontWeight: 800 }}>
                $600 Budget
              </span>
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: '#140A05', fontWeight: 700 }}>
              Marcus's 7th Retro Arcade & Cosmic Blast
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              25 kids, 3 weeks out, DIY games, nut-safe pizza schedule, and 2-hour hourly run of show.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#C2410C', fontWeight: 700 }}>
              <span>Load Birthday Master Plan</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Preset 3: Community */}
          <div
            onClick={() => onSelectSample('preset-community-03')}
            className="glass-card-interactive"
            style={{ padding: '1.4rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <span className="badge" style={{ background: 'rgba(2, 132, 199, 0.14)', border: '1px solid rgba(2, 132, 199, 0.35)', color: '#0369A1' }}>
                <Megaphone size={14} style={{ marginRight: '0.25rem' }} />
                Community Event
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: '#9A3412', fontWeight: 800 }}>
                $1,500 Grant
              </span>
            </div>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem', color: '#140A05', fontWeight: 700 }}>
              Oakridge River Clean-Up & Harvest Festival
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1rem' }}>
              120 attendees, permits, volunteer coordination shifts, waste disposal, and acoustic folk music.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#C2410C', fontWeight: 700 }}>
              <span>Load Community Master Plan</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
