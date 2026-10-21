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
} from 'lucide-react';
import { EventPlan, VendorItem, VendorStatus } from '../types';
import { VendorRfpModal } from './VendorRfpModal';

interface VendorChecklistProps {
  plan: EventPlan;
  onUpdateVendors: (updatedVendors: VendorItem[]) => void;
}

export const VendorChecklist: React.FC<VendorChecklistProps> = ({ plan, onUpdateVendors }) => {
  const { vendors } = plan;
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [selectedRfpVendorId, setSelectedRfpVendorId] = useState<string>('');

  // New vendor modal state
  const [newService, setNewService] = useState('');
  const [newLeadTime, setNewLeadTime] = useState('3-6 months prior');
  const [newBudgetRange, setNewBudgetRange] = useState('$500 - $1,500');
  const [newQuestion1, setNewQuestion1] = useState('');
  const [newQuestion2, setNewQuestion2] = useState('');

  // Status progression cycle
  const STATUS_FLOW: VendorStatus[] = [
    'to_research',
    'contacted',
    'quote_received',
    'booked',
    'not_needed',
  ];

  const handleStatusChange = (id: string, newStatus: VendorStatus) => {
    const updated = vendors.map((v) => (v.id === id ? { ...v, status: newStatus } : v));
    onUpdateVendors(updated);
  };

  const handleUpdateContact = (id: string, field: 'contactName' | 'contactEmail' | 'notes', val: string) => {
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
      urgency: 'Standard',
      status: 'to_research',
      targetLeadTime: newLeadTime,
      recommendedBudgetRange: newBudgetRange,
      questions,
    };

    onUpdateVendors([...vendors, newVendor]);
    setNewService('');
    setShowAddModal(false);
  };

  // Status badge helper
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

  // Filter vendors
  const filteredVendors = vendors.filter((v) => {
    if (selectedStatusFilter === 'all') return true;
    if (selectedStatusFilter === 'active') return v.status !== 'booked' && v.status !== 'not_needed';
    return v.status === selectedStatusFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Header & Filters */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Services' },
            { id: 'active', label: 'In Progress' },
            { id: 'to_research', label: 'To Research' },
            { id: 'quote_received', label: 'Quotes Received' },
            { id: 'booked', label: 'Booked' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusFilter(tab.id)}
              className="btn-secondary"
              style={{
                padding: '0.4rem 0.9rem',
                fontSize: '0.825rem',
                background: selectedStatusFilter === tab.id ? 'linear-gradient(135deg, #F97316, #F59E0B, #D97706)' : '#FFFFFF',
                borderColor: selectedStatusFilter === tab.id ? 'rgba(254, 215, 170, 0.4)' : 'rgba(234, 88, 12, 0.28)',
                color: selectedStatusFilter === tab.id ? '#FFFFFF' : '#7C2D12',
                fontWeight: selectedStatusFilter === tab.id ? 700 : 600,
                boxShadow: selectedStatusFilter === tab.id ? '0 2px 10px rgba(234, 88, 12, 0.35)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

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
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '0.5rem 1.15rem', fontSize: '0.875rem' }}>
            <Plus size={16} />
            <span>Add Service Partner</span>
          </button>
        </div>
      </div>

      {/* Vendor Cards Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="glass-panel" style={{ padding: '1.5rem 1.75rem' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <h3 style={{ fontSize: '1.3rem', color: '#140A05', fontWeight: 700 }}>{vendor.service}</h3>
                  {renderStatusBadge(vendor.status)}
                  <span
                    className="badge"
                    style={{
                      background: vendor.urgency === 'Immediate' ? 'rgba(225, 29, 72, 0.12)' : 'rgba(217, 119, 6, 0.14)',
                      color: vendor.urgency === 'Immediate' ? '#B91C1C' : '#92400E',
                      border: vendor.urgency === 'Immediate' ? '1px solid rgba(225, 29, 72, 0.3)' : '1px solid rgba(217, 119, 6, 0.3)',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                    }}
                  >
                    {vendor.urgency} Urgency
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={14} color="#C2410C" />
                    <span>Lead time: <strong style={{ color: '#9A3412', fontWeight: 700 }}>{vendor.targetLeadTime}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <DollarSign size={14} color="#D97706" />
                    <span>Est. Target Range: <strong style={{ color: '#9A3412', fontWeight: 700 }}>{vendor.recommendedBudgetRange}</strong></span>
                  </div>
                </div>
              </div>

              {/* Status Progression Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 700 }}>Pipeline:</span>
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
            </div>

            {/* AI Decision Guide: Top 3 Interview Questions */}
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
                <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  AI Candidate Vetting Guide (Top 3 Questions)
                </span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#140A05', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontWeight: 500 }}>
                {vendor.questions?.map((q, qIdx) => (
                  <li key={qIdx}>{q}</li>
                ))}
              </ul>
            </div>

            {/* Contact Details & Notes Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#78533E', fontWeight: 700, marginBottom: '0.25rem' }}>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#78533E', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Email or Phone
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                  placeholder="e.g. julian@croftvisuals.com"
                  value={vendor.contactEmail || ''}
                  onChange={(e) => handleUpdateContact(vendor.id, 'contactEmail', e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#78533E', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Internal Notes & Deliverables
                </label>
                <input
                  type="text"
                  className="glass-input"
                  style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600 }}
                  placeholder="e.g. Deposit paid on May 2nd; 8 hours coverage"
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCheck size={16} color="#78533E" />
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#140A05' }}>
                    Contract Milestones & Retainer Schedule
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#78533E', fontWeight: 600 }}>Status:</span>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', color: '#78533E', fontWeight: 700, marginBottom: '0.2rem' }}>
                    Deposit / Retainer ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="glass-input"
                    style={{ padding: '0.35rem 0.65rem', fontSize: '0.825rem', fontWeight: 600 }}
                    placeholder="0"
                    value={vendor.depositAmount !== undefined ? vendor.depositAmount : ''}
                    onChange={(e) => handleUpdateContract(vendor.id, 'depositAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.725rem', color: '#78533E', fontWeight: 700, marginBottom: '0.2rem' }}>
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
                  <label style={{ display: 'block', fontSize: '0.725rem', color: '#78533E', fontWeight: 700, marginBottom: '0.2rem' }}>
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

            {/* 1-Click RFP & Inquiry Generator Action */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(234, 88, 12, 0.15)' }}>
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
                <span>Generate RFP & Inquiry Email for {vendor.service}</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Vendor Modal */}
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
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#140A05', fontWeight: 700 }}>
                    Target Budget Range
                  </label>
                  <input
                    type="text"
                    className="glass-input"
                    placeholder="e.g. $1,000 - $1,500"
                    value={newBudgetRange}
                    onChange={(e) => setNewBudgetRange(e.target.value)}
                  />
                </div>
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1-Click Vendor RFP & Inquiry Modal */}
      <VendorRfpModal
        isOpen={isRfpModalOpen}
        onClose={() => setIsRfpModalOpen(false)}
        plan={plan}
        initialVendorId={selectedRfpVendorId}
      />
    </div>
  );
};
