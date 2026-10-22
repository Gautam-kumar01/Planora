import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Zap,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  User,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import { CopilotMessage, EventPlan } from '../types';
import { simulateWhatIfScenario } from '../utils/geminiApi';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  onApplyPatch: (patchAction: any) => void;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  plan,
  onApplyPatch,
}) => {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `Hello! I'm your Planora Event Concierge & Copilot. I'm connected directly with live AI (Google Gemini 2.5 Flash) and loaded with the full details of "${plan.basics.title}".

Ask me anything about planning:
• Vendor interview questions & negotiation tips
• Day-of timeline pacing & speech sequencing
• Smart budget adjustments & cost-cutting hacks
• Creative themes, signature drinks & entertainment ideas`,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Dynamic starter chips tailored to event type
  const getEventStarterChips = () => {
    switch (plan.basics.eventType) {
      case 'wedding':
        return [
          'What questions should I ask my DJ?',
          'How can I cut $1,500 without guests noticing?',
          'Pace the cocktail hour & dinner speeches',
          'What if venue is free / donated?',
        ];
      case 'birthday':
        return [
          'Engaging party games for guests',
          'Allergy-safe snacks & mocktail pairings',
          'Timeline for arrival, games & cake cutting',
          'What if guest count increases by 30%?',
        ];
      case 'community':
        return [
          'Municipal permits & safety requirements',
          'Volunteer coordinator run of show',
          'Cost-saving equipment rental tactics',
          'Contingency plan for sudden rain',
        ];
      default:
        return [
          'What questions should I ask vendors?',
          'How to optimize my budget allocations?',
          'Suggest 3 creative guest icebreakers',
          'What if budget decreases by $1,000?',
        ];
    }
  };

  const starterChips = getEventStarterChips();

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    const userMsg: CopilotMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const result = await simulateWhatIfScenario(plan, text);

      const aiMsg: CopilotMessage = {
        id: `msg-a-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: result.reply,
        patchAction: result.patchAction,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: 'I ran into an issue processing that question. Please try asking again!',
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Helper to render basic markdown formatting (bold, headings, bullet lists)
  const renderFormattedText = (rawText: string) => {
    const lines = rawText.split('\n');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} style={{ height: '0.35rem' }} />;

          // Heading 3 or 2
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
            const headingText = trimmed.replace(/^#+\s*/, '');
            return (
              <div key={lIdx} style={{ fontWeight: 800, color: '#FED7AA', fontSize: '0.95rem', marginTop: '0.35rem' }}>
                {headingText}
              </div>
            );
          }

          // Bullet points
          if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
            const bulletContent = trimmed.replace(/^[-•*]\s*/, '');
            return (
              <div key={lIdx} style={{ display: 'flex', gap: '0.45rem', paddingLeft: '0.35rem' }}>
                <span style={{ color: '#F97316', fontWeight: 800 }}>•</span>
                <span>{renderInlineBold(bulletContent)}</span>
              </div>
            );
          }

          // Numbered lists (e.g. "1. ")
          const numMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
          if (numMatch) {
            return (
              <div key={lIdx} style={{ display: 'flex', gap: '0.45rem', paddingLeft: '0.35rem' }}>
                <span style={{ color: '#F59E0B', fontWeight: 700, minWidth: '18px' }}>{numMatch[1]}.</span>
                <span>{renderInlineBold(numMatch[2])}</span>
              </div>
            );
          }

          return <div key={lIdx}>{renderInlineBold(trimmed)}</div>;
        })}
      </div>
    );
  };

  // Inline bold parser for **bold** text
  const renderInlineBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} style={{ color: '#FDBA74', fontWeight: 700 }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <aside className={`copilot-drawer ${isOpen ? 'open' : 'closed'} no-print`} style={{ zIndex: 1200 }}>
      {/* Drawer Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(28, 18, 12, 0.98)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #ea580c, #c2410c)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
            }}
          >
            <Bot size={19} color="#fff" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', margin: 0, fontWeight: 800, color: '#fff' }}>
              Planora AI Concierge
            </h3>
            <span style={{ fontSize: '0.725rem', color: '#86efac', fontWeight: 600 }}>
              ● Live GenAI Assistant (Google Gemini 2.5 Flash)
            </span>
          </div>
        </div>

        <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem', color: '#fed7aa' }}>
          <X size={18} />
        </button>
      </div>

      {/* Suggested Inquiries / Quick Starter Chips */}
      <div
        style={{
          padding: '0.75rem 1.25rem',
          background: 'rgba(38, 25, 17, 0.75)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div
          style={{
            fontSize: '0.75rem',
            color: '#fed7aa',
            fontWeight: 700,
            marginBottom: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <Lightbulb size={13} color="var(--color-amber-400)" />
          <span>Recommended Questions & Scenarios:</span>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {starterChips.map((chip, cIdx) => (
            <button
              key={cIdx}
              onClick={() => handleSendMessage(chip)}
              className="btn-secondary"
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.725rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(45, 24, 15, 0.85)',
                color: '#FED7AA',
                borderColor: 'rgba(251, 146, 60, 0.3)',
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'rgba(20, 10, 5, 0.96)',
        }}
      >
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                display: 'flex',
                gap: '0.6rem',
                flexDirection: isUser ? 'row-reverse' : 'row',
              }}
            >
              {/* Sender Avatar */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: isUser ? 'linear-gradient(135deg, #c2410c, #9a3412)' : 'linear-gradient(135deg, #ea580c, #c2410c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  flexShrink: 0,
                  marginTop: '0.2rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                }}
              >
                {isUser ? <User size={14} /> : <Bot size={15} />}
              </div>

              {/* Message Bubble */}
              <div
                style={{
                  background: isUser ? 'linear-gradient(135deg, #c2410c, #9a3412)' : 'rgba(38, 25, 18, 0.92)',
                  border: '1px solid',
                  borderColor: isUser ? 'rgba(251, 146, 60, 0.35)' : 'rgba(251, 146, 60, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1.1rem',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                }}
              >
                <div style={{ fontSize: '0.875rem', color: '#fff', lineHeight: 1.55 }}>
                  {isUser ? m.text : renderFormattedText(m.text)}
                </div>

                {/* Direct Patching Action Button */}
                {m.patchAction && (
                  <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(251, 146, 60, 0.25)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#FDBA74', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Recommended Action for your Master Plan:
                    </div>
                    <button
                      onClick={() => onApplyPatch(m.patchAction)}
                      className="btn-primary"
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.9rem',
                        fontSize: '0.825rem',
                        background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                        fontWeight: 700,
                      }}
                    >
                      <Sparkles size={14} />
                      <span>{m.patchAction.label}</span>
                    </button>
                  </div>
                )}

                <div
                  style={{
                    fontSize: '0.68rem',
                    color: '#fed7aa',
                    opacity: 0.65,
                    marginTop: '0.45rem',
                    textAlign: isUser ? 'right' : 'left',
                  }}
                >
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(38, 25, 18, 0.92)',
              border: '1px solid rgba(251, 146, 60, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
              color: '#fed7aa',
            }}
          >
            <Sparkles size={15} className="pulse-glow" color="var(--color-amber-400)" />
            <span>Consulting AI Event Concierge (Google Gemini 2.5 Flash)...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div
        style={{
          padding: '1rem',
          borderTop: '1px solid var(--glass-border)',
          background: 'rgba(28, 18, 12, 0.98)',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '0.5rem' }}
        >
          <input
            type="text"
            className="glass-input"
            placeholder="Ask anything about planning, vendors, games, pacing..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isThinking}
            style={{ fontSize: '0.875rem' }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="btn-primary"
            style={{ padding: '0.5rem 0.9rem' }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </aside>
  );
};
