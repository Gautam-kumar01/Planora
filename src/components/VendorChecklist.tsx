import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  Clock,
  HelpCircle,
  Plus,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Tag,
  DollarSign,
  AlertCircle,
  FileCheck,
  CalendarClock,
  FileText,
  Scale,
  Trash2,
  Search,
  Phone,
  MessageCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { EventPlan, VendorItem, VendorStatus, VendorQuote } from '../types';
import { VendorRfpModal } from './VendorRfpModal';
import { VendorQuoteComparisonModal } from './VendorQuoteComparisonModal';
import { formatCurrency } from '../utils/deterministicMath';
import {
  INDIAN_VENDOR_TEMPLATES,
  GENERAL_VENDOR_TEMPLATES,
  VendorTemplateItem,
} from '../utils/indianEventEngine';

interface VendorChecklistProps {
  plan: EventPlan;
  onUpdateVendors: (updatedVendors: VendorItem[]) => void;
}

export const VendorChecklist: React.FC<VendorChecklistProps> = ({ plan, onUpdateVendors }) => {
  const { vendors = [] } = plan;
  const currency = plan.budget?.currency || 'USD';

  // Filters & Search
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUrgencyFilter, setSelectedUrgencyFilter] = useState<'all' | 'Immediate'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [selectedRfpVendorId, setSelectedRfpVendorId] = useState<string>('');
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedQuoteVendorId, setSelectedQuoteVendorId] = useState<string>('');

  // New custom vendor modal state
  const [newService, setNewService] = useState('');
  const [newUrgency, setNewUrgency] = useState<'Immediate' | 'Standard' | 'Flexible'>('Standard');
  const [newLeadTime, setNewLeadTime] = useState('3-6 months prior');
  const [newBudgetRange, setNewBudgetRange] = useState(`${currency} 500 - 1,500`);
  const [newQuestion1, setNewQuestion1] = useState('');
  const [newQuestion2, setNewQuestion2] = useState('');

  // Handlers
  const handleStatusChange = (id: string, newStatus: VendorStatus) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, status: newStatus } : v));
    onUpdateVendors(updated);
  };

  const handleUpdateContact = (
    id: string,
    field: 'contactName' | 'contactEmail' | 'contactPhone' | 'notes',
    val: string
  ) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, [field]: val } : v));
    onUpdateVendors(updated);
  };

  const handleUpdateContract = (
    id: string,
    field: 'contractStatus' | 'depositAmount' | 'depositDueDate' | 'balanceDueDate',
    val: any
  ) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, [field]: val } : v));
    onUpdateVendors(updated);
  };

  const handleDeleteVendor = (id: string) => {
    const updated = vendors.filter((v) => v.id !== id);
    onUpdateVendors(updated);
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim()) return;

    const questions: string[] = [];
    if (newQuestion1.trim()) questions.push(newQuestion1.trim());
    if (newQuestion2.trim()) questions.push(newQuestion2.trim());
    if (questions.length === 0) {
      questions.push('What are your payment milestones and cancellation terms?');
    }

    const newVendor: VendorItem = {
      id: `vnd-${Date.now()}`,
      service: newService.trim(),
      urgency: newUrgency,
      status: 'to_research',
      targetLeadTime: newLeadTime,
      recommendedBudgetRange: newBudgetRange,
      questions,
    };

    onUpdateVendors([...vendors, newVendor]);
    setNewService('');
    setNewQuestion1('');
    setNewQuestion2('');
    setShowAddModal(false);
  };

  const handleQuickAddTemplate = (tmpl: VendorTemplateItem) => {
    const newVendor: VendorItem = {
      id: `vnd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      service: tmpl.service,
      urgency: tmpl.urgency,
      status: 'to_research',
      targetLeadTime: tmpl.targetLeadTime,
      recommendedBudgetRange: tmpl.recommendedBudgetRange,
      questions: [...tmpl.questions],
    };
    onUpdateVendors([...vendors, newVendor]);
  };

  const handleSaveQuotes = (vendorId: string, updatedQuotes: VendorQuote[]) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        const nextStatus: VendorStatus =
          (v.status === 'to_research' || v.status === 'contacted') && updatedQuotes.length > 0
            ? 'quote_received'
            : v.status;
        return { ...v, quotes: updatedQuotes, status: nextStatus };
      }
      return v;
    });
    onUpdateVendors(updated);
  };

  const handleApplyQuotePrice = (vendorId: string, quoteAmount: number) => {
    const updated = vendors.map((v) => {
      if (v.id === vendorId) {
        return {
          ...v,
          recommendedBudgetRange: `${formatCurrency(quoteAmount, currency)} (Applied Quote)`,
        };
      }
      return v;
    });
    onUpdateVendors(updated);
  };

  // High-Level KPI Aggregations
  const totalCount = vendors.length;
  const bookedCount = vendors.filter((v) => v.status === 'booked').length;
  const inPipelineCount = vendors.filter(
    (v) => v.status === 'contacted' || v.status === 'quote_received'
  ).length;
  const immediateUrgencyCount = vendors.filter((v) => v.urgency === 'Immediate').length;
  const bookedPercent = totalCount > 0 ? Math.round((bookedCount / totalCount) * 100) : 0;
  const totalCommittedDeposits = vendors.reduce(
    (sum, v) => sum + (typeof v.depositAmount === 'number' ? v.depositAmount : 0),
    0
  );
  const contractsSignedCount = vendors.filter(
    (v) => v.contractStatus === 'signed' || v.contractStatus === 'completed'
  ).length;

  // Deposit Due Date Alert Evaluation
  const getDepositAlert = (vendor: VendorItem) => {
    if (!vendor.depositDueDate || vendor.contractStatus === 'completed') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(vendor.depositDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        type: 'overdue',
        text: `Retainer Overdue (${Math.abs(diffDays)}d ago)`,
        bg: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        color: '#DC2626',
      };
    }
    if (diffDays <= 14) {
      return {
        type: 'upcoming',
        text: `Retainer Due in ${diffDays === 0 ? 'Today' : `${diffDays}d`}`,
        bg: 'rgba(245, 158, 11, 0.14)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        color: '#B45309',
      };
    }
    return null;
  };

  // Quick-Add Essential Partner Templates
  const isIndianPlan = Boolean(
    plan.indianIntelligence ||
      currency === 'INR' ||
      plan.basics.eventType === 'wedding'
  );
  const availableTemplates = Object.values(
    isIndianPlan ? INDIAN_VENDOR_TEMPLATES : GENERAL_VENDOR_TEMPLATES
  );

  // Filter & Search Vendors
  const filteredVendors = vendors.filter((v) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matches =
        v.service.toLowerCase().includes(q) ||
        (v.contactName || '').toLowerCase().includes(q) ||
        (v.contactEmail || '').toLowerCase().includes(q) ||
        (v.contactPhone || '').toLowerCase().includes(q) ||
        (v.notes || '').toLowerCase().includes(q) ||
        (v.questions || []).some((qst) => qst.toLowerCase().includes(q));
      if (!matches) return false;
    }

    if (selectedUrgencyFilter === 'Immediate' && v.urgency !== 'Immediate') {
      return false;
    }

    if (selectedStatusFilter === 'all') return true;
    if (selectedStatusFilter === 'active') return v.status !== 'booked' && v.status !== 'not_needed';
    return v.status === selectedStatusFilter;
  });

  const renderStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'booked':
        return <span className="badge badge-green">Booked & Confirmed</span>;
      case 'quote_received':
        return <span className="badge badge-amber">Quote Received</span>;
      case 'contacted':
        return <span className="badge badge-orange">Contacted</span>;
      case 'not_needed':
        return <span className="badge badge-gray">Not Needed</span>;
      default:
        return (
          <span
            className="badge"
            style={{
              background: 'rgba(234, 88, 12, 0.12)',
              border: '1px solid rgba(234, 88, 12, 0.35)',
              color: '#9A3412',
              fontWeight: 700,
            }}
          >
            To Research
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. High-Level Executive Vendor Control Metrics */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.45) 0%, rgba(255, 237, 213, 0.45) 100%)',
          border: '1.5px solid rgba(234, 88, 12, 0.22)',
        }}
      >
        {/* Metric 1: Booked Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase' }}>
              Booking Progress
            </span>
            <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#16A34A' }}>
              {bookedCount} / {totalCount} ({bookedPercent}%)
            </span>
          </div>
          <div
            style={{
              height: '8px',
              borderRadius: '999px',
              background: 'rgba(234, 88, 12, 0.15)',
              overflow: 'hidden',
              marginBottom: '0.35rem',
            }}
          >
            <div
              style={{
                width: `${bookedPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #EA580C, #16A34A)',
                borderRadius: '999px',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#9A3412', fontWeight: 600 }}>
            {totalCount - bookedCount} partners remaining to secure
          </span>
        </div>

        {/* Metric 2: Active Pipeline */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Active Procurement Pipeline
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#140A05' }}>
            {inPipelineCount}{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D97706' }}>
              in negotiation
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            {immediateUrgencyCount} marked Immediate Urgency
          </span>
        </div>

        {/* Metric 3: Committed Retainers */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#78533E', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Committed Retainers
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#C2410C' }}>
            {formatCurrency(totalCommittedDeposits, currency)}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            {contractsSignedCount} legally signed contracts
          </span>
        </div>
      </div>

      {/* 2. Top Header, Search & Filter Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Services (${totalCount})` },
              { id: 'active', label: `In Progress (${inPipelineCount})` },
              { id: 'to_research', label: 'To Research' },
              { id: 'quote_received', label: 'Quotes Received' },
              { id: 'booked', label: `Booked (${bookedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusFilter(tab.id)}
                className="btn-secondary"
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.825rem',
                  background:
                    selectedStatusFilter === tab.id
                      ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)'
                      : '#FFFFFF',
                  borderColor:
                    selectedStatusFilter === tab.id
                      ? 'rgba(254, 215, 170, 0.4)'
                      : 'rgba(234, 88, 12, 0.28)',
                  color: selectedStatusFilter === tab.id ? '#FFFFFF' : '#7C2D12',
                  fontWeight: selectedStatusFilter === tab.id ? 700 : 600,
                  boxShadow:
                    selectedStatusFilter === tab.id ? '0 2px 10px rgba(234, 88, 12, 0.35)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setSelectedRfpVendorId(vendors[0]?.id || '');
                setIsRfpModalOpen(true);
              }}
              className="btn-secondary"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                background: '#FFFFFF',
                border: '1.5px solid #EA580C',
                color: '#C2410C',
                fontWeight: 700,
              }}
            >
              <FileText size={16} color="#EA580C" />
              <span>Generate Vendor RFP Brief 📄</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
              style={{ padding: '0.5rem 1.15rem', fontSize: '0.875rem' }}
            >
              <Plus size={16} />
              <span>Add Service Partner</span>
            </button>
          </div>
        </div>

        {/* Search & Immediate Urgency Quick Toggle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(234, 88, 12, 0.12)',
          }}
        >
          {/* Live Search Input */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
            <Search
              size={15}
              color="#9A3412"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="glass-input"
              style={{
                width: '100%',
                padding: '0.45rem 0.75rem 0.45rem 2.25rem',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
              placeholder="Search partner, contact rep, phone, or vetting topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: '2px',
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Urgency Filter Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.785rem', fontWeight: 700, color: '#78533E' }}>Urgency:</span>
            <button
              type="button"
              onClick={() => setSelectedUrgencyFilter(selectedUrgencyFilter === 'all' ? 'Immediate' : 'all')}
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                background:
                  selectedUrgencyFilter === 'Immediate' ? 'rgba(225, 29, 72, 0.15)' : '#FFFFFF',
                borderColor:
                  selectedUrgencyFilter === 'Immediate' ? '#B91C1C' : 'rgba(234, 88, 12, 0.25)',
                color: selectedUrgencyFilter === 'Immediate' ? '#B91C1C' : '#6B7280',
              }}
            >
              {selectedUrgencyFilter === 'Immediate' ? '🔥 Immediate Only' : 'All Urgencies'}
            </button>
          </div>
        </div>

        {/* 3. 1-Click Quick-Add Essential Partner Tray */}
        <div
          style={{
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(234, 88, 12, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 800, color: '#C2410C' }}>
            <Sparkles size={14} color="#EA580C" />
            <span>Quick-Add Essential:</span>
          </div>

          <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {availableTemplates.map((tmpl) => {
              const alreadyAdded = vendors.some(
                (v) => v.service.toLowerCase() === tmpl.service.toLowerCase()
              );
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleQuickAddTemplate(tmpl)}
                  className="btn-secondary"
                  title={`1-Click Add ${tmpl.service} with 3 vetting questions`}
                  style={{
                    padding: '0.3rem 0.65rem',
                    fontSize: '0.765rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-full)',
                    background: alreadyAdded ? 'rgba(234, 88, 12, 0.06)' : '#FFFFFF',
                    borderColor: alreadyAdded ? 'rgba(234, 88, 12, 0.25)' : 'rgba(234, 88, 12, 0.4)',
                    color: alreadyAdded ? '#9A3412' : '#C2410C',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>+ {tmpl.service.split(',')[0].split('&')[0].trim()}</span>
                  {alreadyAdded && <span style={{ fontSize: '0.7rem', color: '#16A34A' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Vendor Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredVendors.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <AlertCircle size={36} color="#D97706" />
            <div>
              <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#140A05', marginBottom: '0.25rem' }}>
                No Service Partners Found
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                No vendors match your current search and filter settings.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedStatusFilter('all');
                setSelectedUrgencyFilter('all');
                setSearchTerm('');
              }}
              className="btn-secondary"
              style={{ fontSize: '0.825rem', padding: '0.45rem 1rem' }}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredVendors.map((vendor) => {
            const depositAlert = getDepositAlert(vendor);
            const cleanPhone = (vendor.contactPhone || '').replace(/[^0-9+]/g, '');

            return (
              <div
                key={vendor.id}
                className="glass-panel"
                style={{
                  padding: '1.5rem 1.75rem',
                  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                  border:
                    depositAlert?.type === 'overdue'
                      ? '1.5px solid rgba(239, 68, 68, 0.4)'
                      : '1px solid rgba(234, 88, 12, 0.2)',
                }}
              >
                {/* Header Row: Title, Badges, Progression, Delete */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.3rem', color: '#140A05', fontWeight: 700, margin: 0 }}>
                        {vendor.service}
                      </h3>
                      {renderStatusBadge(vendor.status)}
                      <span
                        className="badge"
                        style={{
                          background:
                            vendor.urgency === 'Immediate'
                              ? 'rgba(225, 29, 72, 0.12)'
                              : 'rgba(217, 119, 6, 0.14)',
                          color: vendor.urgency === 'Immediate' ? '#B91C1C' : '#92400E',
                          border:
                            vendor.urgency === 'Immediate'
                              ? '1px solid rgba(225, 29, 72, 0.3)'
                              : '1px solid rgba(217, 119, 6, 0.3)',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                        }}
                      >
                        {vendor.urgency} Urgency
                      </span>

                      {depositAlert && (
                        <span
                          className="badge"
                          style={{
                            background: depositAlert.bg,
                            border: depositAlert.border,
                            color: depositAlert.color,
                            fontSize: '0.685rem',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <AlertTriangle size={12} />
                          {depositAlert.text}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '1.25rem',
                        marginTop: '0.5rem',
                        flexWrap: 'wrap',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} color="#C2410C" />
                        <span>
                          Lead time:{' '}
                          <strong style={{ color: '#9A3412', fontWeight: 700 }}>
                            {vendor.targetLeadTime}
                          </strong>
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <DollarSign size={14} color="#D97706" />
                        <span>
                          Est. Target Range:{' '}
                          <strong style={{ color: '#9A3412', fontWeight: 700 }}>
                            {vendor.recommendedBudgetRange}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Progression Selector & Delete Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 700 }}>
                        Pipeline:
                      </span>
                      <select
                        aria-label={`Status for ${vendor.service}`}
                        className="glass-input"
                        style={{
                          width: '160px',
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.825rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                        value={vendor.status}
                        onChange={(e) => handleStatusChange(vendor.id, e.target.value as VendorStatus)}
                      >
                        <option value="to_research">To Research</option>
                        <option value="contacted">Contacted</option>
                        <option value="quote_received">Quote Received</option>
                        <option value="booked">Booked & Confirmed</option>
                        <option value="not_needed">Not Needed</option>
                      </select>
                    </div>

                    {/* Delete Partner Action */}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to remove "${vendor.service}" from your vendor checklist?`
                          )
                        ) {
                          handleDeleteVendor(vendor.id);
                        }
                      }}
                      className="btn-ghost"
                      title={`Remove ${vendor.service}`}
                      style={{
                        padding: '0.35rem 0.55rem',
                        color: '#9CA3AF',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#DC2626';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#9CA3AF';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* AI Candidate Vetting Guide: Top 3 Interview Questions */}
                <div
                  style={{
                    background: 'rgba(254, 243, 199, 0.55)',
                    border: '1px solid rgba(217, 119, 6, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem 1.25rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.5rem' }}>
                    <HelpCircle size={15} color="#D97706" />
                    <span
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 700,
                        color: '#92400E',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      AI Candidate Vetting Guide (Top 3 Questions)
                    </span>
                  </div>
                  <ul
                    style={{
                      paddingLeft: '1.25rem',
                      fontSize: '0.85rem',
                      color: '#140A05',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    {vendor.questions?.map((q, qIdx) => (
                      <li key={qIdx}>{q}</li>
                    ))}
                  </ul>
                </div>

                {/* Contact Details & Direct Action Shortcuts */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1rem',
                  }}
                >
                  {/* Contact Name */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: '#78533E',
                        fontWeight: 700,
                        marginBottom: '0.25rem',
                      }}
                    >
                      Contact Name / Representative
                    </label>
                    <input
                      type="text"
                      className="glass-input"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                      placeholder="e.g. Julian Croft (Lead)"
                      value={vendor.contactName || ''}
                      onChange={(e) => handleUpdateContact(vendor.id, 'contactName', e.target.value)}
                    />
                  </div>

                  {/* Contact Email & Quick Mailto */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 700 }}>
                        Email Address
                      </label>
                      {vendor.contactEmail && (
                        <a
                          href={`mailto:${vendor.contactEmail}`}
                          style={{
                            fontSize: '0.725rem',
                            color: '#EA580C',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <Mail size={11} />
                          Send Mail
                        </a>
                      )}
                    </div>
                    <input
                      type="email"
                      className="glass-input"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                      placeholder="e.g. info@service.com"
                      value={vendor.contactEmail || ''}
                      onChange={(e) => handleUpdateContact(vendor.id, 'contactEmail', e.target.value)}
                    />
                  </div>

                  {/* Phone / WhatsApp & Quick Call/Chat */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 700 }}>
                        Phone / WhatsApp
                      </label>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {cleanPhone && (
                          <>
                            <a
                              href={`tel:${cleanPhone}`}
                              style={{
                                fontSize: '0.725rem',
                                color: '#16A34A',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              <Phone size={11} />
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '0.725rem',
                                color: '#25D366',
                                fontWeight: 700,
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                              }}
                            >
                              <MessageCircle size={11} />
                              Chat
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                    <input
                      type="tel"
                      className="glass-input"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                      placeholder="e.g. +91 98765 43210"
                      value={vendor.contactPhone || ''}
                      onChange={(e) => handleUpdateContact(vendor.id, 'contactPhone', e.target.value)}
                    />
                  </div>

                  {/* Internal Notes */}
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        color: '#78533E',
                        fontWeight: 700,
                        marginBottom: '0.25rem',
                      }}
                    >
                      Internal Notes & Deliverables
                    </label>
                    <input
                      type="text"
                      className="glass-input"
                      style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                      placeholder="e.g. Setup completed by 3 PM, floral sample approved"
                      value={vendor.notes || ''}
                      onChange={(e) => handleUpdateContact(vendor.id, 'notes', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contract & Payment Milestones Panel */}
                <div
                  style={{
                    background: '#FAF6EF',
                    border: '1px solid #E4DACB',
                    borderRadius: '0.75rem',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileCheck size={16} color="#78533E" />
                      <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#140A05' }}>
                        Contract Milestones & Retainer Schedule
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 600 }}>
                        Status:
                      </span>
                      <select
                        className="glass-input"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.785rem', fontWeight: 700, width: 'auto' }}
                        value={vendor.contractStatus || 'needed'}
                        onChange={(e) => handleUpdateContract(vendor.id, 'contractStatus', e.target.value)}
                      >
                        <option value="needed">Contract Needed</option>
                        <option value="reviewing">Under Review / Negotiation</option>
                        <option value="signed">Signed & Legally Bound</option>
                        <option value="completed">Completed & Fulfilled</option>
                      </select>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.725rem',
                          color: '#78533E',
                          fontWeight: 700,
                          marginBottom: '0.2rem',
                        }}
                      >
                        Deposit / Retainer ({currency})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="glass-input"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', fontWeight: 600 }}
                        placeholder="0"
                        value={vendor.depositAmount !== undefined ? vendor.depositAmount : ''}
                        onChange={(e) =>
                          handleUpdateContract(
                            vendor.id,
                            'depositAmount',
                            e.target.value ? parseFloat(e.target.value) : undefined
                          )
                        }
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.725rem',
                          color: '#78533E',
                          fontWeight: 700,
                          marginBottom: '0.2rem',
                        }}
                      >
                        Deposit Due Date
                      </label>
                      <input
                        type="date"
                        className="glass-input"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', fontWeight: 600 }}
                        value={vendor.depositDueDate || ''}
                        onChange={(e) => handleUpdateContract(vendor.id, 'depositDueDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '0.725rem',
                          color: '#78533E',
                          fontWeight: 700,
                          marginBottom: '0.2rem',
                        }}
                      >
                        Balance Due Date
                      </label>
                      <input
                        type="date"
                        className="glass-input"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', fontWeight: 600 }}
                        value={vendor.balanceDueDate || ''}
                        onChange={(e) => handleUpdateContract(vendor.id, 'balanceDueDate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Row: Compare Quotes & 1-Click RFP */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.85rem',
                    paddingTop: '0.85rem',
                    borderTop: '1px solid rgba(234, 88, 12, 0.15)',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    id={`btn-compare-quotes-${vendor.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedQuoteVendorId(vendor.id);
                      setIsQuoteModalOpen(true);
                    }}
                    className="btn-secondary"
                    title="Enter and neutrally compare proposals from multiple vendors"
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.85rem',
                      background: '#FFFFFF',
                      borderColor: 'rgba(234, 88, 12, 0.35)',
                    }}
                  >
                    <Scale size={15} color="#C2410C" />
                    <span>
                      Compare Quotes{' '}
                      {vendor.quotes && vendor.quotes.length > 0 ? `(${vendor.quotes.length})` : ''}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRfpVendorId(vendor.id);
                      setIsRfpModalOpen(true);
                    }}
                    className="btn-ghost"
                    style={{
                      fontSize: '0.825rem',
                      color: '#C2410C',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(234, 88, 12, 0.08)',
                      border: '1px solid rgba(234, 88, 12, 0.25)',
                    }}
                  >
                    <FileText size={15} color="#EA580C" />
                    <span>Generate RFP & Inquiry Email</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Add Custom Vendor Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ padding: '1.75rem', maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: '#140A05', fontWeight: 800 }}>
              Add Service Partner
            </h3>
            <form onSubmit={handleAddVendor} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Service Name
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Drone Videographer or Gelato Cart"
                  value={newService}
                  onChange={(e) => setNewService(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Urgency Level
                  </label>
                  <select
                    className="glass-input"
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Standard">Standard</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Target Lead Time
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. 4-6 months prior"
                    value={newLeadTime}
                    onChange={(e) => setNewLeadTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Target Budget Range
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder={`e.g. ${currency} 1,000 - 1,500`}
                  value={newBudgetRange}
                  onChange={(e) => setNewBudgetRange(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Vetting Question 1
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Do you carry liability insurance?"
                  value={newQuestion1}
                  onChange={(e) => setNewQuestion1(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                  Vetting Question 2
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. What is your refund policy if date changes?"
                  value={newQuestion2}
                  onChange={(e) => setNewQuestion2(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Service Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. 1-Click Vendor RFP & Inquiry Modal */}
      <VendorRfpModal
        isOpen={isRfpModalOpen}
        onClose={() => setIsRfpModalOpen(false)}
        plan={plan}
        initialVendorId={selectedRfpVendorId}
      />

      {/* 7. Vendor Proposal & Quote Comparison Modal */}
      {isQuoteModalOpen && selectedQuoteVendorId && (
        <VendorQuoteComparisonModal
          isOpen={isQuoteModalOpen}
          onClose={() => {
            setIsQuoteModalOpen(false);
            setSelectedQuoteVendorId('');
          }}
          vendor={vendors.find((v) => v.id === selectedQuoteVendorId) || vendors[0]}
          currency={currency}
          onSaveQuotes={handleSaveQuotes}
          onApplyQuotePrice={handleApplyQuotePrice}
        />
      )}
    </div>
  );
};
