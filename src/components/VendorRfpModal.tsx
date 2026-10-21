import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Printer,
  Mail,
  X,
  Sparkles,
  ShieldCheck,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { EventPlan, VendorItem } from '../types';
import { formatCurrency } from '../utils/deterministicMath';

interface VendorRfpModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: EventPlan;
  initialVendorId?: string;
}

export const VendorRfpModal: React.FC<VendorRfpModalProps> = ({
  isOpen,
  onClose,
  plan,
  initialVendorId,
}) => {
  const vendors = plan.vendors && plan.vendors.length > 0 ? plan.vendors : [];
  const [selectedVendorId, setSelectedVendorId] = useState<string>(
    initialVendorId || vendors[0]?.id || ''
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // Match budget allocation for this vendor category if available
  const matchingBudgetItem = plan.budget.items.find((item) =>
    item.category.toLowerCase().includes((currentVendor?.service || '').toLowerCase()) ||
    (currentVendor?.service || '').toLowerCase().includes(item.category.toLowerCase())
  );
  const allocatedBudgetAmount = matchingBudgetItem
    ? formatCurrency(matchingBudgetItem.allocatedAmount, plan.budget.currency)
    : currentVendor?.recommendedBudgetRange || 'Flexible Market Rate';

  // Construct the Professional Email Template
  const emailSubject = `Inquiry & Availability RFP: ${currentVendor?.service || 'Event Services'} for ${plan.basics.title}`;
  
  const emailBody = `Dear ${currentVendor?.contactName || `${currentVendor?.service || 'Vendor'} Team`},

I am planning our upcoming ${plan.basics.eventType} ("${plan.basics.title}") and would love to inquire about your availability and request a formal quote for ${currentVendor?.service}.

Here are the key parameters of our event:
• Event Type: ${plan.basics.eventType.toUpperCase()}
• Date / Target Window: ${plan.basics.eventDate || 'Flexible T-Minus Schedule'}
• Location & Setting: ${plan.basics.location || 'Local Area'} (${plan.basics.venueSetting} setting)
• Expected Guest Headcount: ${plan.basics.guestCount} guests
• Aesthetic / Atmosphere: ${plan.basics.preferences?.vibe || 'Festive & Elegant'}
• Dietary & Special Notes: ${plan.basics.preferences?.dietaryNotes || 'Standard crowd-pleasing options'}
• Accessibility & Timing Needs: ${plan.basics.preferences?.accessibilityNeeds || 'None'} / ${plan.basics.preferences?.constraints || 'Standard hours'}

FINANCIAL SCOPE & BUDGET CEILING:
Our structured financial allocation for this category is approximately ${allocatedBudgetAmount}.

KEY QUESTIONS & PROPOSAL REQUIREMENTS:
Before finalizing our partner contracts, we would appreciate your answers to the following questions:
${(currentVendor?.questions || ['What are your standard payment milestones and cancellation terms?'])
  .map((q, idx) => `${idx + 1}. ${q}`)
  .join('\n')}

Could you please confirm if you have availability for this date and share an initial itemized estimate or package brochure?

Thank you for your time and expertise.

Warm regards,
Event Planning Team / Host
${plan.basics.title}
Generated via Planora Master Planner`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-content"
        style={{
          maxWidth: '820px',
          width: '95%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '1.5rem 2rem',
            background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
            borderBottom: '1px solid rgba(234, 88, 12, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <FileText size={18} color="#EA580C" />
              <span className="badge badge-orange">Host-to-Vendor Handoff Bridge</span>
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#140A05', margin: 0 }}>
              Vendor RFP & Inquiry Generator
            </h2>
          </div>

          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: '1.75rem 2rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {/* Vendor Selector Pill Bar */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#140A05', marginBottom: '0.5rem' }}>
              Select Vendor Service to Generate RFP For:
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.4rem' }}>
              {vendors.map((v) => {
                const isSelected = v.id === selectedVendorId;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVendorId(v.id)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.825rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      border: isSelected ? '1.5px solid #EA580C' : '1px solid rgba(0,0,0,0.12)',
                      background: isSelected ? '#EA580C' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#374151',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {v.service}
                  </button>
                );
              })}
            </div>
          </div>

          {currentVendor && (
            <>
              {/* Executive Brief Snapshot Card */}
              <div
                style={{
                  background: 'rgba(251, 247, 240, 0.75)',
                  border: '1.5px solid rgba(234, 88, 12, 0.22)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#140A05' }}>
                    {currentVendor.service} Scope Summary
                  </div>
                  <span className="badge badge-orange">Lead Time: {currentVendor.targetLeadTime}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.825rem' }}>
                  <div>
                    <span style={{ color: '#6B4226', fontWeight: 600 }}>Event Scale:</span>{' '}
                    <strong style={{ color: '#140A05' }}>{plan.basics.guestCount} Guests</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B4226', fontWeight: 600 }}>Venue Setting:</span>{' '}
                    <strong style={{ color: '#140A05' }}>{plan.basics.venueSetting}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B4226', fontWeight: 600 }}>Allocated Target:</span>{' '}
                    <strong style={{ color: '#16A34A', fontFamily: 'var(--font-mono)' }}>{allocatedBudgetAmount}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6B4226', fontWeight: 600 }}>Event Date:</span>{' '}
                    <strong style={{ color: '#140A05' }}>{plan.basics.eventDate || 'Flexible'}</strong>
                  </div>
                </div>
              </div>

              {/* Copyable Email Preview Container */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#140A05' }}>
                    Ready-to-Send Email & Scope Packet
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={handleCopyEmail}
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', background: '#FFFFFF' }}
                    >
                      {copied ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
                    </button>

                    <a
                      href={`mailto:${currentVendor.contactEmail || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                      className="btn-primary"
                      style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', textDecoration: 'none' }}
                    >
                      <Mail size={14} />
                      <span>Open in Mail App</span>
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    fontFamily: 'monospace',
                    fontSize: '0.825rem',
                    lineHeight: 1.6,
                    color: '#1F2937',
                    whiteSpace: 'pre-wrap',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.03)',
                  }}
                >
                  <strong style={{ color: '#C2410C' }}>Subject:</strong> {emailSubject}
                  {'\n\n'}
                  {emailBody}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '1rem 2rem',
            background: '#FAFAF9',
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#6B7280' }}>
            <ShieldCheck size={16} color="#16A34A" />
            <span>Guarantees budget alignment & eliminates vendor surprise costs</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              className="btn-secondary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              <Printer size={15} />
              <span>Print Formal Brief</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary"
              style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
