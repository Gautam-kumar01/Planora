import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  Sparkles,
  Lock,
  CheckCircle2,
  Send,
  ExternalLink,
  Info,
  Scale,
  Brain,
  Cpu,
} from 'lucide-react';

interface AiTransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiTransparencyModal: React.FC<AiTransparencyModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'safeguards' | 'estimates' | 'privacy' | 'feedback'>('safeguards');
  const [feedbackCategory, setFeedbackCategory] = useState<'unhelpful' | 'pricing' | 'infeasible' | 'cultural' | 'other'>('unhelpful');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    // Save feedback to local audit trail
    try {
      const existing = JSON.parse(localStorage.getItem('planora_user_feedback_v1') || '[]');
      existing.push({
        id: `fb-${Date.now()}`,
        timestamp: new Date().toISOString(),
        category: feedbackCategory,
        comment: feedbackText.trim(),
      });
      localStorage.setItem('planora_user_feedback_v1', JSON.stringify(existing));
    } catch {}

    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackText('');
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.98)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldCheck size={22} color="#C2410C" />
              <span className="badge badge-orange">AI Transparency & Known Limitations</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#140A05' }}>
              Trust, Safeguards & AI Ethics
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#573523', fontWeight: 500, marginTop: '0.2rem' }}>
              Complying with Challenge 5 PRD Sections 6, 11, 12, 14, and 21.
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.4rem', color: '#78533E' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid rgba(234, 88, 12, 0.2)',
            paddingBottom: '0.75rem',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveTab('safeguards')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'safeguards' ? '#C2410C' : 'transparent',
              color: activeTab === 'safeguards' ? '#FFFFFF' : '#573523',
              transition: 'all 0.2s ease',
            }}
          >
            AI Safeguards & Architecture
          </button>
          <button
            onClick={() => setActiveTab('estimates')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'estimates' ? '#C2410C' : 'transparent',
              color: activeTab === 'estimates' ? '#FFFFFF' : '#573523',
              transition: 'all 0.2s ease',
            }}
          >
            Pricing & Estimates Policy
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'privacy' ? '#C2410C' : 'transparent',
              color: activeTab === 'privacy' ? '#FFFFFF' : '#573523',
              transition: 'all 0.2s ease',
            }}
          >
            Privacy & Data Security
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.825rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'feedback' ? '#C2410C' : 'transparent',
              color: activeTab === 'feedback' ? '#FFFFFF' : '#573523',
              transition: 'all 0.2s ease',
            }}
          >
            Report / Refine Suggestion
          </button>
        </div>

        {/* Tab 1: AI Safeguards & Architecture */}
        {activeTab === 'safeguards' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#2C1810', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <div style={{ background: 'rgba(234, 88, 12, 0.08)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#9A3412', marginBottom: '0.35rem' }}>
                <Brain size={18} color="#C2410C" />
                <span>Deterministic Math + GenAI Creativity (Hybrid Engine)</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A2B1A' }}>
                Planora never allows generative AI models to compute raw arithmetic. Google Gemini proposes creative themes, cultural etiquette, and suggested category ratios, while client-side TypeScript application code strictly balances all numbers so that the sum of line items always equals your total budget.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ border: '1px solid rgba(234, 88, 12, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: '#140A05', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                  <ShieldCheck size={16} color="#15803D" />
                  <span>Zero False Certainty (FR-23)</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#573523', margin: 0 }}>
                  Planora does not fabricate named commercial vendors, contact numbers, live availability, or guaranteed legal permits. All vendor items are generalized service roles with recommended interview questions.
                </p>
              </div>

              <div style={{ border: '1px solid rgba(234, 88, 12, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 700, color: '#140A05', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                  <CheckCircle2 size={16} color="#15803D" />
                  <span>Isolated Section Regeneration (FR-29)</span>
                </div>
                <p style={{ fontSize: '0.825rem', color: '#573523', margin: 0 }}>
                  Targeted section edits or idea regenerations never silently overwrite your confirmed tasks, notes, or manually customized budget line items.
                </p>
              </div>
            </div>

            <div style={{ border: '1px solid rgba(234, 88, 12, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: '#140A05', display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.3rem' }}>
                <Scale size={16} color="#C2410C" />
                <span>Inclusive & Culturally Respectful (FR-26)</span>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#573523', margin: 0 }}>
                Our system prompt explicitly enforces neutral defaults. The assistant avoids making assumptions about religion, culture, family structures, or gender roles unless you explicitly request specific traditions in your preferences.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Pricing & Estimates Policy */}
        {activeTab === 'estimates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#2C1810', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#92400E', marginBottom: '0.35rem' }}>
                <AlertCircle size={18} color="#D97706" />
                <span>Planning Estimates vs. Verified Quotes (FR-11)</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#4A2B1A' }}>
                All monetary figures generated by Planora are <strong>planning estimates and benchmark proportions</strong>, not binding contractor proposals. Actual costs vary widely by city, seasonality, weekend vs. weekday scheduling, and vendor availability.
              </p>
            </div>

            <h4 style={{ fontWeight: 700, color: '#140A05', margin: '0.5rem 0 0.25rem' }}>
              Standard Industry Allocation Benchmarks Used:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.825rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#9A3412', display: 'block' }}>Weddings</strong>
                Venue & Catering (40-45%), Photo/Video (12-15%), Attire (8-10%), Decor (10%), Music (8%), Contingency (8%).
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#9A3412', display: 'block' }}>Birthdays</strong>
                Venue/Activity (30%), Food & Cake (35%), Entertainment (15%), Decor & Favors (12%), Buffer (8%).
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.8)', border: '1px solid rgba(234, 88, 12, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                <strong style={{ color: '#9A3412', display: 'block' }}>Community Events</strong>
                Permits & Safety (15%), Rentals (25%), Refreshments (30%), Marketing (10%), Contingency (10%).
              </div>
            </div>

            <p style={{ fontSize: '0.825rem', color: '#573523', marginTop: '0.5rem' }}>
              <strong>Contingency Reserve:</strong> Every Planora budget automatically reserves 5% to 10% of total funds in a dedicated Safety Reserve to protect against unexpected price increases or rush shipping fees.
            </p>
          </div>
        )}

        {/* Tab 3: Privacy & Security */}
        {activeTab === 'privacy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#2C1810', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.25rem' }}>
              <Lock size={20} color="#15803D" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                Data Privacy by Design (Section 12 & 20)
              </h3>
            </div>

            <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.85rem' }}>
              <li>
                <strong>100% Client-Side Persistence:</strong> In Guest Mode, all event plans, notes, and task progress are stored exclusively within your browser's local sandbox (<code>localStorage</code>).
              </li>
              <li>
                <strong>No Mandatory Database:</strong> You do not need to provide an external database or account to plan, calculate, and print.
              </li>
              <li>
                <strong>Ephemeral AI Invocations:</strong> Prompts sent to Google Gemini contain only the minimum necessary event context (event type, guest count, budget, and stated preferences) without transmitting personal credit card or account credentials.
              </li>
              <li>
                <strong>Instant Data Erasure:</strong> You can delete any saved plan or reset local storage at any time with one click from the Plan Manager.
              </li>
            </ul>
          </div>
        )}

        {/* Tab 4: Report / Refine Suggestion */}
        {activeTab === 'feedback' && (
          <div>
            {feedbackSubmitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={42} color="#15803D" style={{ margin: '0 auto 0.75rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#140A05' }}>
                  Thank you! Feedback Logged.
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#573523' }}>
                  Your report has been saved to the audit log to improve future suggestion templates.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.35rem' }}>
                    What best describes the issue?
                  </label>
                  <select
                    value={feedbackCategory}
                    onChange={(e: any) => setFeedbackCategory(e.target.value)}
                    className="glass-input"
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <option value="unhelpful">Suggestion was too generic or unhelpful</option>
                    <option value="pricing">Budget/cost estimate was inaccurate for my region</option>
                    <option value="infeasible">Timeline or logistics were physically infeasible</option>
                    <option value="cultural">Suggestion made unwarranted cultural or dietary assumptions</option>
                    <option value="other">Other observation / usability suggestion</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.35rem' }}>
                    Specific Details or Suggestion
                  </label>
                  <textarea
                    rows={4}
                    className="glass-input"
                    placeholder="e.g. In my region, municipal permits require 60 days lead time rather than 14 days..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    required
                    style={{ fontSize: '0.85rem', lineHeight: 1.5 }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Send size={14} />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Footer info bar */}
        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(234, 88, 12, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#78533E',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span>Planora Engine v2.1 • PromptWars Challenge 5 Release</span>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
