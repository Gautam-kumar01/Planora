import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Gamepad2,
  Utensils,
  Lightbulb,
  Copy,
  Check,
  RefreshCw,
  Wand2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { EventPlan, PersonalizedIdeas, ThemeConcept } from '../types';
import { regenerateIdeasWithAI } from '../utils/geminiApi';

interface CreativeIdeasProps {
  plan: EventPlan;
  onUpdateIdeas: (updatedIdeas: PersonalizedIdeas, updatedTheme?: ThemeConcept) => void;
}

export const CreativeIdeas: React.FC<CreativeIdeasProps> = ({ plan, onUpdateIdeas }) => {
  const { themeConcept, ideas } = plan;
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [isTweaking, setIsTweaking] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [customFocus, setCustomFocus] = useState('');
  const [regenSuccess, setRegenSuccess] = useState(false);

  // Copy hex code to clipboard
  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  // Targeted AI Section Regeneration (Preserves all other sections)
  const handleRegenerateIdeas = async (focusOverride?: string) => {
    setIsRegenerating(true);
    setAiError(null);
    setRegenSuccess(false);
    try {
      const result = await regenerateIdeasWithAI(plan, focusOverride || customFocus);
      onUpdateIdeas(result.ideas, result.themeConcept);
      setRegenSuccess(true);
      setTimeout(() => setRegenSuccess(false), 4000);
    } catch (err: any) {
      setAiError(err.message || 'AI idea generation failed. Please check your connection or API key.');
    } finally {
      setIsRegenerating(false);
    }
  };

  // Granular Tweak Chips
  const handleQuickTweak = (tweakMode: string) => {
    setIsTweaking(true);
    setTimeout(() => {
      let tweakedIdeas = { ...ideas };
      let tweakedTheme = { ...themeConcept };

      if (tweakMode === 'diy') {
        tweakedIdeas.diyHacks = [
          ...tweakedIdeas.diyHacks,
          'Rent reusable glass drink dispensers and batch your own signature beverage instead of individual cans to save $250.',
          'Borrow potted floor plants and citrus trees from friends to frame the entrance for zero cost.',
        ];
      } else if (tweakMode === 'formal') {
        tweakedTheme.keywords = [...tweakedTheme.keywords, 'Black Tie Optional', 'Candelabras', 'White Glove Service'];
      } else if (tweakMode === 'kids') {
        tweakedIdeas.activities = [
          ...tweakedIdeas.activities,
          {
            title: 'Kids Scavenger Hunt & Sticker Passports',
            description: 'Printable map cards where children find 6 decorative symbols around the venue to earn a gold chocolate medal.',
            estimatedCost: '$15 supplies',
            ageGroup: 'Kids 4-10',
          },
        ];
      } else if (tweakMode === 'accessible') {
        tweakedIdeas.activities = [
          ...tweakedIdeas.activities,
          {
            title: 'Quiet Sensory Lounge & Low-Stimulation Nook',
            description: 'A cozy corner with warm ambient lamps, noise-reducing ear covers, and soft plush seating for sensory breaks.',
            estimatedCost: '$30 setup',
            ageGroup: 'All guests',
          },
        ];
      } else if (tweakMode === 'indoor') {
        tweakedIdeas.decorAndAtmosphere = [
          ...tweakedIdeas.decorAndAtmosphere,
          {
            title: 'Indoor Fairy Filament Canopy & Uplights',
            description: 'Ceiling string lights with warm amber floor uplighting creating an intimate courtyard feeling indoors.',
          },
        ];
      }

      onUpdateIdeas(tweakedIdeas, tweakedTheme);
      setIsTweaking(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Priority 2.4 & 2.5: Isolated AI Idea Regeneration with Edit Preservation */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(254, 243, 199, 0.45))',
          border: '1.5px solid rgba(234, 88, 12, 0.28)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--color-orange-500)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#140A05' }}>
              Targeted AI Section Generator
            </span>
            <span
              className="badge"
              style={{
                background: 'rgba(234, 88, 12, 0.1)',
                color: '#9A3412',
                border: '1px solid rgba(234, 88, 12, 0.25)',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              Google Gemini 2.5 Flash
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: '#78533E', fontWeight: 600 }}>
            🔒 Safe Regeneration: Preserves all your budget math, timeline milestones, and vendor edits
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={customFocus}
            onChange={(e) => setCustomFocus(e.target.value)}
            placeholder="Optional creative direction (e.g., 'Eco-friendly acoustic terrace, botanical mocktails, gold accents')"
            aria-label="Creative direction for AI generation"
            style={{
              flex: '1 1 320px',
              padding: '0.55rem 0.85rem',
              fontSize: '0.85rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(234, 88, 12, 0.25)',
              background: '#FFFFFF',
              color: '#140A05',
            }}
          />

          <button
            id="btn-regenerate-ideas"
            type="button"
            onClick={() => handleRegenerateIdeas()}
            disabled={isRegenerating}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.25rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <RefreshCw size={14} className={isRegenerating ? 'spin' : ''} />
            <span>{isRegenerating ? 'Generating Fresh Ideas...' : 'Regenerate Ideas'}</span>
          </button>
        </div>

        {/* Status / Error Alerts */}
        {aiError && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: '#991B1B',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <AlertCircle size={16} color="#DC2626" />
              <span>
                <strong>AI Generation Error:</strong> {aiError}. Your existing budget numbers and timeline edits are intact.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRegenerateIdeas()}
              className="btn-secondary"
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.75rem',
                borderColor: '#DC2626',
                color: '#991B1B',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {regenSuccess && (
          <div
            role="status"
            style={{
              padding: '0.65rem 1rem',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: '#166534',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <CheckCircle2 size={16} color="#16A34A" />
            <span>
              Fresh creative ideas generated! Your budget, timeline, and vendor edits were preserved.
            </span>
          </div>
        )}
      </div>

      {/* Visual Moodboard & Color Swatches */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Palette size={18} color="#C2410C" />
              <span className="badge badge-orange">Visual Palette & Styling</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#140A05', fontWeight: 800, letterSpacing: '-0.02em' }}>
              {themeConcept.title}
            </h2>
            <p style={{ color: '#2C1810', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '780px', lineHeight: 1.6, fontWeight: 500 }}>
              {themeConcept.description}
            </p>
          </div>

          {/* Quick Adjustment Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#4A2B1A', fontWeight: 600 }}>Tweak vibe:</span>
            {[
              { id: 'diy', label: 'More DIY Hacks' },
              { id: 'formal', label: 'More Formal' },
              { id: 'kids', label: 'Kid Friendly' },
              { id: 'accessible', label: 'Sensory / Accessible' },
              { id: 'indoor', label: 'Indoor Setting' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => handleQuickTweak(chip.id)}
                disabled={isTweaking}
                className="btn-secondary"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
              >
                <Wand2 size={12} />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Palette Swatches */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {themeConcept.colorPalette?.map((color, idx) => (
            <div
              key={idx}
              onClick={() => handleCopyHex(color.hex)}
              className="glass-card-interactive"
              style={{
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                cursor: 'pointer',
              }}
              title="Click to copy Hex code"
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: color.hex,
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: `0 4px 14px ${color.hex}55`,
                  flexShrink: 0,
                }}
              />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#140A05', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {color.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#C2410C', fontWeight: 700 }}>
                    {color.hex}
                  </span>
                  {copiedHex === color.hex ? (
                    <Check size={12} color="#15803D" />
                  ) : (
                    <Copy size={12} color="#78533E" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Styling Keywords Chips */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#78533E', fontWeight: 700, marginRight: '0.35rem' }}>
            Styling Directives:
          </span>
          {themeConcept.keywords?.map((keyword, kIdx) => (
            <span
              key={kIdx}
              className="badge"
              style={{
                background: 'rgba(234, 88, 12, 0.12)',
                border: '1px solid rgba(234, 88, 12, 0.3)',
                color: '#9A3412',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              #{keyword}
            </span>
          ))}
        </div>
      </div>

      {/* 3-Column Grid: Activities, Food & Beverage, DIY Hacks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Column 1: Activities & Entertainment */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Gamepad2 size={20} color="#D97706" />
            <h3 style={{ fontSize: '1.25rem', color: '#140A05' }}>Interactive Activities</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ideas.activities?.map((act, aIdx) => (
              <div
                key={aIdx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(234, 88, 12, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.15rem',
                  boxShadow: '0 2px 8px rgba(45, 24, 15, 0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#140A05' }}>
                    {act.title}
                  </div>
                  {act.estimatedCost && (
                    <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>
                      {act.estimatedCost}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                  {act.description}
                </p>
                {act.ageGroup && (
                  <div style={{ fontSize: '0.75rem', color: '#C2410C', fontWeight: 700, marginTop: '0.4rem' }}>
                    Target: {act.ageGroup}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Food & Beverage Pairings */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Utensils size={20} color="#EA580C" />
            <h3 style={{ fontSize: '1.25rem', color: '#140A05' }}>Food & Beverage Pairings</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {ideas.foodAndBeverage?.map((food, fIdx) => (
              <div
                key={fIdx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(234, 88, 12, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.15rem',
                  boxShadow: '0 2px 8px rgba(45, 24, 15, 0.04)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#140A05', marginBottom: '0.35rem' }}>
                  {food.title}
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.5rem', fontWeight: 500 }}>
                  {food.description}
                </p>
                {food.dietaryTags && (
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {food.dietaryTags.map((tag, tIdx) => (
                      <span key={tIdx} className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: DIY Hacks & Decor */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lightbulb size={20} color="#D97706" />
            <h3 style={{ fontSize: '1.25rem', color: '#140A05' }}>Eco & Budget DIY Hacks</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {ideas.diyHacks?.map((hack, hIdx) => (
              <div
                key={hIdx}
                style={{
                  background: 'rgba(254, 243, 199, 0.55)',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.9rem 1.1rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'rgba(234, 88, 12, 0.18)',
                    color: '#9A3412',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {hIdx + 1}
                </div>
                <p style={{ fontSize: '0.85rem', color: '#140A05', lineHeight: 1.5, fontWeight: 500 }}>
                  {hack}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
