'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MaterialWithStockFlag } from '@/types';
import { useCreateMaterial, useUpdateMaterial } from '@/hooks/use-materials';

const materialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .transform((v) => v.toUpperCase().trim()),
  unit: z.string().min(1, 'Unit is required (e.g. bag, ton, m3)'),
  minimumStock: z.coerce.number().min(0, 'Minimum stock must be at least 0'),
});

type MaterialFormValues = z.infer<typeof materialSchema>;

interface MaterialFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  materialToEdit?: MaterialWithStockFlag | null;
}

export function MaterialFormDialog({
  isOpen,
  onClose,
  materialToEdit,
}: MaterialFormDialogProps) {
  const isEditing = Boolean(materialToEdit);
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      name: '',
      code: '',
      unit: '',
      minimumStock: 0,
    },
  });

  React.useEffect(() => {
    if (materialToEdit) {
      reset({
        name: materialToEdit.name,
        code: materialToEdit.code,
        unit: materialToEdit.unit,
        minimumStock: materialToEdit.minimumStock,
      });
    } else {
      reset({
        name: '',
        code: '',
        unit: '',
        minimumStock: 0,
      });
    }
  }, [materialToEdit, reset, isOpen]);

  const onSubmit = async (values: MaterialFormValues) => {
    try {
      if (isEditing && materialToEdit) {
        await updateMutation.mutateAsync({
          id: materialToEdit.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch {
      // Error handled in hook
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Material' : 'Add New Material'}
      description={
        isEditing
          ? `Update material details for ${materialToEdit?.code}`
          : 'Define a new construction material in the inventory catalogue.'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Material Name *
          </label>
          <Input
            {...register('name')}
            placeholder="e.g. Portland Cement 42.5N"
            error={errors.name?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Material Code *
            </label>
            <Input
              {...register('code')}
              placeholder="e.g. MAT-011"
              error={errors.code?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Unit of Measure *
            </label>
            <Input
              {...register('unit')}
              placeholder="e.g. bag, ton, m3, pcs"
              error={errors.unit?.message}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Minimum Stock Threshold *
          </label>
          <Input
            type="number"
            step="any"
            {...register('minimumStock')}
            placeholder="e.g. 100"
            error={errors.minimumStock?.message}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            System will flag a low-stock alert whenever inventory falls to or below this level.
          </p>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="amber"
            isLoading={isSubmitting || createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Save Changes' : 'Add Material'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
