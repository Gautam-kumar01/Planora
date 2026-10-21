import React from 'react';
import { EventPlan } from '../types';
import { formatCurrency, calculatePerGuest } from '../utils/deterministicMath';

interface PrintViewProps {
  plan: EventPlan;
}

export const PrintView: React.FC<PrintViewProps> = ({ plan }) => {
  const { basics, budget, timeline, runOfShow, vendors, themeConcept } = plan;
  const perGuest = calculatePerGuest(budget.totalBudget, basics.guestCount);

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
    </div>
  );
};
