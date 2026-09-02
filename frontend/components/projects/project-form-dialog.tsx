'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Project, ProjectStatus } from '@/types';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';

const projectSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(100),
    code: z
      .string()
      .min(2, 'Code must be at least 2 characters')
      .transform((v) => v.toUpperCase().trim()),
    clientName: z.string().min(2, 'Client name is required'),
    location: z.string().min(2, 'Location is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    budget: z.coerce.number().positive('Budget must be greater than 0'),
    status: z.enum(['PLANNED', 'ONGOING', 'COMPLETED'] as const),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate).getTime() > new Date(data.startDate).getTime();
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  );

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
}

export function ProjectFormDialog({
  isOpen,
  onClose,
  projectToEdit,
}: ProjectFormDialogProps) {
  const isEditing = Boolean(projectToEdit);
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      code: '',
      clientName: '',
      location: '',
      startDate: '',
      endDate: '',
      budget: 0,
      status: 'PLANNED',
    },
  });

  React.useEffect(() => {
    if (projectToEdit) {
      reset({
        name: projectToEdit.name,
        code: projectToEdit.code,
        clientName: projectToEdit.clientName,
        location: projectToEdit.location,
        startDate: projectToEdit.startDate.split('T')[0],
        endDate: projectToEdit.endDate.split('T')[0],
        budget: projectToEdit.budget,
        status: projectToEdit.status,
      });
    } else {
      reset({
        name: '',
        code: '',
        clientName: '',
        location: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: 0,
        status: 'PLANNED',
      });
    }
  }, [projectToEdit, reset, isOpen]);

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      if (isEditing && projectToEdit) {
        await updateMutation.mutateAsync({
          id: projectToEdit.id,
          data: {
            ...values,
            startDate: new Date(values.startDate).toISOString(),
            endDate: new Date(values.endDate).toISOString(),
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...values,
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
        });
      }
      onClose();
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'Create New Project'}
      description={
        isEditing
          ? `Update details for ${projectToEdit?.code}`
          : 'Define project scope, client, budget, and timeline.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Project Name *
            </label>
            <Input
              {...register('name')}
              placeholder="e.g. Riverside Complex"
              error={errors.name?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Project Code *
            </label>
            <Input
              {...register('code')}
              placeholder="e.g. PRJ-006"
              error={errors.code?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Client Name *
            </label>
            <Input
              {...register('clientName')}
              placeholder="e.g. Horizon Group"
              error={errors.clientName?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Location *
            </label>
            <Input
              {...register('location')}
              placeholder="e.g. Addis Ababa, Bole"
              error={errors.location?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Start Date *
            </label>
            <Input
              type="date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              End Date *
            </label>
            <Input
              type="date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Total Budget (ETB) *
            </label>
            <Input
              type="number"
              step="any"
              {...register('budget')}
              placeholder="e.g. 50000000"
              error={errors.budget?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Status *
            </label>
            <Select {...register('status')} error={errors.status?.message}>
              {!isEditing ? (
                // Only Planned or Ongoing when creating a new project
                <>
                  <option value="PLANNED">PLANNED (Upcoming)</option>
                  <option value="ONGOING">ONGOING (Active in-progress)</option>
                </>
              ) : projectToEdit?.status === 'PLANNED' ? (
                <>
                  <option value="PLANNED">PLANNED (Upcoming)</option>
                  <option value="ONGOING">ONGOING (Active in-progress)</option>
                  <option value="COMPLETED">COMPLETED (Finished)</option>
                </>
              ) : projectToEdit?.status === 'ONGOING' ? (
                <>
                  <option value="ONGOING">ONGOING (Active in-progress)</option>
                  <option value="COMPLETED">COMPLETED (Finished)</option>
                </>
              ) : (
                <option value="COMPLETED">COMPLETED (Finalized)</option>
              )}
            </Select>
          </div>
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
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
