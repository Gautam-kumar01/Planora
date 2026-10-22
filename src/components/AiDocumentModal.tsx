import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Copy,
  Check,
  FileText,
  Mail,
  Wine,
  Send,
  Loader2,
  Share2,
  RefreshCw,
  Lightbulb,
} from 'lucide-react';
import { EventPlan } from '../types';
import { generateAiCelebrationDocument } from '../utils/geminiApi';

interface AiDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

export const AiDocumentModal: React.FC<AiDocumentModalProps> = ({ isOpen, onClose, plan }) => {
  const [activeTab, setActiveTab] = useState<'invitation' | 'speech' | 'vendor_email'>('invitation');
  const [tone, setTone] = useState<string>('warm');
  const [speechRole, setSpeechRole] = useState<string>('Host Welcome Speech');
  const [vendorCategory, setVendorCategory] = useState<string>(
    plan.vendors[0]?.service || 'Catering & Food Service'
  );
  const [specialNotes, setSpecialNotes] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setCopied(false);
    try {
      const output = await generateAiCelebrationDocument(plan, activeTab, {
        tone,
        speechRole,
        vendorService: vendorCategory,
        specialNotes,
      });
      setGeneratedOutput(output);
    } catch (err) {
      console.error('Failed to generate document:', err);
      setGeneratedOutput('An error occurred during generation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '740px',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.98)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
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
                boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
              }}
            >
              <FileText size={22} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800, margin: 0 }}>
                  AI Document & Speech Studio
                </h3>
                <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
                  AI Studio
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#78533E', margin: '0.2rem 0 0 0', fontWeight: 600 }}>
                Generate Digital Invites, Heartfelt Speeches & Vendor Negotiation Letters with Google Gemini 2.5 Flash
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* 3 Tab Navigation */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(234, 88, 12, 0.08)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1.5rem',
            border: '1px solid rgba(234, 88, 12, 0.2)',
          }}
        >
          <button
            onClick={() => {
              setActiveTab('invitation');
              setGeneratedOutput('');
            }}
            className="btn-ghost"
            style={{
              flex: 1,
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              background: activeTab === 'invitation' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
              color: activeTab === 'invitation' ? '#FFFFFF' : '#140A05',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'invitation' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
            }}
          >
            <Mail size={15} />
            <span>Digital Invitations</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('speech');
              setGeneratedOutput('');
            }}
            className="btn-ghost"
            style={{
              flex: 1,
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              background: activeTab === 'speech' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
              color: activeTab === 'speech' ? '#FFFFFF' : '#140A05',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'speech' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
            }}
          >
            <Wine size={15} />
            <span>Speeches & Toasts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('vendor_email');
              setGeneratedOutput('');
            }}
            className="btn-ghost"
            style={{
              flex: 1,
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              background: activeTab === 'vendor_email' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
              color: activeTab === 'vendor_email' ? '#FFFFFF' : '#140A05',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              boxShadow: activeTab === 'vendor_email' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
            }}
          >
            <Send size={15} />
            <span>Vendor Inquiries</span>
          </button>
        </div>

        {/* Form Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {/* Tone Selector */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: '#140A05', fontWeight: 700 }}>
              Writing Tone & Style
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="glass-input"
              style={{ background: '#FFFFFF', color: '#140A05', fontWeight: 600 }}
            >
              <option value="warm">Warm, Heartfelt & Celebratory</option>
              <option value="fun">Fun, Witty & High Energy</option>
              <option value="formal">Elegant, Formal & Sophisticated</option>
              <option value="minimal">Minimal, Direct & WhatsApp Ready</option>
            </select>
          </div>

          {/* Conditional Input by Tab */}
          {activeTab === 'speech' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: '#140A05', fontWeight: 700 }}>
                Speech / Speaker Role
              </label>
              <select
                value={speechRole}
                onChange={(e) => setSpeechRole(e.target.value)}
                className="glass-input"
                style={{ background: '#FFFFFF', color: '#140A05', fontWeight: 600 }}
              >
                <option value="Host Welcome Speech">Event Host Welcome Speech (5-7 mins)</option>
                <option value="Maid of Honor Toast">Maid of Honor / Best Friend Speech</option>
                <option value="Best Man Toast">Best Man / Key Partner Toast</option>
                <option value="Parent of Honor Speech">Parent of the Couple / Honoree Toast</option>
                <option value="Birthday Milestone Speech">Milestone Birthday Tribute</option>
                <option value="Community Leader Address">Community Leader / Organizer Welcome</option>
              </select>
            </div>
          )}

          {activeTab === 'vendor_email' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: '#140A05', fontWeight: 700 }}>
                Vendor Service Category
              </label>
              <select
                value={vendorCategory}
                onChange={(e) => setVendorCategory(e.target.value)}
                className="glass-input"
                style={{ background: '#FFFFFF', color: '#140A05', fontWeight: 600 }}
              >
                {plan.budget.items.map((item) => (
                  <option key={item.id} value={item.category}>
                    {item.category} (${item.allocatedAmount.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Special Details / Memories */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.8rem', color: '#140A05', fontWeight: 700 }}>
            {activeTab === 'speech'
              ? 'Key Stories or Inside Memories to Include (Optional)'
              : activeTab === 'invitation'
              ? 'Dress Code, RSVP Deadline or Special Notes (Optional)'
              : 'Specific Questions or Requirements for Vendor (Optional)'}
          </label>
          <input
            type="text"
            className="glass-input"
            placeholder={
              activeTab === 'speech'
                ? 'e.g. How they met in college library, their dog Barnaby, road trip to Big Sur...'
                : activeTab === 'invitation'
                ? 'e.g. Cocktail attire with a touch of gold; RSVP by April 10th...'
                : 'e.g. Inquire about gluten-free kitchen cross-contamination, load-in timing...'
            }
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            style={{ fontSize: '0.85rem' }}
          />
        </div>

        {/* Generate Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#78533E' }}>
            <Lightbulb size={14} color="#D97706" />
            <span>Trained on "{plan.basics.title}" budget & timeline constraints</span>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary"
            style={{
              padding: '0.55rem 1.4rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isGenerating ? <Loader2 size={16} className="spin-fast" /> : <Sparkles size={16} />}
            <span>{isGenerating ? 'Crafting with AI...' : 'Generate with AI'}</span>
          </button>
        </div>

        {/* Output Area */}
        {generatedOutput && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: '#FFFDF9',
              border: '1.5px solid rgba(234, 88, 12, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              position: 'relative',
              boxShadow: 'inset 0 2px 6px rgba(45, 24, 15, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(234, 88, 12, 0.15)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Generated {activeTab === 'invitation' ? 'Digital Invite' : activeTab === 'speech' ? 'Speech Script' : 'Vendor Inquiry'}
              </span>

              <button
                onClick={handleCopy}
                className="btn-secondary"
                style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
              >
                {copied ? <Check size={14} color="#15803D" /> : <Copy size={14} />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}</span>
              </button>
            </div>

            <div
              style={{
                fontSize: '0.875rem',
                color: '#140A05',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {generatedOutput}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
