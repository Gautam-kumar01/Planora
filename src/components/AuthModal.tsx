import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  CheckCircle,
  Cloud,
  ShieldCheck,
  Sparkles,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { UserProfile } from '../types';
import { loginUser, registerUser, logoutUser } from '../utils/cloudSync';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
  onSyncTriggered?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onSyncTriggered,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await loginUser(email, password);
      onUserChange(user);
      setSuccessMsg(`Welcome back, ${user.fullName}! Plans synced.`);
      onSyncTriggered?.();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !name.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await registerUser(name, email, password);
      onUserChange(user);
      setSuccessMsg(`Account created for ${user.fullName}! Cloud sync active.`);
      onSyncTriggered?.();
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onUserChange(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '2rem', maxWidth: '480px', background: 'rgba(255, 255, 255, 0.98)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
              }}
            >
              <Cloud size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', color: '#140A05', fontWeight: 800, margin: 0 }}>
                {currentUser ? 'Your Planora Account' : 'Cloud Sync & Account'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#4A2B1A', margin: '0.15rem 0 0 0', fontWeight: 500 }}>
                Option C: Hybrid Guest-First with Cloud Persistence
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              background: 'rgba(240, 253, 244, 0.95)',
              border: '1px solid #16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
              color: '#15803D',
              fontWeight: 700,
            }}
          >
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              background: 'rgba(254, 242, 242, 0.95)',
              border: '1.5px solid #ef4444',
              fontSize: '0.825rem',
              color: '#991b1b',
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
            }}
          >
            <div>{errorMsg}</div>
            {tab === 'login' && errorMsg.includes('Create Account') && (
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                }}
                style={{
                  alignSelf: 'flex-start',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#C2410C',
                  fontWeight: 800,
                  fontSize: '0.825rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                Switch to Create Account now →
              </button>
            )}
          </div>
        )}

        {/* Logged In View */}
        {currentUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div
              style={{
                background: 'rgba(234, 88, 12, 0.08)',
                border: '1.5px solid rgba(234, 88, 12, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EA580C, #9A3412)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 10px rgba(234, 88, 12, 0.3)',
                  }}
                >
                  {currentUser.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#140A05' }}>
                    {currentUser.fullName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#573523' }}>{currentUser.email}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.825rem', color: '#15803D', fontWeight: 600 }}>
                <CheckCircle size={16} color="#15803D" />
                <span>Cloud Sync Active • All plans saved and synchronized</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-secondary"
                style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 700, borderColor: '#fca5a5', padding: '0.5rem 1.25rem' }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Logged In - Tabbed Navigation: Only Sign In & Create Account */
          <div>
            {/* Tab Selection */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(234, 88, 12, 0.08)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-full)',
                marginBottom: '1.25rem',
                border: '1px solid rgba(234, 88, 12, 0.2)',
              }}
            >
              <button
                onClick={() => setTab('login')}
                className="btn-ghost"
                style={{
                  flex: 1,
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  background: tab === 'login' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
                  color: tab === 'login' ? '#FFFFFF' : '#140A05',
                  fontWeight: 700,
                  boxShadow: tab === 'login' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab('register')}
                className="btn-ghost"
                style={{
                  flex: 1,
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem',
                  background: tab === 'register' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
                  color: tab === 'register' ? '#FFFFFF' : '#140A05',
                  fontWeight: 700,
                  boxShadow: tab === 'register' ? '0 2px 8px rgba(234, 88, 12, 0.3)' : 'none',
                }}
              >
                Create Account
              </button>
            </div>

            {/* Guest Freedom Banner */}
            <div
              style={{
                background: 'rgba(254, 243, 199, 0.55)',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.825rem',
                color: '#92400E',
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={18} color="#D97706" style={{ flexShrink: 0 }} />
              <span>
                <strong>Guest Mode Active:</strong> You can create, edit, and export plans right now with zero login. Sign in only if you want cross-device cloud sync.
              </span>
            </div>

            {/* Tab 1: Login Form */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="glass-input"
                    placeholder="you@celebration.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div
                  style={{
                    background: 'rgba(234, 88, 12, 0.06)',
                    border: '1px dashed rgba(234, 88, 12, 0.35)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.65rem 0.85rem',
                    fontSize: '0.775rem',
                    color: '#78350F',
                    lineHeight: 1.45,
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#9A3412' }}>💡 Test Demo Account:</span>{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>planner@planora.com</span> /{' '}
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>Planora2026!</span>
                  <div style={{ marginTop: '0.2rem', color: '#573523' }}>
                    Or create your own custom account via the <strong>Create Account</strong> tab.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="btn-primary">
                    <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Register Form */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. Elena Rostova"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="glass-input"
                    placeholder="you@celebration.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    className="glass-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button type="button" onClick={onClose} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading} className="btn-primary">
                    <span>{isLoading ? 'Creating...' : 'Create Account'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
