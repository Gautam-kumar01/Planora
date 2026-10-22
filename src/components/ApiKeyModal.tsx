import React, { useState } from 'react';
import {
  KeyRound,
  X,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { getStoredApiKey, setStoredApiKey, isOpenRouterKey } from '../utils/storage';
import { testAiConnection } from '../utils/geminiApi';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    model?: string;
    message?: string;
  } | null>(null);

  if (!isOpen) return null;

  const isOpenRouter = isOpenRouterKey(apiKey);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testAiConnection(apiKey);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredApiKey(apiKey);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem', maxWidth: '540px', background: 'rgba(255, 255, 255, 0.98)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ea580c, #c2410c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
              }}
            >
              <KeyRound size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#140A05', fontWeight: 800 }}>
                AI Model & API Key Settings
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#78533E', fontWeight: 600 }}>
                Supports OpenRouter (Google Gemini 2.5 Flash) & Google Gemini Direct
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem', color: '#78533E' }}>
            <X size={18} />
          </button>
        </div>

        {/* Provider Status Pill */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: isOpenRouter ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 88, 12, 0.08)',
            border: isOpenRouter ? '1.5px solid rgba(34, 197, 94, 0.3)' : '1.5px solid rgba(234, 88, 12, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color={isOpenRouter ? '#15803D' : '#C2410C'} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isOpenRouter ? '#15803D' : '#9A3412' }}>
              {isOpenRouter ? '🟢 Active Provider: OpenRouter (Google Gemini 2.5 Flash)' : apiKey ? '🟢 Active Provider: Google Gemini 2.5 Flash Direct' : '⚪ Active Engine: Local Deterministic (No Key Needed)'}
            </span>
          </div>

          {apiKey && (
            <button
              id="btn-test-connection"
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-secondary"
              style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', borderColor: 'var(--color-orange-400)' }}
            >
              {testing ? <Loader2 size={13} className="spin-fast" /> : <Sparkles size={13} />}
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          )}
        </div>

        {/* Test Result Display */}
        {testResult && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              background: testResult.success ? 'rgba(240, 253, 244, 0.9)' : 'rgba(254, 242, 242, 0.9)',
              border: testResult.success ? '1px solid #16a34a' : '1px solid #ef4444',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.825rem',
            }}
          >
            {testResult.success ? (
              <CheckCircle2 size={18} color="#15803D" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            ) : (
              <AlertCircle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, color: testResult.success ? '#15803D' : '#b91c1c' }}>
                {testResult.success ? 'Connection Successful!' : 'Connection Error'}
              </div>
              <div style={{ color: '#372013', marginTop: '0.15rem' }}>{testResult.message}</div>
              {testResult.model && (
                <div style={{ color: '#78533E', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  Model: {testResult.model}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#140A05', fontWeight: 700, marginBottom: '0.4rem' }}>
              API Key (OpenRouter or Google Gemini)
            </label>
            <input
              type="password"
              className="glass-input"
              placeholder="sk-or-v1-... or AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}
            />
            <span style={{ fontSize: '0.75rem', color: '#4A2B1A', marginTop: '0.35rem', display: 'block', fontWeight: 500 }}>
              Keys starting with <code>sk-or-</code> route to OpenRouter. Stored in your local <code>.env</code> and browser storage.
            </span>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(234, 88, 12, 0.08)',
              border: '1.5px solid rgba(234, 88, 12, 0.25)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#140A05', fontWeight: 600 }}>
              <ShieldCheck size={16} color="#15803D" />
              <span>Offline deterministic engine always ready as fallback</span>
            </div>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '0.75rem',
                color: '#C2410C',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                textDecoration: 'none',
              }}
            >
              <span>OpenRouter Keys</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Close
            </button>
            <button type="submit" className="btn-primary">
              {saved ? (
                <>
                  <Check size={16} />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save Key</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
