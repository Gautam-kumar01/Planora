import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  HelpCircle,
  AlertCircle,
  ShieldCheck,
  DollarSign,
  Scale,
  Calendar,
  Check,
} from 'lucide-react';
import { VendorItem, VendorQuote } from '../types';
import { formatCurrency } from '../utils/deterministicMath';
import { generateNeutralQuoteComparison } from '../utils/vendorQuoteEngine';

interface VendorQuoteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor: VendorItem;
  currency: string;
  onSaveQuotes: (vendorId: string, updatedQuotes: VendorQuote[]) => void;
  onApplyQuotePrice?: (vendorId: string, quoteAmount: number) => void;
}

export const VendorQuoteComparisonModal: React.FC<VendorQuoteComparisonModalProps> = ({
  isOpen,
  onClose,
  vendor,
  currency,
  onSaveQuotes,
  onApplyQuotePrice,
}) => {
  const [quotes, setQuotes] = useState<VendorQuote[]>(vendor.quotes || []);
  const [isAddingQuote, setIsAddingQuote] = useState(false);

  // New quote form state
  const [vendorName, setVendorName] = useState('');
  const [quoteAmount, setQuoteAmount] = useState<number | ''>('');
  const [includedServices, setIncludedServices] = useState('');
  const [exclusions, setExclusions] = useState('');
  const [depositRequired, setDepositRequired] = useState('');
  const [paymentSchedule, setPaymentSchedule] = useState('');
  const [cancellationTerms, setCancellationTerms] = useState('');
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState<boolean | 'unconfirmed'>('unconfirmed');
  const [quoteExpiryDate, setQuoteExpiryDate] = useState('');
  const [additionalFees, setAdditionalFees] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const comparison = generateNeutralQuoteComparison(quotes, vendor.service);

  const handleAddQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName.trim() || quoteAmount === '') return;

    const newQuote: VendorQuote = {
      id: `quote-${Date.now()}`,
      vendorName: vendorName.trim(),
      quoteAmount: Number(quoteAmount),
      currency: currency || 'USD',
      includedServices: includedServices.trim() || 'Not specified',
      exclusions: exclusions.trim() || undefined,
      depositRequired: depositRequired.trim() || undefined,
      paymentSchedule: paymentSchedule.trim() || undefined,
      cancellationTerms: cancellationTerms.trim() || undefined,
      availabilityConfirmed: availabilityConfirmed,
      quoteExpiryDate: quoteExpiryDate || undefined,
      additionalFees: additionalFees.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const updated = [...quotes, newQuote];
    setQuotes(updated);
    onSaveQuotes(vendor.id, updated);

    // Reset form
    setVendorName('');
    setQuoteAmount('');
    setIncludedServices('');
    setExclusions('');
    setDepositRequired('');
    setPaymentSchedule('');
    setCancellationTerms('');
    setAvailabilityConfirmed('unconfirmed');
    setQuoteExpiryDate('');
    setAdditionalFees('');
    setNotes('');
    setIsAddingQuote(false);
  };

  const handleDeleteQuote = (quoteId: string) => {
    const updated = quotes.filter((q) => q.id !== quoteId);
    setQuotes(updated);
    onSaveQuotes(vendor.id, updated);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20, 10, 5, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 24px 48px rgba(20, 10, 5, 0.25)',
          border: '1.5px solid rgba(234, 88, 12, 0.35)',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Scale size={20} color="#C2410C" />
              <span className="badge badge-orange">Vendor Quote Comparison</span>
            </div>
            <h2 id="quote-modal-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#140A05' }}>
              {vendor.service}: Compare Vendor Quotes
            </h2>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.85rem', color: '#78533E', fontWeight: 500 }}>
              Enter and evaluate quotes side-by-side. Planora provides a neutral comparison of pricing, deliverables, and payment terms without declaring a "best" vendor.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              id="btn-add-quote-toggle"
              type="button"
              onClick={() => setIsAddingQuote(!isAddingQuote)}
              className="btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.825rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={15} />
              <span>{isAddingQuote ? 'Close Form' : 'Add New Quote'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              aria-label="Close quote comparison modal"
              style={{ padding: '0.4rem', color: '#78533E' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Add Quote Form */}
        {isAddingQuote && (
          <form
            onSubmit={handleAddQuoteSubmit}
            style={{
              padding: '1.5rem',
              background: 'rgba(254, 243, 199, 0.35)',
              border: '1.5px solid rgba(234, 88, 12, 0.3)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#140A05' }}>
              Record Vendor Proposal / Quote
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Vendor / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Skyline Catering Co."
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Total Quote Amount ({currency}) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  step={50}
                  value={quoteAmount}
                  onChange={(e) => setQuoteAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="e.g. 3500"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Availability Status
                </label>
                <select
                  value={String(availabilityConfirmed)}
                  onChange={(e) => setAvailabilityConfirmed(e.target.value === 'true' ? true : 'unconfirmed')}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                >
                  <option value="unconfirmed">Unconfirmed / Inquiry Sent</option>
                  <option value="true">Confirmed Available for Date</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Quote Expiration Date
                </label>
                <input
                  type="date"
                  value={quoteExpiryDate}
                  onChange={(e) => setQuoteExpiryDate(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Included Deliverables & Scope *
                </label>
                <textarea
                  rows={2}
                  required
                  value={includedServices}
                  onChange={(e) => setIncludedServices(e.target.value)}
                  placeholder="e.g. 4-course dinner, table linens, 4 servers, cleanup service"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Exclusions & Out-of-Scope (Optional)
                </label>
                <textarea
                  rows={2}
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                  placeholder="e.g. Alcohol / bar service, cake cutting fee, glassware rental"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Deposit Terms
                </label>
                <input
                  type="text"
                  value={depositRequired}
                  onChange={(e) => setDepositRequired(e.target.value)}
                  placeholder="e.g. 25% non-refundable upon signing"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Payment Schedule
                </label>
                <input
                  type="text"
                  value={paymentSchedule}
                  onChange={(e) => setPaymentSchedule(e.target.value)}
                  placeholder="e.g. 50% 30 days prior, 25% week of event"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Cancellation / Refund Policy
                </label>
                <input
                  type="text"
                  value={cancellationTerms}
                  onChange={(e) => setCancellationTerms(e.target.value)}
                  placeholder="e.g. Full refund up to 60 days before event"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#573523', marginBottom: '0.3rem' }}>
                  Additional Fees / Gratuities
                </label>
                <input
                  type="text"
                  value={additionalFees}
                  onChange={(e) => setAdditionalFees(e.target.value)}
                  placeholder="e.g. 18% gratuity + $150 delivery"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(234, 88, 12, 0.3)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
              <button
                type="button"
                onClick={() => setIsAddingQuote(false)}
                className="btn-secondary"
                style={{ padding: '0.45rem 1rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '0.45rem 1.25rem', fontWeight: 700 }}
              >
                Save Quote to Comparison
              </button>
            </div>
          </form>
        )}

        {/* Neutral Comparison Summary Card */}
        {quotes.length > 0 && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(254, 243, 199, 0.45))',
              border: '1.5px solid rgba(234, 88, 12, 0.28)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
              <Scale size={16} color="#C2410C" />
              <strong style={{ fontSize: '0.9rem', color: '#140A05' }}>
                Neutral Side-by-Side Comparison Summary
              </strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#2C1810', lineHeight: 1.5 }}>
              <div>
                <strong>Price Range:</strong> {comparison.priceDifferenceNote}
              </div>

              {comparison.missingDetailsList.length > 0 && (
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                  <strong>Unconfirmed Items:</strong>
                  <ul style={{ margin: '0.25rem 0 0 1.2rem', padding: 0 }}>
                    {comparison.missingDetailsList.map((m, idx) => (
                      <li key={idx} style={{ color: '#92400E' }}>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ fontSize: '0.8rem', color: '#78533E', fontStyle: 'italic', marginTop: '0.25rem' }}>
                💡 {comparison.neutralAdvice}
              </div>
            </div>
          </div>
        )}

        {/* Side-by-Side Comparison Cards */}
        {quotes.length === 0 ? (
          <div
            style={{
              padding: '2.5rem',
              textAlign: 'center',
              background: 'rgba(243, 244, 246, 0.5)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(234, 88, 12, 0.3)',
              marginBottom: '1.5rem',
            }}
          >
            <DollarSign size={32} color="#C2410C" style={{ margin: '0 auto 0.65rem auto', display: 'block' }} />
            <h3 style={{ margin: '0 0 0.35rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#140A05' }}>
              No Quotes Recorded Yet for {vendor.service}
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#78533E' }}>
              Click "Add New Quote" to record proposals as vendors reply to your inquiries.
            </p>
            <button
              type="button"
              onClick={() => setIsAddingQuote(true)}
              className="btn-primary"
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
            >
              Add First Quote
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fit, minmax(260px, 1fr))`,
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {quotes.map((q) => (
              <div
                key={q.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid rgba(234, 88, 12, 0.25)',
                  boxShadow: '0 4px 14px rgba(20, 10, 5, 0.05)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', fontWeight: 800, color: '#140A05' }}>
                        {q.vendorName}
                      </h4>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.35rem', fontWeight: 800, color: '#C2410C' }}>
                        {formatCurrency(q.quoteAmount, q.currency)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteQuote(q.id)}
                      className="btn-ghost"
                      aria-label={`Delete quote for ${q.vendorName}`}
                      style={{ padding: '0.35rem', color: '#DC2626' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#2C1810' }}>
                    <div>
                      <span style={{ color: '#78533E', fontWeight: 600 }}>Availability: </span>
                      {q.availabilityConfirmed === true ? (
                        <span className="badge" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#15803D', fontSize: '0.68rem', fontWeight: 700 }}>
                          ✓ Confirmed for Date
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(156, 163, 175, 0.2)', color: '#4B5563', fontSize: '0.68rem' }}>
                          Unconfirmed
                        </span>
                      )}
                    </div>

                    <div>
                      <span style={{ color: '#78533E', fontWeight: 600 }}>Deliverables Included:</span>
                      <p style={{ margin: '0.2rem 0 0 0', lineHeight: 1.4 }}>
                        {q.includedServices || <em style={{ color: '#9CA3AF' }}>Not provided</em>}
                      </p>
                    </div>

                    {q.exclusions && (
                      <div>
                        <span style={{ color: '#78533E', fontWeight: 600 }}>Explicit Exclusions:</span>
                        <p style={{ margin: '0.2rem 0 0 0', color: '#991B1B', lineHeight: 1.4 }}>
                          {q.exclusions}
                        </p>
                      </div>
                    )}

                    <div>
                      <span style={{ color: '#78533E', fontWeight: 600 }}>Deposit Terms: </span>
                      <span>{q.depositRequired || <em style={{ color: '#9CA3AF' }}>Not provided</em>}</span>
                    </div>

                    <div>
                      <span style={{ color: '#78533E', fontWeight: 600 }}>Payment Schedule: </span>
                      <span>{q.paymentSchedule || <em style={{ color: '#9CA3AF' }}>Not provided</em>}</span>
                    </div>

                    <div>
                      <span style={{ color: '#78533E', fontWeight: 600 }}>Cancellation Policy: </span>
                      <span>{q.cancellationTerms || <em style={{ color: '#9CA3AF' }}>Not provided</em>}</span>
                    </div>

                    {q.additionalFees && (
                      <div>
                        <span style={{ color: '#78533E', fontWeight: 600 }}>Additional Fees: </span>
                        <span>{q.additionalFees}</span>
                      </div>
                    )}

                    {q.quoteExpiryDate && (
                      <div>
                        <span style={{ color: '#78533E', fontWeight: 600 }}>Quote Expiration: </span>
                        <span>{new Date(q.quoteExpiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {onApplyQuotePrice && (
                  <button
                    type="button"
                    onClick={() => onApplyQuotePrice(vendor.id, q.quoteAmount)}
                    className="btn-secondary"
                    style={{
                      width: '100%',
                      padding: '0.45rem',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <Check size={13} />
                    <span>Apply Quote to Plan Range</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Professional Disclaimer */}
        <div
          style={{
            fontSize: '0.76rem',
            color: '#78533E',
            background: 'rgba(254, 243, 199, 0.45)',
            border: '1px solid rgba(217, 119, 6, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '0.65rem 0.85rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
          }}
        >
          <ShieldCheck size={15} color="#C2410C" style={{ flexShrink: 0 }} />
          <span>
            <strong>Neutral Comparison Notice:</strong> Planora never ranks vendors as "best" or endorses unverified service claims. All figures and terms reflect user-entered proposals. Always obtain official countersigned agreements.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
