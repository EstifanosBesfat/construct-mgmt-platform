'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import { useCreateProgress, useUpdateProgress } from '@/hooks/use-progress';
import { ProgressRecord } from '@/types';
import { toast } from 'sonner';

const progressSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  percentage: z.coerce.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  notes: z.string().optional(),
});

type ProgressFormValues = z.infer<typeof progressSchema>;

interface ProgressFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  recordToEdit?: ProgressRecord | null;
}

export function ProgressFormDialog({
  isOpen,
  onClose,
  defaultProjectId,
  recordToEdit,
}: ProgressFormDialogProps) {
  const isEditing = Boolean(recordToEdit);
  const createMutation = useCreateProgress();
  const updateMutation = useUpdateProgress();
  const { data: projectsData } = useProjects({ limit: 100 });
  const allProjects = projectsData?.data ?? [];

  // Completed projects cannot have new milestones logged
  const activeProjects = allProjects.filter((p) => p.status !== 'COMPLETED');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProgressFormValues>({
    resolver: zodResolver(progressSchema),
    defaultValues: {
      projectId: defaultProjectId || '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      percentage: 0,
      notes: '',
    },
  });

  const selectedProjectId = watch('projectId');
  const currentPercentage = watch('percentage') || 0;

  const selectedProject = allProjects.find((p) => p.id === selectedProjectId);
  const minRequiredPercentage = Number((selectedProject as any)?.latestProgressPercentage ?? (selectedProject as any)?.latestProgress ?? 0);

  React.useEffect(() => {
    if (recordToEdit) {
      reset({
        projectId: recordToEdit.projectId,
        date: recordToEdit.date.split('T')[0],
        description: recordToEdit.description,
        percentage: Number(recordToEdit.percentage),
        notes: recordToEdit.notes ?? '',
      });
    } else {
      const initialProjId = defaultProjectId || (activeProjects[0]?.id ?? '');
      const initProj = allProjects.find((p) => p.id === initialProjId);
      const initProgress = Number((initProj as any)?.latestProgressPercentage ?? (initProj as any)?.latestProgress ?? 0);

      reset({
        projectId: initialProjId,
        date: new Date().toISOString().split('T')[0],
        description: '',
        percentage: initProgress,
        notes: '',
      });
    }
  }, [recordToEdit, defaultProjectId, reset, isOpen]);

  const onSubmit = async (values: ProgressFormValues) => {
    // Validate forward progress rule
    if (!isEditing && Number(values.percentage) < minRequiredPercentage) {
      toast.error(
        `Progress percentage cannot decrease. New milestone (${values.percentage}%) cannot be lower than the current progress (${minRequiredPercentage}%).`
      );
      return;
    }

    try {
      if (isEditing && recordToEdit) {
        await updateMutation.mutateAsync({
          id: recordToEdit.id,
          data: {
            date: new Date(values.date).toISOString(),
            description: values.description,
            percentage: values.percentage,
            notes: values.notes,
          },
        });
      } else {
        await createMutation.mutateAsync({
          projectId: values.projectId,
          date: new Date(values.date).toISOString(),
          description: values.description,
          percentage: values.percentage,
          notes: values.notes,
        });
      }
      onClose();
    } catch {
      // Handled in hook
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Progress Milestone' : 'Record Project Progress'}
      description="Track physical milestone completion and percentage for a construction project."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!defaultProjectId && (
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Select Project *
            </label>
            <Select
              {...register('projectId')}
              disabled={isEditing}
              error={errors.projectId?.message}
            >
              <option value="">-- Select Project --</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
            {activeProjects.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                No active projects available.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Milestone Date *
            </label>
            <Input
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground">
                Progress Percentage *
              </label>
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="font-bold text-[#EA580C]">
                  {currentPercentage}%
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="range"
                min={isEditing ? 0 : minRequiredPercentage}
                max="100"
                step="1"
                value={currentPercentage}
                onChange={(e) => setValue('percentage', Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-[#EA580C]"
              />
              <Input
                type="number"
                min={isEditing ? 0 : minRequiredPercentage}
                max="100"
                step="1"
                {...register('percentage')}
                className="w-20"
                error={errors.percentage?.message}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Milestone Description *
          </label>
          <Input
            {...register('description')}
            placeholder="e.g. Substructure excavation and concrete blinding completed"
            error={errors.description?.message}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Field Notes / Inspection Details
          </label>
          <Textarea
            {...register('notes')}
            placeholder="e.g. Quality engineer inspection passed. Ready for column casting."
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
            className="font-semibold"
          >
            {isEditing ? 'Update Record' : 'Save Progress'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
