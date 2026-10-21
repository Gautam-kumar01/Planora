import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Clock,
  UserX,
  Plus,
  Trash2,
  Utensils,
  Copy,
  Check,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Edit2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { EventPlan, GuestItem, TableItem, RsvpStatus, DietaryType } from '../types';

interface GuestSeatingHubProps {
  plan: EventPlan;
  onUpdateGuests: (updatedGuests: GuestItem[]) => void;
  onUpdateTables: (updatedTables: TableItem[]) => void;
}

const DEFAULT_TABLES: TableItem[] = [
  { id: 'tbl-1', name: 'Head Table / VIP', capacity: 8, shape: 'rectangle' },
  { id: 'tbl-2', name: 'Table 1 (Family)', capacity: 8, shape: 'round' },
  { id: 'tbl-3', name: 'Table 2 (Close Friends)', capacity: 8, shape: 'round' },
  { id: 'tbl-4', name: 'Table 3 (Colleagues & Peers)', capacity: 8, shape: 'round' },
  { id: 'tbl-5', name: 'Table 4 (Out-of-Town Guests)', capacity: 8, shape: 'round' },
];

const DEFAULT_GUESTS: GuestItem[] = [
  { id: 'g-1', name: 'Priya Sharma (Host)', email: 'priya@example.com', rsvpStatus: 'attending', plusOnes: 0, dietary: 'Vegetarian', tableId: 'tbl-1', notes: 'Primary Host' },
  { id: 'g-2', name: 'Arjun Patel (Host)', email: 'arjun@example.com', rsvpStatus: 'attending', plusOnes: 0, dietary: 'None', tableId: 'tbl-1', notes: 'Co-Host' },
  { id: 'g-3', name: 'Ananya Sharma', email: 'ananya@example.com', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Vegan', tableId: 'tbl-1', notes: 'Speech at 7:30 PM' },
  { id: 'g-4', name: 'Dev Patel', email: 'dev@example.com', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Halal', tableId: 'tbl-1', notes: 'Key toast' },
  { id: 'g-5', name: 'Rajesh & Sunita Sharma', email: 'rajesh.sharma@example.com', rsvpStatus: 'attending', plusOnes: 0, dietary: 'Vegetarian', tableId: 'tbl-2', notes: 'Parents' },
  { id: 'g-6', name: 'Vikram & Meera Patel', email: 'vikram.patel@example.com', rsvpStatus: 'attending', plusOnes: 0, dietary: 'None', tableId: 'tbl-2', notes: 'Parents' },
  { id: 'g-7', name: 'Kavita Rao', email: 'kavita@example.com', rsvpStatus: 'attending', plusOnes: 0, dietary: 'Gluten-Free', tableId: 'tbl-3', notes: 'College friend' },
  { id: 'g-8', name: 'Marcus Vance', email: 'marcus@example.com', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Nut Allergy', tableId: 'tbl-3', notes: 'Severe peanut allergy' },
  { id: 'g-9', name: 'Siddharth Mehta', email: 'sid@example.com', rsvpStatus: 'pending', plusOnes: 1, dietary: 'None', tableId: 'tbl-4', notes: 'Awaiting RSVP link reply' },
  { id: 'g-10', name: 'Chloe Dubois', email: 'chloe@example.com', rsvpStatus: 'pending', plusOnes: 0, dietary: 'Vegetarian', tableId: 'tbl-4', notes: 'Invited via email' },
  { id: 'g-11', name: 'David Zhang', email: 'david@example.com', rsvpStatus: 'declined', plusOnes: 0, dietary: 'None', notes: 'Traveling abroad' },
];

const DIETARY_OPTIONS: DietaryType[] = [
  'None',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Halal',
  'Kosher',
  'Nut Allergy',
  'Dairy-Free',
];

export const GuestSeatingHub: React.FC<GuestSeatingHubProps> = ({
  plan,
  onUpdateGuests,
  onUpdateTables,
}) => {
  const guests = plan.guests && plan.guests.length > 0 ? plan.guests : DEFAULT_GUESTS;
  const tables = plan.tables && plan.tables.length > 0 ? plan.tables : DEFAULT_TABLES;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRsvp, setFilterRsvp] = useState<'all' | RsvpStatus>('all');
  const [dietaryCopied, setDietaryCopied] = useState(false);

  // New Guest Form State
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestRsvp, setNewGuestRsvp] = useState<RsvpStatus>('pending');
  const [newGuestPlusOnes, setNewGuestPlusOnes] = useState(0);
  const [newGuestDietary, setNewGuestDietary] = useState<DietaryType>('None');
  const [newGuestTable, setNewGuestTable] = useState<string>('');
  const [newGuestNotes, setNewGuestNotes] = useState('');

  // New Table Form State
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(8);
  const [newTableShape, setNewTableShape] = useState<'round' | 'rectangle'>('round');

  // RSVP Metric Calculations
  const attendingGuests = guests.filter((g) => g.rsvpStatus === 'attending');
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'pending');
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'declined');

  const totalConfirmedHeadcount = attendingGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
  const totalPendingHeadcount = pendingGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);

  // Dietary Aggregation
  const dietaryCounts: Record<string, number> = {};
  attendingGuests.forEach((g) => {
    const diet = g.dietary || 'None';
    const totalPeople = 1 + (g.plusOnes || 0);
    dietaryCounts[diet] = (dietaryCounts[diet] || 0) + totalPeople;
  });

  // Copy Dietary Manifest for Caterer
  const handleCopyDietaryManifest = () => {
    let manifest = `📋 DIETARY & CATERING MANIFEST — ${plan.basics.title.toUpperCase()}\n`;
    manifest += `Total Confirmed Attendees: ${totalConfirmedHeadcount} guests\n`;
    manifest += `Event Date: ${plan.basics.eventDate || 'Flexible'}\n`;
    manifest += `----------------------------------------------------\n`;
    manifest += `MEAL BREAKDOWN BY DIETARY REQUIREMENT:\n`;
    Object.entries(dietaryCounts).forEach(([diet, count]) => {
      manifest += `• ${diet}: ${count} meals\n`;
    });
    manifest += `----------------------------------------------------\n`;
    manifest += `SPECIAL ALLERGY & HEALTH WARNINGS:\n`;
    const allergyGuests = attendingGuests.filter((g) => g.dietary.toLowerCase().includes('nut') || g.dietary.toLowerCase().includes('allergy') || g.notes?.toLowerCase().includes('allergy'));
    if (allergyGuests.length > 0) {
      allergyGuests.forEach((g) => {
        manifest += `⚠️ ${g.name}: ${g.dietary} (${g.notes || 'Strict allergy'})\n`;
      });
    } else {
      manifest += `No life-threatening allergies reported to date.\n`;
    }

    navigator.clipboard.writeText(manifest);
    setDietaryCopied(true);
    setTimeout(() => setDietaryCopied(false), 2200);
  };

  // Add Guest Handler
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;

    const newGuest: GuestItem = {
      id: `g-${Date.now()}`,
      name: newGuestName.trim(),
      email: newGuestEmail.trim() || undefined,
      rsvpStatus: newGuestRsvp,
      plusOnes: newGuestPlusOnes,
      dietary: newGuestDietary,
      tableId: newGuestTable || undefined,
      notes: newGuestNotes.trim() || undefined,
    };

    const updated = [...guests, newGuest];
    onUpdateGuests(updated);

    // Reset Form
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestPlusOnes(0);
    setNewGuestDietary('None');
    setNewGuestTable('');
    setNewGuestNotes('');
    setShowAddGuestModal(false);
  };

  // Delete Guest Handler
  const handleDeleteGuest = (id: string) => {
    const updated = guests.filter((g) => g.id !== id);
    onUpdateGuests(updated);
  };

  // Quick Inline Status Update
  const handleStatusChange = (id: string, status: RsvpStatus) => {
    const updated = guests.map((g) => (g.id === id ? { ...g, rsvpStatus: status } : g));
    onUpdateGuests(updated);
  };

  // Quick Inline Table Assignment
  const handleTableChange = (id: string, tableId: string) => {
    const updated = guests.map((g) => (g.id === id ? { ...g, tableId: tableId || undefined } : g));
    onUpdateGuests(updated);
  };

  // 1-Click Auto-Arrange Seating by Group & Affiliation
  const handleAutoArrangeSeating = () => {
    const unseated = guests.filter((g) => !g.tableId && g.rsvpStatus !== 'declined');
    if (unseated.length === 0) return;

    // Track current table seat counts
    const tableSeats: Record<string, number> = {};
    tables.forEach((t) => {
      tableSeats[t.id] = guests
        .filter((g) => g.tableId === t.id)
        .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
    });

    const updatedGuests = [...guests];

    unseated.forEach((guest) => {
      const neededSeats = 1 + (guest.plusOnes || 0);
      const guestText = `${guest.name} ${guest.notes || ''}`.toLowerCase();

      // Find best table match by relationship keywords
      let targetTable = tables.find((t) => {
        const remaining = t.capacity - (tableSeats[t.id] || 0);
        if (remaining < neededSeats) return false;

        const tableText = t.name.toLowerCase();
        if (guestText.includes('vip') || guestText.includes('host') || guestText.includes('toast')) {
          return tableText.includes('vip') || tableText.includes('head');
        }
        if (guestText.includes('family') || guestText.includes('sharma') || guestText.includes('patel') || guestText.includes('parent')) {
          return tableText.includes('family') || tableText.includes('table 1');
        }
        if (guestText.includes('friend') || guestText.includes('college')) {
          return tableText.includes('friend') || tableText.includes('table 2');
        }
        if (guestText.includes('colleague') || guestText.includes('peer') || guestText.includes('work')) {
          return tableText.includes('colleague') || tableText.includes('table 3');
        }
        return false;
      });

      // Fallback to any table with enough seats
      if (!targetTable) {
        targetTable = tables.find((t) => (t.capacity - (tableSeats[t.id] || 0)) >= neededSeats);
      }

      if (targetTable) {
        tableSeats[targetTable.id] = (tableSeats[targetTable.id] || 0) + neededSeats;
        const idx = updatedGuests.findIndex((g) => g.id === guest.id);
        if (idx !== -1) {
          updatedGuests[idx] = { ...guest, tableId: targetTable.id };
        }
      }
    });

    onUpdateGuests(updatedGuests);
  };

  // Add Table Handler
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const newTable: TableItem = {
      id: `tbl-${Date.now()}`,
      name: newTableName.trim(),
      capacity: newTableCapacity,
      shape: newTableShape,
    };

    const updated = [...tables, newTable];
    onUpdateTables(updated);
    setNewTableName('');
    setNewTableCapacity(8);
    setShowAddTableModal(false);
  };

  // Delete Table Handler
  const handleDeleteTable = (id: string) => {
    const updatedTables = tables.filter((t) => t.id !== id);
    const updatedGuests = guests.map((g) => (g.tableId === id ? { ...g, tableId: undefined } : g));
    onUpdateTables(updatedTables);
    onUpdateGuests(updatedGuests);
  };

  // Filtered Guests
  const filteredGuests = guests.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.email && g.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (g.dietary && g.dietary.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterRsvp === 'all' || g.rsvpStatus === filterRsvp;

    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* 1. RSVP Summary Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {/* Metric 1: Confirmed Attending */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D' }}>CONFIRMED ATTENDING</span>
            <UserCheck size={18} color="#15803D" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#140A05', fontFamily: 'var(--font-mono)' }}>
            {totalConfirmedHeadcount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#573523', marginTop: '0.2rem' }}>
            {attendingGuests.length} primary guests + {totalConfirmedHeadcount - attendingGuests.length} plus-ones
          </div>
        </div>

        {/* Metric 2: Pending Responses */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B45309' }}>AWAITING RSVP</span>
            <Clock size={18} color="#B45309" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#140A05', fontFamily: 'var(--font-mono)' }}>
            {totalPendingHeadcount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#573523', marginTop: '0.2rem' }}>
            {pendingGuests.length} invitations pending response
          </div>
        </div>

        {/* Metric 3: Regrets / Declined */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#B91C1C' }}>DECLINED / REGRETS</span>
            <UserX size={18} color="#B91C1C" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#140A05', fontFamily: 'var(--font-mono)' }}>
            {declinedGuests.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#573523', marginTop: '0.2rem' }}>
            Seat capacity freed for backup invites
          </div>
        </div>

        {/* Metric 4: Total Target vs RSVP Progress */}
        <div
          className="glass-card"
          style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1.5px solid rgba(234, 88, 12, 0.25)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C2410C' }}>TARGET CAPACITY</span>
            <Users size={18} color="#C2410C" />
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#140A05', fontFamily: 'var(--font-mono)' }}>
            {plan.basics.guestCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#573523', marginTop: '0.2rem' }}>
            {Math.round((totalConfirmedHeadcount / Math.max(1, plan.basics.guestCount)) * 100)}% confirmed of target headcount
          </div>
        </div>
      </div>

      {/* 2. Dietary Restrictions & Caterer Manifest */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(234, 88, 12, 0.2)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #F97316, #F59E0B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Utensils size={18} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                Caterer Dietary Summary & Allergy Manifest
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#78533E', margin: '0.15rem 0 0 0' }}>
                Auto-aggregated meal counts ready for caterer transmission
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyDietaryManifest}
            className="btn-primary"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            {dietaryCopied ? <Check size={15} color="#fff" /> : <Copy size={15} />}
            <span>{dietaryCopied ? 'Copied Manifest for Caterer!' : 'Copy Dietary Summary for Caterer'}</span>
          </button>
        </div>

        {/* Dietary Pills Grid */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
          {Object.entries(dietaryCounts).map(([diet, count]) => {
            const isAlert = diet.toLowerCase().includes('nut') || diet.toLowerCase().includes('allergy');
            return (
              <div
                key={diet}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  background: isAlert ? 'rgba(254, 242, 242, 0.95)' : 'rgba(234, 88, 12, 0.08)',
                  border: isAlert ? '1px solid #ef4444' : '1px solid rgba(234, 88, 12, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                }}
              >
                {isAlert && <AlertTriangle size={14} color="#dc2626" />}
                <span style={{ fontWeight: 700, color: isAlert ? '#b91c1c' : '#140A05' }}>{diet}:</span>
                <span style={{ fontWeight: 800, color: '#C2410C', fontFamily: 'var(--font-mono)' }}>
                  {count} meals
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Table Seating Arrangement Studio */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(234, 88, 12, 0.2)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #EA580C, #9A3412)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={18} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                Interactive Table Seating Studio
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#78533E', margin: '0.15rem 0 0 0' }}>
                Organize banquet and reception tables with real-time capacity meters
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleAutoArrangeSeating}
              className="btn-primary pulse-glow"
              style={{
                padding: '0.45rem 0.95rem',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Sparkles size={14} />
              <span>Auto-Seat by Group ✨</span>
            </button>

            <button
              onClick={() => setShowAddTableModal(true)}
              className="btn-secondary"
              style={{
                padding: '0.45rem 0.9rem',
                fontSize: '0.825rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#FFFFFF',
              }}
            >
              <Plus size={15} />
              <span>+ Add Banquet Table</span>
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {tables.map((table) => {
            const seatedGuests = guests.filter((g) => g.tableId === table.id && g.rsvpStatus === 'attending');
            const totalSeatedCount = seatedGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);
            const isFull = totalSeatedCount >= table.capacity;
            const isOver = totalSeatedCount > table.capacity;

            return (
              <div
                key={table.id}
                style={{
                  background: '#FFFFFF',
                  border: isOver ? '1.5px solid #ef4444' : isFull ? '1.5px solid #22c55e' : '1px solid rgba(234, 88, 12, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  boxShadow: '0 2px 8px rgba(45, 24, 15, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#140A05', fontSize: '0.95rem' }}>
                      {table.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78533E' }}>
                      {table.shape === 'round' ? '⭕ Round Banquet' : '▭ Rectangular'} • Max {table.capacity} Seats
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="btn-ghost"
                    style={{ padding: '0.25rem', color: '#ef4444' }}
                    title="Delete Table"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Capacity Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                    <span style={{ color: isOver ? '#b91c1c' : '#573523' }}>
                      {totalSeatedCount} / {table.capacity} Seats Assigned
                    </span>
                    <span style={{ color: isOver ? '#b91c1c' : isFull ? '#15803D' : '#C2410C' }}>
                      {isOver ? '⚠️ Overbooked' : isFull ? '✓ Full' : `${table.capacity - totalSeatedCount} spots open`}
                    </span>
                  </div>

                  <div style={{ height: '6px', background: 'rgba(234, 88, 12, 0.12)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (totalSeatedCount / table.capacity) * 100)}%`,
                        background: isOver ? '#ef4444' : isFull ? '#22c55e' : 'linear-gradient(135deg, #F97316, #F59E0B)',
                        borderRadius: '99px',
                      }}
                    />
                  </div>
                </div>

                {/* Seated Guests List */}
                <div style={{ minHeight: '60px', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {seatedGuests.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      No guests assigned yet
                    </div>
                  ) : (
                    seatedGuests.map((g) => (
                      <div
                        key={g.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8rem',
                          background: 'rgba(234, 88, 12, 0.05)',
                          padding: '0.3rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#140A05' }}>
                          {g.name} {g.plusOnes > 0 && `(+${g.plusOnes})`}
                        </span>
                        <button
                          onClick={() => handleTableChange(g.id, '')}
                          className="btn-ghost"
                          style={{ padding: '0.1rem 0.3rem', fontSize: '0.7rem', color: '#78533E' }}
                          title="Unassign from table"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Table Dietary & Allergy Flag */}
                {seatedGuests.some((g) => g.dietary && g.dietary !== 'None') && (
                  <div
                    style={{
                      marginTop: '0.35rem',
                      padding: '0.35rem 0.6rem',
                      background: 'rgba(254, 243, 199, 0.75)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.72rem',
                      color: '#92400E',
                      fontWeight: 600,
                    }}
                  >
                    <Utensils size={12} color="#D97706" style={{ flexShrink: 0 }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Catering: {seatedGuests.filter((g) => g.dietary && g.dietary !== 'None').map((g) => `${g.name.split(' ')[0]} (${g.dietary})`).join(', ')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Guest Roster Management Table */}
      <div
        className="glass-panel"
        style={{
          padding: '1.5rem',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(234, 88, 12, 0.2)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
              Master Guest List ({filteredGuests.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#78533E', margin: '0.2rem 0 0 0' }}>
              Manage RSVPs, plus-ones, dietary requirements, and table assignments
            </p>
          </div>

          <button
            onClick={() => setShowAddGuestModal(true)}
            className="btn-primary"
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <Plus size={16} />
            <span>+ Add New Guest</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* RSVP Status Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', background: 'rgba(234, 88, 12, 0.08)', padding: '0.2rem', borderRadius: 'var(--radius-full)' }}>
            {(['all', 'attending', 'pending', 'declined'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setFilterRsvp(st)}
                className="btn-ghost"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  background: filterRsvp === st ? 'linear-gradient(135deg, #F97316, #F59E0B)' : 'transparent',
                  color: filterRsvp === st ? '#FFFFFF' : '#140A05',
                }}
              >
                {st === 'all' ? `All (${guests.length})` : `${st} (${guests.filter((g) => g.rsvpStatus === st).length})`}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} color="#78533E" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              placeholder="Search by name, diet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '32px', fontSize: '0.825rem', width: '100%' }}
            />
          </div>
        </div>

        {/* Guest Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(234, 88, 12, 0.2)', color: '#78533E' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Guest Name</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>RSVP Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Plus-Ones</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Dietary / Allergies</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Seating Table</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id} style={{ borderBottom: '1px solid rgba(234, 88, 12, 0.1)' }}>
                  {/* Name & Contact */}
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <div style={{ fontWeight: 700, color: '#140A05' }}>{guest.name}</div>
                    {guest.email && <div style={{ fontSize: '0.75rem', color: '#78533E' }}>{guest.email}</div>}
                  </td>

                  {/* RSVP Dropdown */}
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <select
                      value={guest.rsvpStatus}
                      onChange={(e) => handleStatusChange(guest.id, e.target.value as RsvpStatus)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        borderRadius: 'var(--radius-sm)',
                        background:
                          guest.rsvpStatus === 'attending'
                            ? 'rgba(240, 253, 244, 0.9)'
                            : guest.rsvpStatus === 'pending'
                            ? 'rgba(254, 243, 199, 0.9)'
                            : 'rgba(254, 242, 242, 0.9)',
                        color:
                          guest.rsvpStatus === 'attending'
                            ? '#15803D'
                            : guest.rsvpStatus === 'pending'
                            ? '#B45309'
                            : '#B91C1C',
                        border: '1px solid rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="attending">✓ Attending</option>
                      <option value="pending">⏳ Awaiting Response</option>
                      <option value="declined">✕ Declined</option>
                    </select>
                  </td>

                  {/* Plus Ones */}
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: '#140A05' }}>
                    {guest.plusOnes > 0 ? `+${guest.plusOnes}` : 'None'}
                  </td>

                  {/* Dietary Note */}
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background:
                          guest.dietary === 'None'
                            ? 'rgba(0,0,0,0.04)'
                            : guest.dietary.toLowerCase().includes('nut') || guest.dietary.toLowerCase().includes('allergy')
                            ? '#fee2e2'
                            : 'rgba(234, 88, 12, 0.1)',
                        color:
                          guest.dietary.toLowerCase().includes('nut') || guest.dietary.toLowerCase().includes('allergy')
                            ? '#b91c1c'
                            : '#140A05',
                      }}
                    >
                      {guest.dietary}
                    </span>
                  </td>

                  {/* Table Selection */}
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <select
                      value={guest.tableId || ''}
                      onChange={(e) => handleTableChange(guest.id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.78rem',
                        borderRadius: 'var(--radius-sm)',
                        background: '#FFFFFF',
                        border: '1px solid rgba(234, 88, 12, 0.25)',
                        color: '#140A05',
                        fontWeight: 600,
                        cursor: 'pointer',
                        maxWidth: '180px',
                      }}
                    >
                      <option value="">Unassigned</option>
                      {tables.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Delete Button */}
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteGuest(guest.id)}
                      className="btn-ghost"
                      style={{ padding: '0.25rem', color: '#ef4444' }}
                      title="Delete Guest"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Guest */}
      {showAddGuestModal && (
        <div className="modal-backdrop" onClick={() => setShowAddGuestModal(false)} style={{ zIndex: 1100 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '480px', padding: '2rem', background: '#FFFFFF' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                Add New Event Guest
              </h3>
              <button onClick={() => setShowAddGuestModal(false)} className="btn-ghost">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddGuest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="maya@example.com"
                  value={newGuestEmail}
                  onChange={(e) => setNewGuestEmail(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                    RSVP Status
                  </label>
                  <select
                    value={newGuestRsvp}
                    onChange={(e) => setNewGuestRsvp(e.target.value as RsvpStatus)}
                    className="glass-input"
                  >
                    <option value="pending">⏳ Awaiting Response</option>
                    <option value="attending">✓ Attending</option>
                    <option value="declined">✕ Declined</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                    Plus-Ones
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={newGuestPlusOnes}
                    onChange={(e) => setNewGuestPlusOnes(parseInt(e.target.value) || 0)}
                    className="glass-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                    Dietary Requirement
                  </label>
                  <select
                    value={newGuestDietary}
                    onChange={(e) => setNewGuestDietary(e.target.value as DietaryType)}
                    className="glass-input"
                  >
                    {DIETARY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                    Assign Table
                  </label>
                  <select
                    value={newGuestTable}
                    onChange={(e) => setNewGuestTable(e.target.value)}
                    className="glass-input"
                  >
                    <option value="">Unassigned</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                  Special Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIP speaker, requires front row seat..."
                  value={newGuestNotes}
                  onChange={(e) => setNewGuestNotes(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddGuestModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Table */}
      {showAddTableModal && (
        <div className="modal-backdrop" onClick={() => setShowAddTableModal(false)} style={{ zIndex: 1100 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px', padding: '2rem', background: '#FFFFFF' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
                Add Banquet Table
              </h3>
              <button onClick={() => setShowAddTableModal(false)} className="btn-ghost">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddTable} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                  Table Name or Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table 5 — Galaxy"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                    Seat Capacity
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={newTableCapacity}
                    onChange={(e) => setNewTableCapacity(parseInt(e.target.value) || 8)}
                    className="glass-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem', color: '#140A05' }}>
                    Shape
                  </label>
                  <select
                    value={newTableShape}
                    onChange={(e) => setNewTableShape(e.target.value as 'round' | 'rectangle')}
                    className="glass-input"
                  >
                    <option value="round">⭕ Round Table</option>
                    <option value="rectangle">▭ Rectangular Table</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddTableModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
