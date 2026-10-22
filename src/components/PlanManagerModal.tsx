import React, { useState } from 'react';
import {
  Layers,
  X,
  Trash2,
  Copy,
  Edit2,
  Check,
  Calendar,
  Users,
  DollarSign,
  Download,
  Clock,
  Sparkles,
  ShieldCheck,
  Cloud,
} from 'lucide-react';
import { EventPlan } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

interface PlanManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: EventPlan[];
  activePlanId: string;
  onSelectPlan: (id: string) => void;
  onRenamePlan: (id: string, newTitle: string) => void;
  onDuplicatePlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
}

export const PlanManagerModal: React.FC<PlanManagerModalProps> = ({
  isOpen,
  onClose,
  plans,
  activePlanId,
  onSelectPlan,
  onRenamePlan,
  onDuplicatePlan,
  onDeletePlan,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState<string>('');

  if (!isOpen) return null;

  const startRename = (plan: EventPlan) => {
    setEditingId(plan.id);
    setEditTitleValue(plan.basics.title);
  };

  const saveRename = (id: string) => {
    if (editTitleValue.trim()) {
      onRenamePlan(id, editTitleValue.trim());
    }
    setEditingId(null);
  };

  const exportPlanJSON = (plan: EventPlan) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${plan.basics.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Recently';
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ padding: '2rem', maxWidth: '640px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', margin: 0, color: '#140A05', fontWeight: 800 }}>
                Plan Manager & Saved Plans
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#4A2B1A', margin: '0.2rem 0 0 0', fontWeight: 500 }}>
                Manage, rename, clone, and export your event master plans (FR-28, FR-31)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Persistence Notice (Section 20) */}
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(234, 88, 12, 0.08)',
            border: '1px solid rgba(251, 146, 60, 0.25)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#111' }}>
            <ShieldCheck size={16} color="var(--color-orange-600)" />
            <span>Saved locally in browser. Zero risk of session loss.</span>
          </div>
          <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
            {plans.length} Total Plans
          </span>
        </div>

        {/* Plans List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '55vh', overflowY: 'auto' }}>
          {plans.map((p) => {
            const isActive = p.id === activePlanId;
            const isEditing = editingId === p.id;

            return (
              <div
                key={p.id}
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.88)',
                  border: isActive ? '2px solid var(--color-orange-500)' : '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem 1.25rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 18px rgba(234, 88, 12, 0.18)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{ flex: '1 1 auto' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="glass-input"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.95rem', fontWeight: 600 }}
                          value={editTitleValue}
                          onChange={(e) => setEditTitleValue(e.target.value)}
                        />
                        <button onClick={() => saveRename(p.id)} className="btn-primary" style={{ padding: '0.3rem 0.6rem' }}>
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111' }}>
                          {p.basics.title}
                        </span>
                        {isActive && (
                          <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>
                            Active
                          </span>
                        )}
                        <button
                          onClick={() => startRename(p)}
                          className="btn-ghost"
                          style={{ padding: '0.2rem', color: '#666' }}
                          title="Rename Plan"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.78rem', color: '#555', flexWrap: 'wrap' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--color-orange-700)' }}>
                        {p.basics.eventType}
                      </span>
                      <span>•</span>
                      <span>{p.basics.guestCount} Guests</span>
                      <span>•</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>
                        {formatCurrency(p.budget.totalBudget, p.budget.currency)}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#777' }}>
                        <Clock size={12} />
                        <span>Saved {formatRelativeTime(p.updatedAt)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Button Group */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {!isActive && (
                      <button
                        onClick={() => {
                          onSelectPlan(p.id);
                          onClose();
                        }}
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
                      >
                        Open
                      </button>
                    )}

                    <button
                      onClick={() => onDuplicatePlan(p.id)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem', color: '#555' }}
                      title="Duplicate Plan"
                    >
                      <Copy size={15} />
                    </button>

                    <button
                      onClick={() => exportPlanJSON(p)}
                      className="btn-ghost"
                      style={{ padding: '0.35rem', color: '#555' }}
                      title="Export Backup JSON"
                    >
                      <Download size={15} />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${p.basics.title}"?`)) {
                          onDeletePlan(p.id);
                        }
                      }}
                      className="btn-ghost"
                      style={{ padding: '0.35rem', color: '#dc2626' }}
                      title="Delete Plan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
