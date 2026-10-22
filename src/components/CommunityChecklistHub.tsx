import React, { useState } from 'react';
import {
  Megaphone,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Trash2,
  ShieldAlert,
  Users,
  FileCheck,
  HeartHandshake,
  CloudSun,
  AlertOctagon,
  Home,
  MessageSquare,
} from 'lucide-react';
import { EventPlan, CommunityChecklistItem } from '../types';
import { generateDefaultCommunityChecklist } from '../utils/deterministicMath';

interface CommunityChecklistHubProps {
  plan: EventPlan;
  onUpdateChecklist: (items: CommunityChecklistItem[]) => void;
}

export const CommunityChecklistHub: React.FC<CommunityChecklistHubProps> = ({
  plan,
  onUpdateChecklist,
}) => {
  const items: CommunityChecklistItem[] =
    plan.communityChecklist && plan.communityChecklist.length > 0
      ? plan.communityChecklist
      : generateDefaultCommunityChecklist(plan.basics.title);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<CommunityChecklistItem['category']>('Permits');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Status counters
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const neededCount = items.filter((i) => i.status === 'needed').length;
  const notNeededCount = items.filter((i) => i.status === 'not_needed').length;

  const handleStatusChange = (id: string, newStatus: 'needed' | 'completed' | 'not_needed') => {
    const updated = items.map((i) => (i.id === id ? { ...i, status: newStatus } : i));
    onUpdateChecklist(updated);
  };

  const handleNotesChange = (id: string, notes: string) => {
    const updated = items.map((i) => (i.id === id ? { ...i, notes } : i));
    onUpdateChecklist(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    onUpdateChecklist(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newItem: CommunityChecklistItem = {
      id: `comm-chk-custom-${Date.now()}`,
      category: newItemCategory,
      title: newItemTitle.trim(),
      description: newItemDesc.trim() || 'Custom community planning coordination task.',
      status: 'needed',
    };

    onUpdateChecklist([newItem, ...items]);
    setNewItemTitle('');
    setNewItemDesc('');
    setIsAddingItem(false);
  };

  const categories: Array<CommunityChecklistItem['category']> = [
    'Permits',
    'Volunteers',
    'Accessibility',
    'Sanitation & Waste',
    'Weather & Contingency',
    'Safety & First Aid',
    'Neighborhood Coordination',
  ];

  const filteredItems = items.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Permits':
        return <FileCheck size={16} color="#C2410C" />;
      case 'Volunteers':
        return <Users size={16} color="#D97706" />;
      case 'Accessibility':
        return <HeartHandshake size={16} color="#15803D" />;
      case 'Sanitation & Waste':
        return <Trash2 size={16} color="#4B5563" />;
      case 'Weather & Contingency':
        return <CloudSun size={16} color="#2563EB" />;
      case 'Safety & First Aid':
        return <AlertOctagon size={16} color="#DC2626" />;
      case 'Neighborhood Coordination':
        return <Home size={16} color="#9333EA" />;
      default:
        return <ShieldAlert size={16} color="#C2410C" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem 2rem',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(254, 243, 199, 0.45))',
          border: '1.5px solid rgba(234, 88, 12, 0.28)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Megaphone size={18} color="#C2410C" />
              <span className="badge badge-orange">Community Ops & Permits</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', color: '#140A05', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
              Community Event Coordination Checklist
            </h2>
            <p style={{ color: '#2C1810', fontSize: '0.9rem', marginTop: '0.35rem', maxWidth: '750px', lineHeight: 1.6, fontWeight: 500 }}>
              Tailored for neighborhood gatherings, cleanups, fundraisers, and cultural festivals. Mark optional or non-applicable items <strong>“Not needed”</strong> to keep your coordination clean.
            </p>
          </div>

          <button
            id="btn-add-community-item"
            type="button"
            onClick={() => setIsAddingItem(!isAddingItem)}
            className="btn-primary"
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={15} />
            <span>{isAddingItem ? 'Close Form' : 'Add Custom Item'}</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.85rem' }}>
          <div style={{ background: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.2)' }}>
            <div style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 600 }}>Total Checklist</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#140A05' }}>{totalCount}</div>
          </div>
          <div style={{ background: 'rgba(34, 197, 94, 0.08)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700 }}>✓ Completed</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#15803D' }}>{completedCount}</div>
          </div>
          <div style={{ background: 'rgba(234, 88, 12, 0.08)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 700 }}>⏳ Needed Action</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#C2410C' }}>{neededCount}</div>
          </div>
          <div style={{ background: 'rgba(156, 163, 175, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(156, 163, 175, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: 600 }}>⚪ Not Needed</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#4B5563' }}>{notNeededCount}</div>
          </div>
        </div>
      </div>

      {/* Add Custom Item Modal / Form */}
      {isAddingItem && (
        <form
          onSubmit={handleAddItem}
          className="glass-panel"
          style={{
            padding: '1.5rem',
            background: '#FFFFFF',
            border: '1.5px solid rgba(234, 88, 12, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#140A05' }}>Add Community Checklist Item</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.35rem' }}>
                Item Title *
              </label>
              <input
                type="text"
                required
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder="e.g. City Sound Amplification Permit"
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.35rem' }}>
                Category
              </label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.35rem' }}>
              Description & Requirements
            </label>
            <input
              type="text"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              placeholder="e.g. Submit paperwork to Parks Department at least 30 days prior"
              style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setIsAddingItem(false)} className="btn-secondary" style={{ padding: '0.45rem 1rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '0.45rem 1.25rem' }}>
              Add to Checklist
            </button>
          </div>
        </form>
      )}

      {/* Category Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#573523' }}>Filter by:</span>
        <button
          type="button"
          onClick={() => setCategoryFilter('all')}
          className={categoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem' }}
        >
          All Items ({totalCount})
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={categoryFilter === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              {getCategoryIcon(cat)}
              <span>
                {cat} ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredItems.map((item) => {
          const isCompleted = item.status === 'completed';
          const isNotNeeded = item.status === 'not_needed';

          return (
            <div
              key={item.id}
              className="glass-panel"
              style={{
                padding: '1.15rem 1.4rem',
                background: isNotNeeded
                  ? 'rgba(243, 244, 246, 0.7)'
                  : isCompleted
                  ? 'rgba(240, 253, 244, 0.85)'
                  : '#FFFFFF',
                border: isCompleted
                  ? '1.5px solid rgba(34, 197, 94, 0.4)'
                  : isNotNeeded
                  ? '1px solid rgba(209, 213, 219, 0.6)'
                  : '1.5px solid rgba(234, 88, 12, 0.22)',
                boxShadow: '0 2px 8px rgba(45, 24, 15, 0.04)',
                opacity: isNotNeeded ? 0.68 : 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div style={{ flex: '1 1 350px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span
                      className="badge"
                      style={{
                        background: 'rgba(234, 88, 12, 0.08)',
                        color: '#9A3412',
                        border: '1px solid rgba(234, 88, 12, 0.2)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      {getCategoryIcon(item.category)}
                      <span>{item.category}</span>
                    </span>

                    {isCompleted && (
                      <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#15803D', fontSize: '0.7rem', fontWeight: 700 }}>
                        ✓ Completed
                      </span>
                    )}

                    {isNotNeeded && (
                      <span className="badge" style={{ background: 'rgba(156, 163, 175, 0.15)', color: '#4B5563', fontSize: '0.7rem', fontWeight: 600 }}>
                        Marked Not Needed
                      </span>
                    )}
                  </div>

                  <h4
                    style={{
                      margin: '0 0 0.3rem 0',
                      fontSize: '1.05rem',
                      fontWeight: 800,
                      color: isNotNeeded ? '#6B7280' : '#140A05',
                      textDecoration: isNotNeeded ? 'line-through' : 'none',
                    }}
                  >
                    {item.title}
                  </h4>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: isNotNeeded ? '#9CA3AF' : '#573523',
                      lineHeight: 1.5,
                      fontWeight: 500,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* Status Selector Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'completed')}
                    title="Mark this item completed"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: isCompleted ? '1.5px solid #16A34A' : '1px solid rgba(34, 197, 94, 0.3)',
                      background: isCompleted ? '#16A34A' : 'rgba(34, 197, 94, 0.08)',
                      color: isCompleted ? '#FFFFFF' : '#15803D',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Completed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'needed')}
                    title="Mark as needed action"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: item.status === 'needed' ? '1.5px solid #EA580C' : '1px solid rgba(234, 88, 12, 0.3)',
                      background: item.status === 'needed' ? '#EA580C' : 'rgba(234, 88, 12, 0.08)',
                      color: item.status === 'needed' ? '#FFFFFF' : '#9A3412',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Clock size={13} />
                    <span>Needed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStatusChange(item.id, 'not_needed')}
                    title="Mark this requirement not needed for this event"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.78rem',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: isNotNeeded ? '1.5px solid #6B7280' : '1px solid rgba(156, 163, 175, 0.35)',
                      background: isNotNeeded ? '#6B7280' : 'rgba(156, 163, 175, 0.08)',
                      color: isNotNeeded ? '#FFFFFF' : '#4B5563',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <XCircle size={13} />
                    <span>Not needed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingNotesId(editingNotesId === item.id ? null : item.id)}
                    className="btn-ghost"
                    title="Add coordination notes or reference permit number"
                    style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem', color: '#78533E' }}
                  >
                    <MessageSquare size={14} />
                  </button>

                  {item.id.startsWith('comm-chk-custom-') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="btn-ghost"
                      title="Remove custom item"
                      style={{ padding: '0.35rem', color: '#DC2626' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Notes Field (Always visible if notes exist or if opened) */}
              {(editingNotesId === item.id || item.notes) && (
                <div style={{ marginTop: '0.25rem' }}>
                  <input
                    type="text"
                    value={item.notes || ''}
                    onChange={(e) => handleNotesChange(item.id, e.target.value)}
                    placeholder="Add notes, permit tracking #, volunteer lead name, or contact details..."
                    style={{
                      width: '100%',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid rgba(234, 88, 12, 0.25)',
                      background: '#FFFFFF',
                      color: '#140A05',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
