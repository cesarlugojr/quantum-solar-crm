'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeleteConfirmationDialogProps {
  title: string;
  description: string;
  itemCount?: number;
  itemNames?: string[];
  onConfirm: () => Promise<void>;
  trigger?: React.ReactNode;
  variant?: 'icon' | 'button' | 'destructive';
  disabled?: boolean;
}

export function DeleteConfirmationDialog({
  title,
  description,
  itemCount = 1,
  itemNames,
  onConfirm,
  trigger,
  variant = 'button',
  disabled = false,
}: DeleteConfirmationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultTrigger = variant === 'icon' ? (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
      disabled={disabled}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  ) : variant === 'destructive' ? (
    <Button
      variant="destructive"
      className="bg-red-600 hover:bg-red-700"
      disabled={disabled}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete {itemCount > 1 ? `(${itemCount})` : ''}
    </Button>
  ) : (
    <Button
      variant="outline"
      className="border-red-600 text-red-400 hover:bg-red-900/20"
      disabled={disabled}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <DialogTitle className="text-white text-xl">{title}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        {itemNames && itemNames.length > 0 && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 my-2 max-h-40 overflow-y-auto">
            <p className="text-sm text-gray-400 mb-2">Items to be deleted:</p>
            <ul className="space-y-1">
              {itemNames.slice(0, 10).map((name, index) => (
                <li key={index} className="text-sm text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                  {name}
                </li>
              ))}
              {itemNames.length > 10 && (
                <li className="text-sm text-gray-400 italic">
                  ...and {itemNames.length - 10} more
                </li>
              )}
            </ul>
          </div>
        )}

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 my-2">
          <p className="text-sm text-yellow-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              This action cannot be undone. {itemCount > 1
                ? `All ${itemCount} selected items will be permanently deleted.`
                : 'This item will be permanently deleted.'}
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : `Delete ${itemCount > 1 ? `${itemCount} Items` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
