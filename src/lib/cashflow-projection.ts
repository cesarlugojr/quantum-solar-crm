/**
 * Quantum Solar Enterprises - Cash Flow Projection Engine
 * ========================================================
 * Generates daily cash flow projections based on recurring payment schedules.
 * TypeScript implementation of the Python cash flow algorithm.
 */

import type {
  CashFlowLineItem,
  CashFlowManualEntry,
  CashFlowDailyProjection,
  CashFlowSummary,
  CashFlowProjectionResult,
  CashFlowFrequency,
  CashFlowCategory,
} from '@/types/crm';

/**
 * Check if a line item triggers on a given date
 */
export function triggersOn(item: CashFlowLineItem, date: Date): boolean {
  if (!item.active) return false;

  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  const dayOfMonth = date.getDate();

  switch (item.frequency) {
    case 'daily':
      return true;

    case 'weekday_only':
      // Monday = 1, Friday = 5
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case 'weekly':
      if (item.anchor_date) {
        const anchor = new Date(item.anchor_date);
        const diffTime = date.getTime() - anchor.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % 7 === 0;
      }
      return false;

    case 'biweekly':
      if (item.anchor_date) {
        const anchor = new Date(item.anchor_date);
        const diffTime = date.getTime() - anchor.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays % 14 === 0;
      }
      return false;

    case 'monthly':
      if (item.anchor_day) {
        // Handle end-of-month edge cases
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const targetDay = Math.min(item.anchor_day, lastDayOfMonth);
        return dayOfMonth === targetDay;
      }
      return false;

    case 'semi_monthly':
      if (item.anchor_day && item.second_day) {
        const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const targetDay1 = Math.min(item.anchor_day, lastDayOfMonth);
        const targetDay2 = Math.min(item.second_day, lastDayOfMonth);
        return dayOfMonth === targetDay1 || dayOfMonth === targetDay2;
      }
      return false;

    case 'one_time':
      if (item.anchor_date) {
        const anchor = new Date(item.anchor_date);
        return (
          date.getFullYear() === anchor.getFullYear() &&
          date.getMonth() === anchor.getMonth() &&
          date.getDate() === anchor.getDate()
        );
      }
      return false;

    default:
      return false;
  }
}

/**
 * Calculate transactions for a specific date
 */
export function calculateDailyTransactions(
  date: Date,
  lineItems: CashFlowLineItem[],
  manualEntries: CashFlowManualEntry[]
): Record<string, number> {
  const transactions: Record<string, number> = {};
  const dateStr = date.toISOString().split('T')[0];

  // Check recurring items
  for (const item of lineItems) {
    if (triggersOn(item, date)) {
      if (transactions[item.name]) {
        transactions[item.name] += item.amount;
      } else {
        transactions[item.name] = item.amount;
      }
    }
  }

  // Add manual entries for this date
  for (const entry of manualEntries) {
    if (entry.date === dateStr) {
      if (transactions[entry.name]) {
        transactions[entry.name] += entry.amount;
      } else {
        transactions[entry.name] = entry.amount;
      }
    }
  }

  return transactions;
}

/**
 * Calculate weekly expense amount for a line item (for summary)
 */
export function calculateWeeklyExpense(item: CashFlowLineItem): number {
  if (item.amount >= 0) return 0; // Only expenses (negative amounts)

  switch (item.frequency) {
    case 'daily':
      return item.amount * 7;
    case 'weekday_only':
      return item.amount * 5;
    case 'weekly':
      return item.amount;
    case 'biweekly':
      return item.amount / 2;
    case 'monthly':
      return item.amount / 4.33;
    case 'semi_monthly':
      return (item.amount * 2) / 4.33;
    default:
      return 0;
  }
}

/**
 * Generate cash flow projection
 */
export function generateProjection(
  startingBalance: number,
  startDate: Date,
  endDate: Date,
  lineItems: CashFlowLineItem[],
  manualEntries: CashFlowManualEntry[] = []
): CashFlowProjectionResult {
  const dailyProjections: CashFlowDailyProjection[] = [];
  let runningBalance = startingBalance;
  let lowestBalance = startingBalance;
  let lowestBalanceDate = startDate.toISOString().split('T')[0];
  let negativeDays = 0;
  let firstNegativeDate: string | undefined;
  let firstNegativeBalance: number | undefined;
  let totalIncome = 0;
  let totalExpenses = 0;

  // Generate daily projections
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const transactions = calculateDailyTransactions(currentDate, lineItems, manualEntries);
    const dailyTotal = Object.values(transactions).reduce((sum, val) => sum + val, 0);

    // Track income and expenses
    for (const amount of Object.values(transactions)) {
      if (amount > 0) {
        totalIncome += amount;
      } else {
        totalExpenses += Math.abs(amount);
      }
    }

    runningBalance += dailyTotal;

    // Track lowest balance
    if (runningBalance < lowestBalance) {
      lowestBalance = runningBalance;
      lowestBalanceDate = dateStr;
    }

    // Track negative days
    if (runningBalance < 0) {
      negativeDays++;
      if (!firstNegativeDate) {
        firstNegativeDate = dateStr;
        firstNegativeBalance = runningBalance;
      }
    }

    dailyProjections.push({
      date: dateStr,
      balance: runningBalance,
      dailyChange: dailyTotal,
      transactions,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Calculate weekly expense breakdown
  const weeklyExpenseBreakdown: Record<string, number> = {};
  for (const item of lineItems) {
    if (item.amount < 0 && item.active) {
      const weeklyAmount = calculateWeeklyExpense(item);
      if (weeklyAmount !== 0) {
        weeklyExpenseBreakdown[item.name] = weeklyAmount;
      }
    }
  }

  const summary: CashFlowSummary = {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    startingBalance,
    endingBalance: runningBalance,
    netChange: runningBalance - startingBalance,
    lowestBalance,
    lowestBalanceDate,
    negativeDays,
    firstNegativeDate,
    firstNegativeBalance,
    totalIncome,
    totalExpenses,
    weeklyExpenseBreakdown,
  };

  return {
    dailyProjections,
    summary,
  };
}

/**
 * Create default Quantum Solar line items
 * Based on the original Python implementation
 */
export function createDefaultLineItems(): Omit<CashFlowLineItem, 'id' | 'created_at'>[] {
  return [
    // Daily expenses
    {
      name: 'Forecasted Fuel',
      amount: -100,
      frequency: 'daily' as CashFlowFrequency,
      category: 'operations' as CashFlowCategory,
      active: true,
      notes: 'Daily fuel expense estimate',
    },
    {
      name: 'Marketing Budget',
      amount: -428.57,
      frequency: 'daily' as CashFlowFrequency,
      category: 'marketing' as CashFlowCategory,
      active: true,
      notes: '$3,000/week ÷ 7 days',
    },

    // Weekday-only expenses (MCA payments)
    {
      name: 'MCA Payments',
      amount: -388,
      frequency: 'weekday_only' as CashFlowFrequency,
      category: 'financing' as CashFlowCategory,
      active: true,
      notes: 'Merchant Cash Advance - Mon-Fri only',
    },

    // Weekly expenses (every Monday)
    {
      name: 'Graybar',
      amount: -250,
      frequency: 'weekly' as CashFlowFrequency,
      category: 'materials' as CashFlowCategory,
      anchor_date: '2025-10-20', // Monday
      active: true,
      notes: 'Weekly supply payment',
    },
    {
      name: 'Metro Electric Supply',
      amount: -250,
      frequency: 'weekly' as CashFlowFrequency,
      category: 'materials' as CashFlowCategory,
      anchor_date: '2025-10-20', // Monday
      active: true,
      notes: 'Weekly supply payment',
    },

    // Bi-weekly expenses
    {
      name: 'Forecasted Payroll',
      amount: -18892.31,
      frequency: 'biweekly' as CashFlowFrequency,
      category: 'payroll' as CashFlowCategory,
      anchor_date: '2025-10-27',
      active: true,
      notes: 'Bi-weekly payroll',
    },
    {
      name: 'Payroll Taxes',
      amount: -1500,
      frequency: 'biweekly' as CashFlowFrequency,
      category: 'payroll' as CashFlowCategory,
      anchor_date: '2025-10-20',
      active: true,
      notes: 'Bi-weekly payroll taxes',
    },
    {
      name: 'Forecasted Flights',
      amount: -50,
      frequency: 'biweekly' as CashFlowFrequency,
      category: 'operations' as CashFlowCategory,
      anchor_date: '2025-10-23',
      active: true,
      notes: 'Travel expense estimate',
    },

    // Monthly expenses (by day of month)
    {
      name: 'Company Cam',
      amount: -102,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'software' as CashFlowCategory,
      anchor_day: 19,
      active: true,
      notes: 'Job documentation software',
    },
    {
      name: 'Clicklease',
      amount: -1053.68,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'financing' as CashFlowCategory,
      anchor_day: 22,
      active: true,
      notes: 'Equipment lease',
    },
    {
      name: 'Lightstream',
      amount: -477.66,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'financing' as CashFlowCategory,
      anchor_day: 28,
      active: true,
      notes: 'Loan payment',
    },
    {
      name: 'Quickbooks',
      amount: -233,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'software' as CashFlowCategory,
      anchor_day: 3,
      active: true,
      notes: 'Accounting software',
    },
    {
      name: 'Next Business Insurance',
      amount: -232.41,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'operations' as CashFlowCategory,
      anchor_day: 3,
      active: true,
      notes: 'Business insurance premium',
    },
    {
      name: 'Chevy Car Payment',
      amount: -1195.62,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'vehicles' as CashFlowCategory,
      anchor_day: 14,
      active: true,
      notes: 'Vehicle payment',
    },
    {
      name: 'Ford Truck Payment',
      amount: -1332.32,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'vehicles' as CashFlowCategory,
      anchor_day: 15,
      active: true,
      notes: 'Vehicle payment',
    },
    {
      name: 'Affirm',
      amount: -289.11,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'financing' as CashFlowCategory,
      anchor_day: 18,
      active: true,
      notes: 'Financing payment',
    },
    {
      name: 'House Rent',
      amount: -1200,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'rent' as CashFlowCategory,
      anchor_day: 1,
      active: true,
      notes: 'Office/storage rent',
    },
    {
      name: 'Sparklight Internet',
      amount: -91.29,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'utilities' as CashFlowCategory,
      anchor_day: 15,
      active: true,
      notes: 'Internet service',
    },
    {
      name: 'Google Suite',
      amount: -132,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'software' as CashFlowCategory,
      anchor_day: 1,
      active: true,
      notes: 'Google Workspace',
    },
    {
      name: 'Claude',
      amount: -200,
      frequency: 'monthly' as CashFlowFrequency,
      category: 'software' as CashFlowCategory,
      anchor_day: 29,
      active: true,
      notes: 'AI assistant subscription',
    },

    // Semi-monthly (vehicle insurance)
    {
      name: 'Vehicle Insurance',
      amount: -629.73,
      frequency: 'semi_monthly' as CashFlowFrequency,
      category: 'vehicles' as CashFlowCategory,
      anchor_day: 14,
      second_day: 16,
      active: true,
      notes: 'Semi-monthly vehicle insurance',
    },
  ];
}

/**
 * Create default manual entries for known income/payments
 */
export function createDefaultManualEntries(): Omit<CashFlowManualEntry, 'id' | 'created_at'>[] {
  return [
    // Historical/confirmed GoodPWR payments
    { date: '2025-10-20', name: 'GoodPWR Payment', amount: 13385.10, category: 'income' as CashFlowCategory },
    { date: '2025-10-23', name: 'GoodPWR Payment', amount: 5864.50, category: 'income' as CashFlowCategory },
    { date: '2025-10-27', name: 'GoodPWR Payment', amount: 21314.38, category: 'income' as CashFlowCategory },
    { date: '2025-11-18', name: 'GoodPWR Payment', amount: 25827.63, category: 'income' as CashFlowCategory },
    { date: '2025-12-09', name: 'GoodPWR Payment', amount: 20890.52, category: 'income' as CashFlowCategory },

    // Forecasted GoodPWR payments
    { date: '2025-11-03', name: 'Forecasted GoodPWR Payment', amount: 25571.99, category: 'income' as CashFlowCategory },
    { date: '2025-11-06', name: 'Forecasted GoodPWR Payment', amount: 3606.00, category: 'income' as CashFlowCategory },
    { date: '2025-11-11', name: 'Forecasted GoodPWR Payment', amount: 20804.00, category: 'income' as CashFlowCategory },

    // Job materials (one-time entries)
    { date: '2025-10-20', name: 'Forecasted Job Materials', amount: -465.84, category: 'materials' as CashFlowCategory },
    { date: '2025-10-21', name: 'Forecasted Job Materials', amount: -2551.50, category: 'materials' as CashFlowCategory },
    { date: '2025-10-27', name: 'Forecasted Job Materials', amount: -465.84, category: 'materials' as CashFlowCategory },
  ];
}

/**
 * Format currency for display
 */
export function formatCashFlowCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * Get color class based on amount (positive/negative)
 */
export function getAmountColorClass(amount: number): string {
  if (amount > 0) return 'text-green-500';
  if (amount < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Get background color class based on balance status
 */
export function getBalanceStatusClass(balance: number): string {
  if (balance < 0) return 'bg-red-900/20 border-red-500';
  if (balance < 5000) return 'bg-yellow-900/20 border-yellow-500';
  return 'bg-green-900/20 border-green-500';
}
