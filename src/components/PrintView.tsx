import React from 'react';
import { EventPlan } from '../types';
import { formatCurrency, calculatePerGuest } from '../utils/deterministicMath';
import { formatIndianCurrency, calculateIndianCateringBreakdown, HINDI_TERMS } from '../utils/indianEventEngine';

interface PrintViewProps {
  plan: EventPlan;
}

export const PrintView: React.FC<PrintViewProps> = ({ plan }) => {
  const { basics, budget, timeline, runOfShow, vendors, themeConcept, indianIntelligence, language } = plan;
  const perGuest = calculatePerGuest(budget.totalBudget, basics.guestCount);
  const isIndian = indianIntelligence?.isEnabled || basics.currency === 'INR' || language === 'hi';
  const isHindi = language === 'hi';

  return (
    <div className="print-only" style={{ padding: '2rem', color: '#111827', fontFamily: 'sans-serif' }}>
      {/* Print Document Header */}
      <div style={{ borderBottom: '2px solid #ea580c', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: '0 0 0.25rem 0', color: '#9a3412' }}>
              {basics.title}
            </h1>
            <p style={{ fontSize: '11pt', color: '#4b5563', margin: 0 }}>
              Master Event Dossier & Operational Agenda • Planora AI Event Planner
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10pt', color: '#6b7280' }}>
            <div>Event Type: {basics.eventType.toUpperCase()}</div>
            <div>Date: {basics.eventDate || 'Flexible Timeline'}</div>
            <div>Attendees: {basics.guestCount}</div>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '6px', marginBottom: '1.5rem', borderLeft: '4px solid #ea580c' }}>
        <h3 style={{ fontSize: '12pt', fontWeight: 'bold', margin: '0 0 0.25rem 0', color: '#92400e' }}>
          Event Vision & Atmosphere
        </h3>
        <p style={{ fontSize: '10pt', margin: 0, color: '#78350f' }}>{plan.summary}</p>
        <p style={{ fontSize: '9pt', margin: '0.4rem 0 0 0', color: '#78350f' }}>
          <strong>Aesthetic Vibe:</strong> {basics.preferences.vibe} | <strong>Palette:</strong>{' '}
          {themeConcept.colorPalette?.map((c) => c.name).join(', ')}
        </p>
      </div>

      {/* Section 1: Financial Allocation */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
          1. Deterministic Financial Allocation (Total: {formatCurrency(budget.totalBudget, budget.currency)} | {formatCurrency(perGuest, budget.currency)}/guest)
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '9.5pt' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Category</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Allocated</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Split</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Scope / Notes</th>
            </tr>
          </thead>
          <tbody>
            {budget.items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>{item.category}</td>
                <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>
                  {formatCurrency(item.allocatedAmount, budget.currency)}
                </td>
                <td style={{ padding: '0.45rem 0.6rem' }}>{item.percentage}%</td>
                <td style={{ padding: '0.45rem 0.6rem', color: '#4b5563' }}>{item.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 2: Day-of Run of Show */}
      {runOfShow && runOfShow.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
            2. Day-of Event Hourly Run of Show
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Time</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Activity</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Lead Owner</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Location</th>
              </tr>
            </thead>
            <tbody>
              {runOfShow.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.45rem 0.6rem', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {item.time}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>{item.activity}</td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>{item.owner || '—'}</td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>{item.location || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 3: Vendor Checklist & Contract Schedule */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
          3. Vendor Partners, Contracts & Milestone Schedule
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '9.5pt' }}>
          <thead>
            <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Service</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Booking Status</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Contract Status</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Deposit ($)</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Deposit Due</th>
              <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Contact / Notes</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>{v.service}</td>
                <td style={{ padding: '0.45rem 0.6rem', textTransform: 'capitalize' }}>
                  {v.status.replace('_', ' ')}
                </td>
                <td style={{ padding: '0.45rem 0.6rem', textTransform: 'capitalize', fontWeight: 600 }}>
                  {v.contractStatus || 'Needed'}
                </td>
                <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>
                  {v.depositAmount ? formatCurrency(v.depositAmount, budget.currency) : '—'}
                </td>
                <td style={{ padding: '0.45rem 0.6rem' }}>
                  {v.depositDueDate || '—'}
                </td>
                <td style={{ padding: '0.45rem 0.6rem', color: '#4b5563' }}>
                  {v.contactName ? `${v.contactName} (${v.contactEmail || ''})` : v.notes || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 4: Milestone Tasks */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
          4. Milestone Roadmap Checklist
        </h2>
        {timeline.map((sec) => (
          <div key={sec.id} style={{ marginTop: '0.85rem' }}>
            <h4 style={{ fontSize: '10.5pt', color: '#9a3412', margin: '0 0 0.35rem 0' }}>
              {sec.period}
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '9pt', color: '#374151' }}>
              {sec.tasks.map((t) => (
                <li key={t.id} style={{ marginBottom: '0.25rem' }}>
                  [{t.completed ? 'X' : ' '}] {t.title} ({t.priority} Priority - {t.category})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Section 5: Guest Roster & Seating Assignments */}
      {plan.guests && plan.guests.length > 0 && (
        <div style={{ marginBottom: '2rem', pageBreakBefore: 'auto' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
            5. Guest Roster, RSVP Status & Table Seating
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Guest Name</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Group</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>RSVP</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Plus-Ones</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Dietary & Allergies</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Table Assigned</th>
              </tr>
            </thead>
            <tbody>
              {plan.guests.map((g) => {
                const assignedTable = plan.tables?.find((t) => t.id === g.tableId);
                return (
                  <tr key={g.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>{g.name}</td>
                    <td style={{ padding: '0.45rem 0.6rem', textTransform: 'capitalize' }}>{g.group || '—'}</td>
                    <td style={{ padding: '0.45rem 0.6rem', textTransform: 'capitalize', fontWeight: 500 }}>
                      {g.rsvpStatus}
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem', textAlign: 'center' }}>{g.plusOnes || 0}</td>
                    <td style={{ padding: '0.45rem 0.6rem' }}>
                      <span style={{ textTransform: 'capitalize' }}>{g.dietary}</span>
                      {g.notes ? ` (${g.notes})` : ''}
                    </td>
                    <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>
                      {assignedTable ? assignedTable.name : 'Unassigned'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 6: Real-Time Expense & Receipt Audit Trail */}
      {plan.expenses && plan.expenses.length > 0 && (
        <div style={{ pageBreakBefore: 'auto' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
            6. Itemized Expense & Payment Audit Trail
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Date</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Title / Payee</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Category</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Amount</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Method</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {plan.expenses.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>{exp.paymentDate}</td>
                  <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>
                    {exp.vendorName}
                    {exp.receiptNumber ? <span style={{ color: '#4b5563', fontWeight: 400 }}> (#{exp.receiptNumber})</span> : ''}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>{exp.category}</td>
                  <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace', fontWeight: 700 }}>
                    {formatCurrency(exp.amount, budget.currency)}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem', textTransform: 'capitalize' }}>{exp.paymentMethod.replace('_', ' ')}</td>
                  <td style={{ padding: '0.45rem 0.6rem', textTransform: 'capitalize', fontWeight: 600 }}>{exp.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 7: Indian Event Intelligence — Multi-Day Function Sequencing */}
      {indianIntelligence?.isEnabled && indianIntelligence.functions && indianIntelligence.functions.length > 0 && (
        <div style={{ marginBottom: '2rem', pageBreakBefore: 'auto' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
            {isHindi ? '7. भारतीय अनुष्ठान एवं कार्यक्रम क्रम (Multi-Function Sequencing)' : '7. Indian Cultural Function Sequencing & Ceremony Schedule'}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Function</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Hindi / Ritual</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Date & Timing</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Venue / Space</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Dress Code</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Expected Guests</th>
              </tr>
            </thead>
            <tbody>
              {indianIntelligence.functions.map((fn) => (
                <tr key={fn.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700 }}>{fn.title}</td>
                  <td style={{ padding: '0.45rem 0.6rem', color: '#9a3412', fontWeight: 600 }}>{fn.hindiTitle || '—'}</td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>
                    {fn.date ? `${fn.date} • ` : ''}{fn.startTime} - {fn.endTime}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>{fn.venueName || '—'}</td>
                  <td style={{ padding: '0.45rem 0.6rem', color: '#4b5563' }}>{fn.dressCode || 'Traditional'}</td>
                  <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace', fontWeight: 600 }}>
                    {fn.expectedGuests}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 8: Indian Catering & 10% Unannounced Guest Buffer */}
      {indianIntelligence?.isEnabled && indianIntelligence.catering && (
        <div style={{ marginBottom: '2rem', pageBreakBefore: 'auto' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
            {isHindi ? '8. खानपान एवं प्लेट सुरक्षा गणना (Catering Breakdown & +10% Buffer)' : '8. Indian Catering, Plate Calculator & Food Security (+10% Unannounced Buffer)'}
          </h2>
          {(() => {
            const breakdown = calculateIndianCateringBreakdown(basics.guestCount, indianIntelligence.catering);
            return (
              <div style={{ marginTop: '0.75rem', fontSize: '9.5pt' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                  <div>
                    <span style={{ fontSize: '8pt', color: '#6b7280', textTransform: 'uppercase' }}>Guaranteed Guests</span>
                    <div style={{ fontSize: '12pt', fontWeight: 700 }}>{breakdown.guaranteedPlates}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '8pt', color: '#b45309', textTransform: 'uppercase' }}>+10% Buffer Plates</span>
                    <div style={{ fontSize: '12pt', fontWeight: 700, color: '#b45309' }}>+{breakdown.bufferPlates}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '8pt', color: '#15803d', textTransform: 'uppercase' }}>Total Food Security Plates</span>
                    <div style={{ fontSize: '12pt', fontWeight: 800, color: '#15803d' }}>{breakdown.totalPreparedPlates}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '8pt', color: '#6b7280', textTransform: 'uppercase' }}>Total Food Investment</span>
                    <div style={{ fontSize: '12pt', fontWeight: 800 }}>{formatCurrency(breakdown.totalCateringEstimate, budget.currency)}</div>
                  </div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9.5pt' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                      <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Dietary Line</th>
                      <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Plates Ordered</th>
                      <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Estimated Food Cost</th>
                      <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Special Protocols</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>Pure Vegetarian (शाकाहारी)</td>
                      <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700 }}>{breakdown.vegPlates}</td>
                      <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>
                        {formatCurrency(breakdown.vegPlates * (indianIntelligence.catering.platePriceEstimate || 1000), budget.currency)}
                      </td>
                      <td style={{ padding: '0.45rem 0.6rem', color: '#4b5563' }}>Standard pure vegetarian live counters and buffet</td>
                    </tr>
                    {breakdown.jainPlates > 0 && (
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600, color: '#b45309' }}>Jain (जैन - Strict)</td>
                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700 }}>{breakdown.jainPlates}</td>
                        <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>
                          {formatCurrency(breakdown.jainPlates * (indianIntelligence.catering.platePriceEstimate || 1000), budget.currency)}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem', color: '#b45309' }}>
                          Strict exclusion of root vegetables (onion, garlic, potato). Isolated prep counters.
                        </td>
                      </tr>
                    )}
                    {breakdown.nonVegPlates > 0 && (
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>Non-Vegetarian / Halal</td>
                        <td style={{ padding: '0.45rem 0.6rem', fontWeight: 700 }}>{breakdown.nonVegPlates}</td>
                        <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>
                          {formatCurrency(breakdown.nonVegPlates * (indianIntelligence.catering.platePriceEstimate || 1000), budget.currency)}
                        </td>
                        <td style={{ padding: '0.45rem 0.6rem', color: '#4b5563' }}>Dedicated live grilling and kebab counters</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {/* Section 9: Statutory Legal Permits & Truth Verification Audit */}
      {indianIntelligence?.isEnabled && indianIntelligence.permits && indianIntelligence.permits.length > 0 && (
        <div style={{ marginBottom: '2rem', pageBreakBefore: 'auto' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
            {isHindi ? '9. वैधानिक अनुमतियां एवं सत्यापन चेकलिस्ट (Statutory Legal Permits & NOC Verification)' : '9. Statutory Legal Permits & Verification Checklist (Truth Badges)'}
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem', fontSize: '9.5pt' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Permit Name</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Issuing Authority</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Guidance / Notes</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Verification Status</th>
                <th style={{ padding: '0.4rem 0.6rem', borderBottom: '1px solid #d1d5db' }}>Estimated Fee</th>
              </tr>
            </thead>
            <tbody>
              {indianIntelligence.permits.map((pm) => (
                <tr key={pm.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.45rem 0.6rem', fontWeight: 600 }}>{pm.title}</td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>{pm.authority}</td>
                  <td style={{ padding: '0.45rem 0.6rem', fontSize: '8.5pt', color: '#4b5563' }}>{pm.guidance}</td>
                  <td style={{ padding: '0.45rem 0.6rem' }}>
                    {pm.status === 'verified' ? (
                      <span style={{ color: '#15803d', fontWeight: 700 }}>✅ VERIFIED ({pm.documentNumber || 'Official NOC Attached'})</span>
                    ) : pm.status === 'not_applicable' ? (
                      <span style={{ color: '#6b7280' }}>— NOT REQUIRED</span>
                    ) : (
                      <span style={{ color: '#b45309', fontWeight: 700 }}>⚠️ TO VERIFY (Pending Verification)</span>
                    )}
                  </td>
                  <td style={{ padding: '0.45rem 0.6rem', fontFamily: 'monospace' }}>
                    {pm.estimatedFeeInr ? formatCurrency(pm.estimatedFeeInr, budget.currency) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section 10: Power & Weather Safeguards */}
      {indianIntelligence?.isEnabled && indianIntelligence.backups && (
        <div style={{ marginBottom: '2rem', pageBreakBefore: 'auto' }}>
          <h2 style={{ fontSize: '14pt', borderBottom: '1px solid #d1d5db', paddingBottom: '0.35rem', color: '#1f2937' }}>
            {isHindi ? '10. बिजली बैकअप एवं मौसम सुरक्षा (Power Backup & Weather Contingency)' : '10. Power Backup & Weather Contingency Safeguards'}
          </h2>
          <div style={{ marginTop: '0.75rem', fontSize: '9.5pt', background: '#f9fafb', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div>
                <strong>Silent DG Dual Set Generator:</strong>{' '}
                {indianIntelligence.backups.hasDualDGSet ? 'Required (Dual Silent Setup)' : 'Standard Grid'}
              </div>
              <div>
                <strong>Waterproof German Hangar:</strong>{' '}
                {indianIntelligence.backups.pandalWaterproofing ? 'Mandatory for Monsoon / Outdoor' : 'Not Required'}
              </div>
              <div>
                <strong>Elderly Wheelchair Accessibility:</strong>{' '}
                {indianIntelligence.backups.elderlyWheelchairAccess ? 'Enforced for Mandap & Dining' : 'Standard'}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
              <div>
                <strong>High-Pressure Mist Fans:</strong>{' '}
                {indianIntelligence.backups.summerMistFans ? 'Active for Summer Lawn' : 'Not Needed'}
              </div>
              <div>
                <strong>Winter Patio Heaters:</strong>{' '}
                {indianIntelligence.backups.winterPatioHeaters ? 'Active for Winter North India' : 'Not Needed'}
              </div>
              <div>
                <strong>Dining Proximity Seating:</strong>{' '}
                {indianIntelligence.backups.elderlyDiningProximity ? 'Reserved Close to Buffet' : 'Standard'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
