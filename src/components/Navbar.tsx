import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  Printer,
  PlusCircle,
  KeyRound,
  Bot,
  Layers,
  ChevronDown,
  Home,
  LayoutDashboard,
  Cloud,
  CheckCircle,
  User,
  ShieldCheck,
  Share2,
  Menu,
  X,
} from 'lucide-react';
import { EventPlan, UserProfile } from '../types';

interface NavbarProps {
  plans: EventPlan[];
  activePlan: EventPlan | null;
  onSelectPlan: (id: string) => void;
  onOpenWizard: () => void;
  onOpenApiKeyModal: () => void;
  onOpenPlanManager: () => void;
  onToggleCopilot: () => void;
  isCopilotOpen: boolean;
  onPrint: () => void;
  onExportICS: () => void;
  currentView: 'home' | 'dashboard' | 'user-hub';
  onNavigateHome: () => void;
  onNavigateDashboard: () => void;
  onNavigateUserDashboard?: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenAiTransparency: () => void;
  onOpenShareModal?: () => void;
  onOpenIndianIntelligence?: () => void;
  onToggleLanguage?: () => void;
  language?: 'en' | 'hi';
}

export const Navbar: React.FC<NavbarProps> = ({
  plans,
  activePlan,
  onSelectPlan,
  onOpenWizard,
  onOpenApiKeyModal,
  onOpenPlanManager,
  onToggleCopilot,
  isCopilotOpen,
  onPrint,
  onExportICS,
  currentView,
  onNavigateHome,
  onNavigateDashboard,
  onNavigateUserDashboard,
  currentUser,
  onOpenAuthModal,
  onOpenAiTransparency,
  onOpenShareModal,
  onOpenIndianIntelligence,
  onToggleLanguage,
  language = 'en',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNav = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className="no-print app-navbar"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        background: 'rgba(20, 13, 9, 0.94)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderBottom: '1px solid rgba(251, 146, 60, 0.22)',
        padding: '0.75rem 1.25rem',
      }}
    >
      <div
        style={{
          maxWidth: '1380px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => handleMobileNav(onNavigateHome)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer' }}
          title="Return to Planora Homepage"
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(249, 115, 22, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
            }}
          >
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 60%, #fb923c 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Planora
              </span>
              <span
                className="badge badge-orange"
                style={{ fontSize: '0.65rem', padding: '0.12rem 0.45rem' }}
              >
                Copilot
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#FED7AA', margin: 0, fontWeight: 500, whiteSpace: 'nowrap' }}>
              Event Master Planner
            </p>
          </div>
        </div>

        {/* DESKTOP NAVIGATION CONTENT (Hidden on mobile via CSS) */}
        <div className="desktop-nav-content" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, justifyContent: 'space-between', marginLeft: '1rem' }}>
          {/* Home / Dashboard View Switcher */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(45, 24, 15, 0.95)',
              padding: '0.2rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(251, 146, 60, 0.3)',
            }}
          >
            <button
              onClick={onNavigateHome}
              className="btn-ghost"
              style={{
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                background: currentView === 'home' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
                color: currentView === 'home' ? '#FFFFFF' : '#FED7AA',
                fontWeight: 700,
              }}
            >
              <Home size={13} style={{ marginRight: '0.3rem' }} />
              <span>Home</span>
            </button>

            {currentUser && onNavigateUserDashboard && (
              <button
                id="btn-nav-user-hub"
                onClick={onNavigateUserDashboard}
                className="btn-ghost"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  background: currentView === 'user-hub' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
                  color: currentView === 'user-hub' ? '#FFFFFF' : '#FED7AA',
                  fontWeight: 700,
                }}
              >
                <User size={13} style={{ marginRight: '0.3rem' }} />
                <span>My Dashboard</span>
              </button>
            )}

            {activePlan && (
              <button
                id="btn-nav-workspace"
                onClick={onNavigateDashboard}
                className="btn-ghost"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  background: currentView === 'dashboard' ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : 'transparent',
                  color: currentView === 'dashboard' ? '#FFFFFF' : '#FED7AA',
                  fontWeight: 700,
                }}
              >
                <LayoutDashboard size={13} style={{ marginRight: '0.3rem' }} />
                <span>Workspace</span>
              </button>
            )}
          </div>

          {/* Center: Event Selector Dropdown & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(45, 24, 15, 0.95)',
                border: '1px solid rgba(251, 146, 60, 0.38)',
                borderRadius: 'var(--radius-full)',
                padding: '0.35rem 0.85rem',
                gap: '0.4rem',
              }}
            >
              <Layers size={15} color="#FB923C" />
              <select
                aria-label="Select Active Event Plan"
                value={activePlan?.id || ''}
                onChange={(e) => onSelectPlan(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '190px',
                }}
              >
                {plans.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    style={{ background: '#1c130d', color: '#fff7ed' }}
                  >
                    {p.basics.title} ({p.basics.eventType.toUpperCase()})
                  </option>
                ))}
              </select>
              <ChevronDown size={13} color="#FED7AA" />
            </div>

            <button
              id="btn-manage-plans"
              onClick={onOpenPlanManager}
              className="btn-secondary"
              title="Manage and list all saved plans (FR-28)"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            >
              <Layers size={13} />
              <span>Plans ({plans.length})</span>
            </button>

            <button
              id="btn-new-event"
              onClick={onOpenWizard}
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.825rem' }}
            >
              <PlusCircle size={15} />
              <span>New Event</span>
            </button>
          </div>

          {/* Right Actions: Option C Cloud Sync Pill & AI Copilot Drawer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {onOpenIndianIntelligence && (
              <button
                id="btn-nav-indian-intelligence"
                type="button"
                onClick={onOpenIndianIntelligence}
                className="btn-ghost"
                title="Indian Event Intelligence (Bharat Mode): Multi-day functions, pure veg/Jain catering & permits"
                style={{
                  padding: '0.38rem 0.75rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.2), rgba(19, 136, 8, 0.2))',
                  border: '1px solid rgba(251, 146, 60, 0.4)',
                  borderRadius: 'var(--radius-full)',
                  color: '#FED7AA',
                }}
              >
                <span>🇮🇳 {language === 'hi' ? 'शुभ विवाह (Bharat)' : 'Indian Wedding'}</span>
              </button>
            )}

            <button
              onClick={onOpenAuthModal}
              className="btn-ghost"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.78rem',
                background: currentUser ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 88, 12, 0.15)',
                border: currentUser ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(251, 146, 60, 0.35)',
                borderRadius: 'var(--radius-full)',
                color: currentUser ? '#4ADE80' : '#FED7AA',
                fontWeight: 600,
              }}
              title={currentUser ? `Signed in as ${currentUser.fullName}` : 'Guest mode (local storage) - click to sign in'}
            >
              {currentUser ? (
                <>
                  <CheckCircle size={13} color="#4ADE80" />
                  <span>{currentUser.fullName}</span>
                </>
              ) : (
                <>
                  <Cloud size={13} color="#FB923C" />
                  <span>Guest</span>
                </>
              )}
            </button>

            <button
              onClick={onToggleCopilot}
              className={`btn-primary ${isCopilotOpen ? 'pulse-glow' : ''}`}
              style={{
                padding: '0.42rem 0.9rem',
                fontSize: '0.825rem',
                background: isCopilotOpen
                  ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                  : 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
              }}
            >
              <Bot size={16} />
              <span>Copilot</span>
            </button>
          </div>
        </div>

        {/* MOBILE CONTROLS (Visible only on mobile via CSS) */}
        <div className="mobile-nav-toggle" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onToggleCopilot}
            className="btn-primary"
            style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
          >
            <Bot size={15} />
            <span>AI</span>
          </button>

          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn-secondary"
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              color: '#FED7AA',
              background: 'rgba(45, 24, 15, 0.9)',
              borderColor: 'rgba(251, 146, 60, 0.35)',
            }}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* MOBILE EXPANDED DRAWER MENU */}
      {isMobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            marginTop: '0.75rem',
            padding: '1rem',
            background: 'rgba(28, 16, 10, 0.98)',
            borderTop: '1px solid rgba(251, 146, 60, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          {/* View switcher for mobile */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleMobileNav(onNavigateHome)}
              className="btn-ghost"
              style={{
                flex: 1,
                padding: '0.5rem',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-sm)',
                background: currentView === 'home' ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
              }}
            >
              <Home size={14} style={{ marginRight: '0.3rem' }} />
              <span>Home</span>
            </button>

            {currentUser && onNavigateUserDashboard && (
              <button
                onClick={() => handleMobileNav(onNavigateUserDashboard)}
                className="btn-ghost"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  background: currentView === 'user-hub' ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'rgba(255,255,255,0.06)',
                  color: '#FFFFFF',
                }}
              >
                <User size={14} style={{ marginRight: '0.3rem' }} />
                <span>Dashboard</span>
              </button>
            )}

            {activePlan && (
              <button
                onClick={() => handleMobileNav(onNavigateDashboard)}
                className="btn-ghost"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-sm)',
                  background: currentView === 'dashboard' ? 'linear-gradient(135deg, #F97316, #EA580C)' : 'rgba(255,255,255,0.06)',
                  color: '#FFFFFF',
                }}
              >
                <LayoutDashboard size={14} style={{ marginRight: '0.3rem' }} />
                <span>Workspace</span>
              </button>
            )}
          </div>

          {/* Active Plan Selector on Mobile */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#FED7AA', fontWeight: 700, textTransform: 'uppercase' }}>
              Active Master Plan
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(45, 24, 15, 0.95)',
                border: '1px solid rgba(251, 146, 60, 0.38)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.5rem 0.75rem',
                gap: '0.5rem',
              }}
            >
              <Layers size={16} color="#FB923C" />
              <select
                aria-label="Select Active Event Plan"
                value={activePlan?.id || ''}
                onChange={(e) => {
                  onSelectPlan(e.target.value);
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  outline: 'none',
                  width: '100%',
                }}
              >
                {plans.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    style={{ background: '#1c130d', color: '#fff7ed' }}
                  >
                    {p.basics.title} ({p.basics.eventType.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action buttons on mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              onClick={() => handleMobileNav(onOpenWizard)}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              <PlusCircle size={16} />
              <span>New Event</span>
            </button>

            <button
              onClick={() => handleMobileNav(onOpenPlanManager)}
              className="btn-secondary"
              style={{ justifyContent: 'center', padding: '0.65rem', fontSize: '0.85rem' }}
            >
              <Layers size={16} />
              <span>Plans ({plans.length})</span>
            </button>
          </div>

          {/* Bharat Mode button on Mobile */}
          {onOpenIndianIntelligence && (
            <button
              onClick={() => handleMobileNav(onOpenIndianIntelligence)}
              className="btn-ghost"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.65rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, rgba(255, 153, 51, 0.2), rgba(19, 136, 8, 0.2))',
                border: '1px solid rgba(251, 146, 60, 0.4)',
                borderRadius: 'var(--radius-sm)',
                color: '#FED7AA',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>🇮🇳 {language === 'hi' ? 'भारतीय विवाह व इवेंट इंटेलिजेंस (शुभ विवाह)' : 'Plan Indian Wedding (शुभ विवाह)'}</span>
            </button>
          )}

          {/* Cloud Sync & Auth status on Mobile */}
          <button
            onClick={() => handleMobileNav(onOpenAuthModal)}
            className="btn-ghost"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.65rem',
              fontSize: '0.825rem',
              background: currentUser ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 88, 12, 0.15)',
              border: currentUser ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(251, 146, 60, 0.35)',
              borderRadius: 'var(--radius-sm)',
              color: currentUser ? '#4ADE80' : '#FED7AA',
              fontWeight: 700,
            }}
          >
            {currentUser ? (
              <>
                <CheckCircle size={15} color="#4ADE80" />
                <span>Signed in as {currentUser.fullName} (Cloud Synced)</span>
              </>
            ) : (
              <>
                <Cloud size={15} color="#FB923C" />
                <span>Guest Mode (Local) - Sign In / Sync Cloud</span>
              </>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
