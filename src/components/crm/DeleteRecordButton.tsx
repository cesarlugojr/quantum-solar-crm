'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
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
import { deleteLead, deleteOpportunity, deleteProject } from '@/app/crm/actions';

interface DeleteRecordButtonProps {
  recordId: string;
  recordName: string;
  recordType: 'lead' | 'opportunity' | 'project';
  redirectPath: string;
}

export function DeleteRecordButton({
  recordId,
  recordName,
  recordType,
  redirectPath,
}: DeleteRecordButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const recordTypeLabel = recordType.charAt(0).toUpperCase() + recordType.slice(1);

  const handleDelete = async () => {
    setError(null);
    startTransition(async () => {
      let result;
      switch (recordType) {
        case 'lead':
          result = await deleteLead(recordId);
          break;
        case 'opportunity':
          result = await deleteOpportunity(recordId);
          break;
        case 'project':
          result = await deleteProject(recordId);
          break;
      }

      if (result.success) {
        setOpen(false);
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(result.error || `Failed to delete ${recordType}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-red-400 border-red-600/50 hover:bg-red-900/20 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete {recordTypeLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-900/30 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
            <DialogTitle className="text-white text-xl">Delete {recordTypeLabel}</DialogTitle>
          </div>
          <DialogDescription className="text-gray-400 pt-2">
            Are you sure you want to delete this {recordType}?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 my-2">
          <p className="text-sm text-gray-400 mb-1">{recordTypeLabel} to be deleted:</p>
          <p className="text-white font-medium">{recordName}</p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3 my-2">
          <p className="text-sm text-yellow-200 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>
              This action cannot be undone. This {recordType} will be permanently deleted.
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
            disabled={isPending}
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? 'Deleting...' : `Delete ${recordTypeLabel}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
