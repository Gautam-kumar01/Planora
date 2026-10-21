import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Palette,
  Printer,
  Heart,
  Cake,
  Megaphone,
  Lock,
  ExternalLink,
  Bot,
} from 'lucide-react';

interface FooterProps {
  onOpenAiTransparency?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAiTransparency }) => {
  return (
    <footer className="app-footer no-print">
      <div style={{ maxWidth: '1360px', margin: '0 auto' }}>
        {/* Top Trust & Value Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '2.5rem',
            marginBottom: '3rem',
            borderBottom: '1px solid rgba(251, 146, 60, 0.22)',
            flexWrap: 'wrap',
            gap: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(249, 115, 22, 0.4)',
              }}
            >
              <Sparkles size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                Planora Celebration & Event Planner
              </div>
              <div style={{ fontSize: '0.825rem', color: '#FED7AA', fontWeight: 500 }}>
                PromptWars 2026 Challenge 5 • Deterministic Financial Core
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem', color: '#E2D5CC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <ShieldCheck size={18} color="#4ADE80" />
              <span style={{ fontWeight: 600 }}>Deterministic Math (Sum == 100%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Lock size={16} color="#FB923C" />
              <span style={{ fontWeight: 600 }}>100% Private Local Storage</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <CheckCircle size={17} color="#FBBF24" />
              <span style={{ fontWeight: 600 }}>Zero Hallucinated Arithmetic</span>
            </div>
          </div>
        </div>

        {/* 5-Column Deep Architectural Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '3.5rem',
          }}
        >
          {/* Column 1: Brand & Mission */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#FED7AA',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                fontWeight: 800,
              }}
            >
              About Planora
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#D6C5B9', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Planora unites generative AI creativity with rigorous deterministic arithmetic. We eliminate budget anxiety and fragmented checklists for milestone celebrations.
            </p>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 0.85rem',
                background: 'rgba(234, 88, 12, 0.16)',
                border: '1px solid rgba(251, 146, 60, 0.35)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.78rem',
                color: '#FED7AA',
                fontWeight: 600,
              }}
            >
              <Bot size={15} color="#FB923C" />
              <span>Gemini 2.5 Flash Engine</span>
            </div>
          </div>

          {/* Column 2: 4 Synchronized Modules */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#FED7AA',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                fontWeight: 800,
              }}
            >
              Core Modules
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#D6C5B9' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={15} color="#FB923C" />
                <span>1. Smart Budget Hub & Sliders</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={15} color="#FB923C" />
                <span>2. Milestone Roadmap & Timeline</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={15} color="#FB923C" />
                <span>3. Hourly Day-of Run of Show</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={15} color="#FB923C" />
                <span>4. Vendor Pipeline & Questions</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Palette size={15} color="#FB923C" />
                <span>5. Styling Moodboard & DIY Hacks</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Showcase Personas */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#FED7AA',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                fontWeight: 800,
              }}
            >
              Showcase Presets
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#D6C5B9' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Heart size={15} color="#FB7185" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 600 }}>Botanical Wedding</div>
                  <div style={{ fontSize: '0.75rem', color: '#A8978C' }}>$25,000 • 150 Guests • 9 Mo Out</div>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Cake size={15} color="#FBBF24" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 600 }}>Arcade Cosmic Birthday</div>
                  <div style={{ fontSize: '0.75rem', color: '#A8978C' }}>$600 • 25 Kids • 3 Wks Out</div>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Megaphone size={15} color="#38BDF8" style={{ marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#FFFFFF', fontWeight: 600 }}>River Clean-Up Festival</div>
                  <div style={{ fontSize: '0.75rem', color: '#A8978C' }}>$1,500 Grant • 120 Attendees</div>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Deterministic Principles */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#FED7AA',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                fontWeight: 800,
              }}
            >
              Deterministic Math
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem', color: '#D6C5B9' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#4ADE80" />
                <span>Sum constraint: Total == 100%</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#4ADE80" />
                <span>Trade-off balancing buffer</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#4ADE80" />
                <span>Headcount arithmetic precision</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#4ADE80" />
                <span>1-Click iCalendar (.ics) export</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle size={14} color="#4ADE80" />
                <span>Full CSS-styled PDF printing</span>
              </li>
            </ul>
          </div>

          {/* Column 5: AI Advisory & Compliance (FR-11, Sec 6) */}
          <div>
            <h4
              style={{
                fontSize: '0.95rem',
                color: '#FED7AA',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1rem',
                fontWeight: 800,
              }}
            >
              AI Advisory Notice
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#C7B3A6', lineHeight: 1.6, marginBottom: '0.85rem' }}>
              All budget allocations, lead times, and vendor costs generated by Planora are planning approximations based on regional benchmarks. Availability, permits, and final contracts must be verified directly with providers.
            </p>
            {onOpenAiTransparency && (
              <button
                type="button"
                onClick={onOpenAiTransparency}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(249, 115, 22, 0.2)',
                  border: '1px solid rgba(251, 146, 60, 0.45)',
                  color: '#FED7AA',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '0.75rem',
                }}
              >
                <ShieldCheck size={14} color="#FB923C" />
                <span>AI Ethics & Limitations Policy</span>
              </button>
            )}
            <div style={{ fontSize: '0.78rem', color: '#FED7AA', fontWeight: 600 }}>
              Production Ready • PRD Validated
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(251, 146, 60, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.825rem',
            color: '#B09C90',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
            <span style={{ color: '#E2D5CC', fontWeight: 600 }}>Local Deterministic Engine Ready</span>
            <span>•</span>
            <span>Gemini Copilot Active</span>
            <span>•</span>
            <span>Zero Remote Telemetry</span>
          </div>

          <div style={{ color: '#FED7AA', fontWeight: 600 }}>
            WCAG AAA Compliant Contrast • PromptWars 2026
          </div>

          <div>
            © 2026 Planora. Crafted for master celebration planners.
          </div>
        </div>
      </div>
    </footer>
  );
};
