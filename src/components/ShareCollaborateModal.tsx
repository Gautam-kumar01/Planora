import React, { useState, useEffect } from 'react';
import {
  Share2,
  X,
  Copy,
  Check,
  UserPlus,
  Users,
  Shield,
  Mail,
  Trash2,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
} from 'lucide-react';
import { EventPlan } from '../types';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'Budget Co-owner' | 'Logistics Lead' | 'Creative Lead' | 'Guest Coordinator' | 'Read-Only Reviewer';
  addedAt: string;
}

interface ShareCollaborateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
}

export const ShareCollaborateModal: React.FC<ShareCollaborateModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<Collaborator['role']>('Logistics Lead');

  const storageKey = `planora_collabs_${plan.id}`;

  // Load collaborators on open
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setCollaborators(JSON.parse(saved));
        } else {
          // Default co-planners based on event type
          const defaults: Collaborator[] = [
            {
              id: 'collab-1',
              name: 'Co-Host / Partner',
              email: 'cohost@planora.app',
              role: 'Budget Co-owner',
              addedAt: new Date().toLocaleDateString(),
            },
          ];
          setCollaborators(defaults);
          localStorage.setItem(storageKey, JSON.stringify(defaults));
        }
      } catch {}
    }
  }, [isOpen, plan.id, storageKey]);

  if (!isOpen) return null;

  const shareableUrl = `${window.location.origin}/?plan=${plan.id}&ref=share&readonly=true`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopySummary = () => {
    const summaryText = `🎉 ${plan.basics.title} — Master Plan Summary
• Event Type: ${plan.basics.eventType.toUpperCase()}
• Date: ${plan.basics.eventDate || 'Date Undecided (Flexible Schedule)'}
• Headcount: ${plan.basics.guestCount} Attendees
• Total Budget: ${plan.basics.currency} ${plan.budget.totalBudget.toLocaleString()}
• Key Theme: ${plan.themeConcept.title}
• Milestones: ${plan.timeline.reduce((acc, s) => acc + s.tasks.length, 0)} Tasks Scheduled
• Vendors: ${plan.vendors.length} Service Categories Tracked

View interactive plan: ${shareableUrl}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCollab: Collaborator = {
      id: `collab-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@collaborator.com`,
      role: newRole,
      addedAt: new Date().toLocaleDateString(),
    };

    const updated = [...collaborators, newCollab];
    setCollaborators(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewName('');
    setNewEmail('');
  };

  const handleRemoveCollaborator = (id: string) => {
    const updated = collaborators.filter((c) => c.id !== id);
    setCollaborators(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '640px',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(255, 255, 255, 0.98)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F97316, #F59E0B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
              }}
            >
              <Share2 size={20} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#140A05', fontWeight: 800 }}>
                Share & Collaborate
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#78533E', fontWeight: 600 }}>
                Co-Planning, Role Assignments & Read-Only Sharing
              </div>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem', color: '#78533E' }}>
            <X size={18} />
          </button>
        </div>

        {/* 1. Shareable Read-Only Link */}
        <div
          style={{
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1.1rem 1.25rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.45rem' }}>
            <LinkIcon size={16} color="#C2410C" />
            <strong style={{ fontSize: '0.85rem', color: '#9A3412', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Instant Read-Only Plan Link
            </strong>
          </div>
          <p style={{ fontSize: '0.825rem', color: '#4A2B1A', margin: '0 0 0.65rem', fontWeight: 500 }}>
            Anyone with this link can view the budget, schedule, and moodboard without modifying your master edits.
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              readOnly
              value={shareableUrl}
              className="glass-input"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                padding: '0.45rem 0.75rem',
                flex: 1,
                background: '#FFFFFF',
              }}
            />
            <button onClick={handleCopyLink} className="btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.825rem' }}>
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* 2. Collaborator Team Roster */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={17} color="#C2410C" />
              <h4 style={{ fontSize: '1rem', color: '#140A05', fontWeight: 800, margin: 0 }}>
                Collaborator Roster ({collaborators.length + 1})
              </h4>
            </div>
            <button
              onClick={handleCopySummary}
              className="btn-ghost"
              style={{ fontSize: '0.78rem', padding: '0.25rem 0.65rem', color: '#9A3412', fontWeight: 700 }}
            >
              {copiedSummary ? '✓ Copied Summary' : 'Copy Text Digest for Chat'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {/* Owner Row */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: '#FFFFFF',
                border: '1px solid rgba(234, 88, 12, 0.2)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#140A05', fontSize: '0.875rem' }}>You (Event Host & Primary Owner)</div>
                <div style={{ fontSize: '0.75rem', color: '#78533E' }}>Master Administrator • Full Editing Rights</div>
              </div>
              <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                Owner
              </span>
            </div>

            {/* Collaborator Rows */}
            {collaborators.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  background: '#FFFFFF',
                  border: '1px solid rgba(234, 88, 12, 0.15)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#140A05', fontSize: '0.875rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#78533E' }}>
                    {c.email} • Added {c.addedAt}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span
                    className="badge"
                    style={{
                      fontSize: '0.7rem',
                      background: 'rgba(234, 88, 12, 0.1)',
                      color: '#9A3412',
                      border: '1px solid rgba(234, 88, 12, 0.25)',
                      fontWeight: 700,
                    }}
                  >
                    {c.role}
                  </span>
                  <button
                    onClick={() => handleRemoveCollaborator(c.id)}
                    className="btn-ghost"
                    style={{ color: '#ef4444', padding: '0.3rem' }}
                    title="Remove Collaborator"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Invite New Collaborator Form */}
        <div style={{ borderTop: '1px solid rgba(234, 88, 12, 0.15)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.95rem', color: '#140A05', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <UserPlus size={16} color="#C2410C" />
            <span>Invite Co-Planner</span>
          </h4>

          <form onSubmit={handleAddCollaborator} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#140A05', marginBottom: '0.25rem' }}>
                Name
              </label>
              <input
                type="text"
                placeholder="e.g. Arjun or Elena"
                className="glass-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#140A05', marginBottom: '0.25rem' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="colleague@example.com"
                className="glass-input"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: '#140A05', marginBottom: '0.25rem' }}>
                Assigned Role
              </label>
              <select
                value={newRole}
                onChange={(e: any) => setNewRole(e.target.value)}
                className="glass-input"
                style={{ fontSize: '0.825rem', padding: '0.45rem 0.65rem' }}
              >
                <option value="Budget Co-owner">Budget Co-owner</option>
                <option value="Logistics Lead">Logistics & Venue Lead</option>
                <option value="Creative Lead">Creative & Decor Lead</option>
                <option value="Guest Coordinator">Guest & RSVP Lead</option>
                <option value="Read-Only Reviewer">Read-Only Reviewer</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.45rem', fontSize: '0.825rem' }}>
                <UserPlus size={14} />
                <span>Add Team Member</span>
              </button>
            </div>
          </form>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button onClick={onClose} className="btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
