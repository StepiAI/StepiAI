import { useCallback, useState } from 'react';
import { ApiError } from '../../../services/api/client';
import {
  createLifePlan,
  LifePlanConflictResult,
  ScheduleOverride,
} from '../../../services/lifePlan/client';
import { LifePlanDraft } from '../types';
import { toCreateLifePlanRequest } from '../utils/lifePlanMapping';

function describeError(err: unknown) {
  if (err instanceof ApiError) {
    return err.message;
  }
  return err instanceof Error ? err.message : 'Could not create the life plan.';
}

export interface LifePlanResolution {
  endDate?: string;
  skippedDates?: string[];
  scheduleOverrides?: ScheduleOverride[];
}

export type CreateLifePlanOutcome =
  | { type: 'created' }
  | { type: 'conflict'; conflict: LifePlanConflictResult }
  | { type: 'error'; message: string };

export function useCreateLifePlan() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (
      draft: LifePlanDraft,
      resolution?: LifePlanResolution,
    ): Promise<CreateLifePlanOutcome> => {
      setSaving(true);
      setError(null);

      try {
        const request = toCreateLifePlanRequest(draft);

        const result = await createLifePlan(
          resolution
            ? {
                ...request,
                ...(resolution.endDate ? { endDate: resolution.endDate } : {}),
                ...(resolution.skippedDates
                  ? { skippedDates: resolution.skippedDates }
                  : {}),
                ...(resolution.scheduleOverrides
                  ? { scheduleOverrides: resolution.scheduleOverrides }
                  : {}),
              }
            : request,
        );

        return result.created
          ? { type: 'created' }
          : { type: 'conflict', conflict: result.conflict };
      } catch (err) {
        console.error('[LifePlan] failed to create life plan:', err);
        const message = describeError(err);
        setError(message);
        return { type: 'error', message };
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const reset = useCallback(() => setError(null), []);

  return { create, saving, error, reset };
}
