'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Plus,
  Settings,
  Download,
  RefreshCw,
  Save,
  Undo2,
  Redo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  createDefaultLineItems,
  createDefaultManualEntries,
  formatCashFlowCurrency,
  getAmountColorClass,
} from '@/lib/cashflow-projection';

// Editable cell component
interface EditableCellProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  onToggleSkip: () => void;
  isIncome?: boolean;
  isForecasted?: boolean;
  isSkipped?: boolean;
}

function EditableCell({ value, onChange, onToggleSkip, isIncome, isForecasted, isSkipped }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleDoubleClick = () => {
    setEditValue(value ? Math.abs(value).toString() : '');
    setIsEditing(true);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (value) {
      onToggleSkip();
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue !== 0) {
      // Apply sign based on whether it's income or expense
      onChange(isIncome ? Math.abs(numValue) : -Math.abs(numValue));
    } else if (editValue === '' || editValue === '0') {
      onChange(undefined);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Determine color based on type
  const getValueColor = () => {
    if (!value) return 'text-gray-600';
    if (isSkipped) return 'text-gray-500'; // Skipped = muted gray
    if (isForecasted && value > 0) return 'text-yellow-500'; // Forecasted income = yellow/orange
    if (isIncome || value > 0) return 'text-green-400'; // Confirmed income = green
    return 'text-red-400'; // Expenses = red
  };

  if (isEditing) {
    return (
      <input
        type="number"
        step="0.01"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full bg-gray-800 border border-blue-500 text-white text-center p-1 text-sm font-mono rounded"
      />
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
      title={value ? (isSkipped ? 'Right-click to include in calculation' : 'Right-click to skip from calculation') : ''}
      className={`cursor-pointer hover:bg-gray-700/50 p-1 rounded ${getValueColor()} ${isSkipped ? 'line-through opacity-60' : ''}`}
    >
      {value ? formatCashFlowCurrency(value) : '-'}
    </div>
  );
}

export default function CashFlowPage() {
  // State for projection settings
  const [startingBalance, setStartingBalance] = useState(10867.86);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const future = new Date();
    future.setMonth(future.getMonth() + 3);
    return future.toISOString().split('T')[0];
  });

  // Spreadsheet data: { [lineItemName]: { [date]: amount } }
  const [spreadsheetData, setSpreadsheetData] = useState<Record<string, Record<string, number>>>({});
  const [lineItemNames, setLineItemNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  // Skipped cells (excluded from calculation but value preserved)
  const [skippedCells, setSkippedCells] = useState<Record<string, Record<string, boolean>>>({});

  // Undo/Redo history
  type HistoryState = {
    spreadsheetData: Record<string, Record<string, number>>;
    lineItemNames: string[];
    skippedCells: Record<string, Record<string, boolean>>;
  };
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const maxHistoryLength = 50;

  // Dialog states
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [isAddRowDialogOpen, setIsAddRowDialogOpen] = useState(false);
  const [newRowName, setNewRowName] = useState('');
  const [newRowIsIncome, setNewRowIsIncome] = useState(false);

  // Save current state to history before making changes
  const saveToHistory = useCallback(() => {
    const currentState: HistoryState = {
      spreadsheetData: JSON.parse(JSON.stringify(spreadsheetData)),
      lineItemNames: [...lineItemNames],
      skippedCells: JSON.parse(JSON.stringify(skippedCells)),
    };

    setHistory((prev) => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(currentState);
      // Limit history length
      if (newHistory.length > maxHistoryLength) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, maxHistoryLength - 1));
  }, [spreadsheetData, lineItemNames, skippedCells, historyIndex, maxHistoryLength]);

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setSpreadsheetData(JSON.parse(JSON.stringify(prevState.spreadsheetData)));
      setLineItemNames([...prevState.lineItemNames]);
      setSkippedCells(JSON.parse(JSON.stringify(prevState.skippedCells || {})));
      setHistoryIndex((prev) => prev - 1);
      setHasChanges(true);
    }
  }, [history, historyIndex]);

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setSpreadsheetData(JSON.parse(JSON.stringify(nextState.spreadsheetData)));
      setLineItemNames([...nextState.lineItemNames]);
      setSkippedCells(JSON.parse(JSON.stringify(nextState.skippedCells || {})));
      setHistoryIndex((prev) => prev + 1);
      setHasChanges(true);
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Generate dates array
  const dates = useMemo(() => {
    const result: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      result.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return result.slice(0, 90); // Max 90 days
  }, [startDate, endDate]);

  // Initialize with defaults
  const initializeDefaults = useCallback(() => {
    const defaultLineItems = createDefaultLineItems();
    const defaultManualEntries = createDefaultManualEntries();

    // Build spreadsheet data from line items and manual entries
    const data: Record<string, Record<string, number>> = {};
    const names: string[] = [];

    // Add recurring line items
    defaultLineItems.forEach((item) => {
      if (!names.includes(item.name)) {
        names.push(item.name);
        data[item.name] = {};
      }
    });

    // Add manual entry names
    defaultManualEntries.forEach((entry) => {
      if (!names.includes(entry.name)) {
        names.push(entry.name);
        data[entry.name] = {};
      }
    });

    // Calculate which dates each item triggers on
    dates.forEach((dateStr) => {
      const date = new Date(dateStr);

      defaultLineItems.forEach((item) => {
        if (!item.active) return;

        let triggers = false;
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();

        switch (item.frequency) {
          case 'daily':
            triggers = true;
            break;
          case 'weekday_only':
            triggers = dayOfWeek >= 1 && dayOfWeek <= 5;
            break;
          case 'weekly':
            if (item.anchor_date) {
              const anchor = new Date(item.anchor_date);
              const diffDays = Math.floor((date.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
              triggers = diffDays >= 0 && diffDays % 7 === 0;
            }
            break;
          case 'biweekly':
            if (item.anchor_date) {
              const anchor = new Date(item.anchor_date);
              const diffDays = Math.floor((date.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
              triggers = diffDays >= 0 && diffDays % 14 === 0;
            }
            break;
          case 'monthly':
            if (item.anchor_day) {
              const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
              triggers = dayOfMonth === Math.min(item.anchor_day, lastDay);
            }
            break;
          case 'semi_monthly':
            if (item.anchor_day && item.second_day) {
              const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
              triggers = dayOfMonth === Math.min(item.anchor_day, lastDay) ||
                         dayOfMonth === Math.min(item.second_day, lastDay);
            }
            break;
        }

        if (triggers) {
          data[item.name][dateStr] = item.amount;
        }
      });

      // Add manual entries
      defaultManualEntries.forEach((entry) => {
        if (entry.date === dateStr) {
          data[entry.name][dateStr] = entry.amount;
        }
      });
    });

    // Sort names: income first, then expenses
    const sortedNames = names.sort((a, b) => {
      const aIsIncome = Object.values(data[a]).some((v) => v > 0);
      const bIsIncome = Object.values(data[b]).some((v) => v > 0);
      if (aIsIncome && !bIsIncome) return -1;
      if (!aIsIncome && bIsIncome) return 1;
      return a.localeCompare(b);
    });

    setLineItemNames(sortedNames);
    setSpreadsheetData(data);
  }, [dates]);

  // Load data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/crm/cashflow/spreadsheet');
      if (response.ok) {
        const data = await response.json();
        if (data.spreadsheetData && Object.keys(data.spreadsheetData).length > 0) {
          setSpreadsheetData(data.spreadsheetData);
          setLineItemNames(data.lineItemNames || Object.keys(data.spreadsheetData));
          setSkippedCells(data.skippedCells || {});
        } else {
          initializeDefaults();
        }
        if (data.startingBalance) {
          setStartingBalance(data.startingBalance);
        }
      } else {
        initializeDefaults();
      }
    } catch (error) {
      console.error('Error loading cash flow data:', error);
      initializeDefaults();
    }
    setLoading(false);
  }, [initializeDefaults]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Check if a cell is skipped
  const isCellSkipped = useCallback((name: string, date: string) => {
    return skippedCells[name]?.[date] === true;
  }, [skippedCells]);

  // Calculate balances (excluding skipped cells)
  const balances = useMemo(() => {
    const result: Record<string, number> = {};
    let runningBalance = startingBalance;

    dates.forEach((date) => {
      let dailyTotal = 0;
      lineItemNames.forEach((name) => {
        const amount = spreadsheetData[name]?.[date];
        const isSkipped = skippedCells[name]?.[date];
        if (amount && !isSkipped) dailyTotal += amount;
      });
      runningBalance += dailyTotal;
      result[date] = runningBalance;
    });

    return result;
  }, [dates, lineItemNames, spreadsheetData, skippedCells, startingBalance]);

  // Calculate daily changes (excluding skipped cells)
  const dailyChanges = useMemo(() => {
    const result: Record<string, number> = {};
    dates.forEach((date) => {
      let dailyTotal = 0;
      lineItemNames.forEach((name) => {
        const amount = spreadsheetData[name]?.[date];
        const isSkipped = skippedCells[name]?.[date];
        if (amount && !isSkipped) dailyTotal += amount;
      });
      result[date] = dailyTotal;
    });
    return result;
  }, [dates, lineItemNames, spreadsheetData, skippedCells]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const balanceValues = Object.values(balances);
    const lowestBalance = Math.min(...balanceValues);
    const lowestDate = Object.entries(balances).find(([, v]) => v === lowestBalance)?.[0] || '';
    const negativeDays = balanceValues.filter((b) => b < 0).length;
    const firstNegative = Object.entries(balances).find(([, v]) => v < 0);

    let totalIncome = 0;
    let totalExpenses = 0;
    const weeklyBreakdown: Record<string, number> = {};

    lineItemNames.forEach((name) => {
      const amounts = Object.values(spreadsheetData[name] || {});
      const total = amounts.reduce((sum, v) => sum + v, 0);
      if (total > 0) {
        totalIncome += total;
      } else {
        totalExpenses += Math.abs(total);
        // Calculate weekly average
        const weeks = dates.length / 7;
        if (weeks > 0) {
          weeklyBreakdown[name] = total / weeks;
        }
      }
    });

    return {
      startingBalance,
      endingBalance: balanceValues[balanceValues.length - 1] || startingBalance,
      lowestBalance,
      lowestDate,
      negativeDays,
      firstNegativeDate: firstNegative?.[0],
      firstNegativeBalance: firstNegative?.[1],
      totalIncome,
      totalExpenses,
      weeklyBreakdown,
    };
  }, [balances, dates.length, lineItemNames, spreadsheetData, startingBalance]);

  // Handle cell change
  const handleCellChange = (name: string, date: string, value: number | undefined) => {
    saveToHistory(); // Save state before change
    setSpreadsheetData((prev) => {
      const newData = { ...prev };
      if (!newData[name]) newData[name] = {};

      if (value === undefined) {
        delete newData[name][date];
      } else {
        newData[name][date] = value;
      }

      return newData;
    });
    setHasChanges(true);
  };

  // Toggle cell skip status (right-click)
  const handleToggleSkip = (name: string, date: string) => {
    saveToHistory(); // Save state before change
    setSkippedCells((prev) => {
      // Deep copy to avoid mutation issues
      const newSkipped: Record<string, Record<string, boolean>> = {};
      for (const key of Object.keys(prev)) {
        newSkipped[key] = { ...prev[key] };
      }

      if (!newSkipped[name]) newSkipped[name] = {};

      // Toggle the skip status
      if (newSkipped[name][date]) {
        delete newSkipped[name][date];
      } else {
        newSkipped[name][date] = true;
      }

      return newSkipped;
    });
    setHasChanges(true);
  };

  // Check if a line item is income (by data or by name pattern)
  const isIncomeItem = (name: string) => {
    const amounts = Object.values(spreadsheetData[name] || {});
    // Check if any values are positive
    if (amounts.length > 0 && amounts.some((v) => v > 0)) return true;
    // Also check by name pattern for known income sources
    const lowerName = name.toLowerCase();
    // Specific income patterns (GoodPWR is the main income source)
    const incomePatterns = ['goodpwr', 'pwr payment', 'income', 'revenue', 'deposit'];
    return incomePatterns.some((pattern) => lowerName.includes(pattern));
  };

  // Check if a line item is forecasted (estimated, not confirmed)
  const isForecastedItem = (name: string) => {
    return name.toLowerCase().includes('forecasted');
  };

  // Add new row
  const handleAddRow = () => {
    if (!newRowName.trim()) return;

    saveToHistory(); // Save state before change

    setLineItemNames((prev) => {
      const newNames = [...prev];
      if (newRowIsIncome) {
        // Add at the beginning (income section)
        const firstExpenseIndex = newNames.findIndex((n) => !isIncomeItem(n));
        if (firstExpenseIndex === -1) {
          newNames.push(newRowName);
        } else {
          newNames.splice(firstExpenseIndex, 0, newRowName);
        }
      } else {
        // Add at the end (expense section)
        newNames.push(newRowName);
      }
      return newNames;
    });

    setSpreadsheetData((prev) => ({
      ...prev,
      [newRowName]: {},
    }));

    setNewRowName('');
    setIsAddRowDialogOpen(false);
    setHasChanges(true);
  };

  // Delete row
  const handleDeleteRow = (name: string) => {
    saveToHistory(); // Save state before change
    setLineItemNames((prev) => prev.filter((n) => n !== name));
    setSpreadsheetData((prev) => {
      const newData = { ...prev };
      delete newData[name];
      return newData;
    });
    setHasChanges(true);
  };

  // Save data
  const handleSave = async () => {
    try {
      await fetch('/api/crm/cashflow/spreadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetData,
          lineItemNames,
          startingBalance,
          skippedCells,
        }),
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Line Item', ...dates.map((d) =>
      new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    )];

    const rows = [
      ['Balance:', ...dates.map((d) => balances[d]?.toFixed(2) || '')],
      ['Daily Change:', ...dates.map((d) => dailyChanges[d]?.toFixed(2) || '')],
      [],
      ...lineItemNames.map((name) => [
        name,
        ...dates.map((d) => spreadsheetData[name]?.[d]?.toFixed(2) || ''),
      ]),
    ];

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashflow-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Cash Flow Projection</h1>
          <p className="text-gray-400 mt-1">Loading...</p>
        </div>
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-12">
          <p className="text-center text-gray-400">Loading cash flow data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Cash Flow Projection</h1>
          <p className="text-gray-400 mt-1">
            Double-click to edit. Right-click to skip from calculation.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleUndo}
            disabled={!canUndo}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-40"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleRedo}
            disabled={!canRedo}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-40"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          {hasChanges && (
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setIsSettingsDialogOpen(true)}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={loadData}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900/50 border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <DollarSign className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Starting Balance</p>
              <p className="text-2xl font-bold text-white">
                {formatCashFlowCurrency(summary.startingBalance)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${summary.endingBalance >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {summary.endingBalance >= 0 ? (
                <TrendingUp className="h-6 w-6 text-green-400" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400">Ending Balance</p>
              <p className={`text-2xl font-bold ${summary.endingBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCashFlowCurrency(summary.endingBalance)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${summary.lowestBalance >= 0 ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
              <AlertTriangle className={`h-6 w-6 ${summary.lowestBalance >= 0 ? 'text-yellow-400' : 'text-red-400'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Lowest Balance</p>
              <p className={`text-2xl font-bold ${summary.lowestBalance >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {formatCashFlowCurrency(summary.lowestBalance)}
              </p>
              <p className="text-xs text-gray-500">on {summary.lowestDate}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900/50 border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <Calendar className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Negative Days</p>
              <p className={`text-2xl font-bold ${summary.negativeDays > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {summary.negativeDays}
              </p>
              {summary.firstNegativeDate && (
                <p className="text-xs text-gray-500">First: {summary.firstNegativeDate}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="spreadsheet" className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="spreadsheet">Spreadsheet View</TabsTrigger>
          <TabsTrigger value="summary">Weekly Summary</TabsTrigger>
        </TabsList>

        {/* Spreadsheet View Tab */}
        <TabsContent value="spreadsheet" className="mt-4">
          <Card className="bg-gray-900/50 border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Cash Flow Spreadsheet</h3>
              <div className="flex gap-4 items-center">
                <Button
                  size="sm"
                  onClick={() => setIsAddRowDialogOpen(true)}
                  className="bg-[#ff0000] hover:bg-[#cc0000] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </Button>
                <div className="flex items-center gap-2">
                  <Label htmlFor="ss-start-date" className="text-gray-400 text-sm">From:</Label>
                  <Input
                    id="ss-start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="ss-end-date" className="text-gray-400 text-sm">To:</Label>
                  <Input
                    id="ss-end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-gray-800 border-gray-600 text-white w-40"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-auto max-h-[700px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900 z-10">
                  <tr className="border-b border-gray-700">
                    <th className="sticky left-0 bg-gray-900 z-20 p-2 text-left text-gray-400 font-medium min-w-[200px] border-r border-gray-700">
                      Line Item
                    </th>
                    {dates.slice(0, 60).map((date) => (
                      <th key={date} className="p-2 text-center text-gray-400 font-medium min-w-[85px] border-r border-gray-800">
                        <div className="text-xs">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div>
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Balance Row */}
                  <tr className="border-b-2 border-gray-600 bg-gray-800/50">
                    <td className="sticky left-0 bg-gray-800 z-10 p-2 font-bold text-white border-r border-gray-700">
                      Balance:
                    </td>
                    {dates.slice(0, 60).map((date) => (
                      <td
                        key={date}
                        className={`p-2 text-center font-mono font-bold border-r border-gray-800 ${
                          balances[date] < 0
                            ? 'text-red-400 bg-red-900/20'
                            : balances[date] < 5000
                            ? 'text-yellow-400'
                            : 'text-green-400'
                        }`}
                      >
                        {formatCashFlowCurrency(balances[date] || 0)}
                      </td>
                    ))}
                  </tr>
                  {/* Daily Change Row */}
                  <tr className="border-b border-gray-700 bg-gray-800/30">
                    <td className="sticky left-0 bg-gray-800/50 z-10 p-2 text-gray-400 text-sm border-r border-gray-700">
                      Daily Change:
                    </td>
                    {dates.slice(0, 60).map((date) => (
                      <td
                        key={date}
                        className={`p-2 text-center font-mono text-sm border-r border-gray-800 ${getAmountColorClass(dailyChanges[date] || 0)}`}
                      >
                        {dailyChanges[date] !== 0 ? formatCashFlowCurrency(dailyChanges[date] || 0) : '-'}
                      </td>
                    ))}
                  </tr>
                  {/* Spacer Row */}
                  <tr className="h-2 bg-gray-900">
                    <td colSpan={61}></td>
                  </tr>
                  {/* Line Items */}
                  {lineItemNames.map((name) => {
                    const isIncome = isIncomeItem(name);
                    const isForecasted = isForecastedItem(name);
                    // Determine dot color: yellow for forecasted income, green for confirmed income, red for expenses
                    const dotColor = isForecasted && isIncome ? 'bg-yellow-500' : isIncome ? 'bg-green-500' : 'bg-red-500';
                    return (
                      <tr key={name} className="border-b border-gray-800 hover:bg-gray-800/30 group">
                        <td className="sticky left-0 bg-gray-900 z-10 p-2 text-white border-r border-gray-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${dotColor}`}></span>
                              <span className={isForecasted && isIncome ? 'text-yellow-500' : ''}>{name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteRow(name)}
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 text-xs px-1"
                            >
                              ×
                            </button>
                          </div>
                        </td>
                        {dates.slice(0, 60).map((date) => (
                          <td key={date} className="p-1 text-center font-mono text-sm border-r border-gray-800">
                            <EditableCell
                              value={spreadsheetData[name]?.[date]}
                              onChange={(value) => handleCellChange(name, date, value)}
                              onToggleSkip={() => handleToggleSkip(name, date)}
                              isIncome={isIncome}
                              isForecasted={isForecasted}
                              isSkipped={isCellSkipped(name, date)}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Weekly Summary Tab */}
        <TabsContent value="summary" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income vs Expenses Summary */}
            <Card className="bg-gray-900/50 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Projection Period Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Income</span>
                  <span className="text-green-400 font-mono text-lg">
                    {formatCashFlowCurrency(summary.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Expenses</span>
                  <span className="text-red-400 font-mono text-lg">
                    {formatCashFlowCurrency(-summary.totalExpenses)}
                  </span>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">Net Change</span>
                    <span className={`font-mono text-xl font-bold ${getAmountColorClass(summary.totalIncome - summary.totalExpenses)}`}>
                      {formatCashFlowCurrency(summary.totalIncome - summary.totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Weekly Expense Breakdown */}
            <Card className="bg-gray-900/50 border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Weekly Expense Breakdown</h3>
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {Object.entries(summary.weeklyBreakdown)
                  .sort(([, a], [, b]) => a - b)
                  .map(([name, amount]) => (
                    <div key={name} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{name}</span>
                      <span className="text-red-400 font-mono">
                        {formatCashFlowCurrency(amount)}/wk
                      </span>
                    </div>
                  ))}
                <div className="border-t border-gray-700 pt-2 mt-4">
                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-white">Total Weekly</span>
                    <span className="text-red-400 font-mono">
                      {formatCashFlowCurrency(
                        Object.values(summary.weeklyBreakdown).reduce((sum, val) => sum + val, 0)
                      )}/wk
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Projection Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Configure your cash flow projection parameters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="starting-balance">Starting Balance</Label>
              <Input
                id="starting-balance"
                type="number"
                step="0.01"
                value={startingBalance}
                onChange={(e) => {
                  setStartingBalance(parseFloat(e.target.value) || 0);
                  setHasChanges(true);
                }}
                className="bg-gray-800 border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)} className="border-gray-600">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Row Dialog */}
      <Dialog open={isAddRowDialogOpen} onOpenChange={setIsAddRowDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Row</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new line item to track.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-row-name">Name</Label>
              <Input
                id="new-row-name"
                value={newRowName}
                onChange={(e) => setNewRowName(e.target.value)}
                placeholder="e.g., New Expense"
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is-income"
                checked={newRowIsIncome}
                onChange={(e) => setNewRowIsIncome(e.target.checked)}
                className="rounded bg-gray-800 border-gray-600"
              />
              <Label htmlFor="is-income">This is income (positive values)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRowDialogOpen(false)} className="border-gray-600">
              Cancel
            </Button>
            <Button onClick={handleAddRow} className="bg-[#ff0000] hover:bg-[#cc0000]">
              Add Row
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
