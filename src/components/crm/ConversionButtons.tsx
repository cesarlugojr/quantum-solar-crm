'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Briefcase, FolderKanban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { convertLeadToOpportunity, convertOpportunityToProject } from '@/app/crm/actions';

interface ConvertLeadToOpportunityButtonProps {
  leadId: string;
  leadName: string;
  existingOpportunityId?: string;
}

export function ConvertLeadToOpportunityButton({
  leadId,
  leadName,
  existingOpportunityId,
}: ConvertLeadToOpportunityButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);

    const result = await convertLeadToOpportunity(leadId);

    if (result.success && result.id) {
      router.push(`/crm/opportunities/${result.id}`);
    } else if (result.error?.includes('already exists') && result.id) {
      // Opportunity already exists, navigate to it
      router.push(`/crm/opportunities/${result.id}`);
    } else {
      setError(result.error || 'Failed to convert lead');
      setIsLoading(false);
    }
  };

  // If opportunity already exists, show link to it
  if (existingOpportunityId) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start text-blue-400 border-blue-600 hover:bg-blue-900/20"
        onClick={() => router.push(`/crm/opportunities/${existingOpportunityId}`)}
      >
        <Briefcase className="h-4 w-4 mr-2" />
        View Opportunity
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-green-400 border-green-600 hover:bg-green-900/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 mr-2" />
          )}
          Convert to Opportunity
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Convert Lead to Opportunity</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This will create a new opportunity for <span className="text-white font-medium">{leadName}</span> and
            update the lead status to &quot;Qualified&quot;.
            {error && (
              <span className="block mt-2 text-red-400">{error}</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConvert}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 mr-2" />
                Create Opportunity
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ConvertOpportunityToProjectButtonProps {
  opportunityId: string;
  customerName: string;
  existingProjectId?: string;
  isDisabled?: boolean;
  disabledReason?: string;
}

export function ConvertOpportunityToProjectButton({
  opportunityId,
  customerName,
  existingProjectId,
  isDisabled,
  disabledReason,
}: ConvertOpportunityToProjectButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    setIsLoading(true);
    setError(null);

    const result = await convertOpportunityToProject(opportunityId);

    if (result.success && result.id) {
      router.push(`/crm/projects/${result.id}`);
    } else if (result.error?.includes('already exists') && result.id) {
      // Project already exists, navigate to it
      router.push(`/crm/projects/${result.id}`);
    } else {
      setError(result.error || 'Failed to convert opportunity');
      setIsLoading(false);
    }
  };

  // If project already exists, show link to it
  if (existingProjectId) {
    return (
      <Button
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => router.push(`/crm/projects/${existingProjectId}`)}
      >
        <FolderKanban className="h-4 w-4 mr-2" />
        View Project
      </Button>
    );
  }

  // If disabled (e.g., opportunity is lost)
  if (isDisabled) {
    return (
      <Button
        className="bg-gray-600 text-gray-400 cursor-not-allowed"
        disabled
        title={disabledReason}
      >
        <FolderKanban className="h-4 w-4 mr-2" />
        Convert to Project
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FolderKanban className="h-4 w-4 mr-2" />
          )}
          Convert to Project
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">Convert Opportunity to Project</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            This will create a new project for <span className="text-white font-medium">{customerName}</span> and
            mark this opportunity as &quot;Sale&quot;. The project will start at the &quot;Contract Signed&quot; stage.
            {error && (
              <span className="block mt-2 text-red-400">{error}</span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConvert}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FolderKanban className="h-4 w-4 mr-2" />
                Create Project
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
