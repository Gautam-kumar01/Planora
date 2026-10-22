import { VendorQuote } from '../types';
import { formatCurrency } from './deterministicMath';

export interface NeutralQuoteComparisonSummary {
  priceDifferenceNote: string;
  depositComparison: string;
  scopeHighlights: string[];
  missingDetailsList: string[];
  neutralAdvice: string;
}

/**
 * Feature 3: Neutral Vendor Quote Comparison Engine
 * Compares 2 or more user-entered vendor quotes factually and neutrally.
 *
 * Strict Rules:
 * - Never rank any vendor as 'best' or 'recommended'.
 * - Never claim a vendor is 'verified' or has official endorsement.
 * - Never invent or assume missing quote details; mark blank fields as 'Not provided'.
 */
export function generateNeutralQuoteComparison(
  quotes: VendorQuote[],
  serviceName: string
): NeutralQuoteComparisonSummary {
  if (!quotes || quotes.length === 0) {
    return {
      priceDifferenceNote: 'No quotes entered yet.',
      depositComparison: 'No deposit information provided.',
      scopeHighlights: [],
      missingDetailsList: ['No vendor quotes submitted for comparison.'],
      neutralAdvice: 'Manually add 2 or more vendor quotes to compare pricing, inclusions, and payment schedules.',
    };
  }

  if (quotes.length === 1) {
    const q = quotes[0];
    return {
      priceDifferenceNote: `Single quote recorded: ${q.vendorName} at ${formatCurrency(q.quoteAmount, q.currency)}.`,
      depositComparison: q.depositRequired || 'Not specified',
      scopeHighlights: [q.includedServices || 'Scope details not provided'],
      missingDetailsList: [
        ...(!q.cancellationTerms ? [`${q.vendorName}: Cancellation terms not provided`] : []),
        ...(!q.paymentSchedule ? [`${q.vendorName}: Payment schedule not provided`] : []),
      ],
      neutralAdvice: 'Add a second quote to compare pricing differences and contractual terms side-by-side.',
    };
  }

  // 1. Price difference note
  const sortedByPrice = [...quotes].sort((a, b) => a.quoteAmount - b.quoteAmount);
  const lowest = sortedByPrice[0];
  const highest = sortedByPrice[sortedByPrice.length - 1];
  const diff = highest.quoteAmount - lowest.quoteAmount;

  const priceDifferenceNote =
    diff === 0
      ? `All ${quotes.length} vendors submitted matching quotes of ${formatCurrency(lowest.quoteAmount, lowest.currency)}.`
      : `Quotes range from ${formatCurrency(lowest.quoteAmount, lowest.currency)} (${lowest.vendorName}) to ${formatCurrency(
          highest.quoteAmount,
          highest.currency
        )} (${highest.vendorName}), a variance of ${formatCurrency(diff, lowest.currency)}.`;

  // 2. Deposit comparison
  const depositComparison = quotes
    .map(
      (q) =>
        `• ${q.vendorName}: ${q.depositRequired || 'Deposit terms not provided'}${
          q.paymentSchedule ? ` (Schedule: ${q.paymentSchedule})` : ''
        }`
    )
    .join('\n');

  // 3. Scope highlights
  const scopeHighlights = quotes.map(
    (q) =>
      `• ${q.vendorName}: Included: ${q.includedServices || 'Not provided'} | Excluded: ${
        q.exclusions || 'None specified'
      }`
  );

  // 4. Missing details
  const missingDetailsList: string[] = [];
  quotes.forEach((q) => {
    const missing: string[] = [];
    if (!q.depositRequired) missing.push('deposit terms');
    if (!q.paymentSchedule) missing.push('payment milestones');
    if (!q.cancellationTerms) missing.push('cancellation policy');
    if (!q.quoteExpiryDate) missing.push('quote expiry date');
    if (!q.exclusions) missing.push('explicit service exclusions');
    if (q.availabilityConfirmed === 'unconfirmed') missing.push('confirmed date availability');

    if (missing.length > 0) {
      missingDetailsList.push(`${q.vendorName}: Missing ${missing.join(', ')}.`);
    }
  });

  // 5. Neutral Advice
  const neutralAdvice = `Review contractual terms carefully before making deposits. Clarify any ${
    missingDetailsList.length > 0 ? 'unconfirmed or missing items' : 'overtime fees and delivery setup windows'
  } directly in writing with each provider.`;

  return {
    priceDifferenceNote,
    depositComparison,
    scopeHighlights,
    missingDetailsList,
    neutralAdvice,
  };
}
