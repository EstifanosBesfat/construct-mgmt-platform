'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BoqItem } from '@/types';
import { useCreateBoqItem, useUpdateBoqItem } from '@/hooks/use-boq';
import { formatCurrency } from '@/lib/utils';

const boqSchema = z.object({
  description: z.string().min(2, 'Description must be at least 2 characters'),
  unit: z.string().min(1, 'Unit is required (e.g. m3, m2, ton, bag, lot)'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  unitPrice: z.coerce.number().positive('Unit price must be greater than 0'),
});

type BoqFormValues = z.infer<typeof boqSchema>;

interface BoqItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  itemToEdit?: BoqItem | null;
}

export function BoqItemDialog({
  isOpen,
  onClose,
  projectId,
  itemToEdit,
}: BoqItemDialogProps) {
  const isEditing = Boolean(itemToEdit);
  const createMutation = useCreateBoqItem(projectId);
  const updateMutation = useUpdateBoqItem(projectId);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BoqFormValues>({
    resolver: zodResolver(boqSchema),
    defaultValues: {
      description: '',
      unit: '',
      quantity: 1,
      unitPrice: 0,
    },
  });

  const quantity = watch('quantity') || 0;
  const unitPrice = watch('unitPrice') || 0;
  const calculatedTotal = quantity * unitPrice;

  React.useEffect(() => {
    if (itemToEdit) {
      reset({
        description: itemToEdit.description,
        unit: itemToEdit.unit,
        quantity: Number(itemToEdit.quantity),
        unitPrice: Number(itemToEdit.unitPrice),
      });
    } else {
      reset({
        description: '',
        unit: 'm3',
        quantity: 1,
        unitPrice: 0,
      });
    }
  }, [itemToEdit, reset, isOpen]);

  const onSubmit = async (values: BoqFormValues) => {
    try {
      if (isEditing && itemToEdit) {
        await updateMutation.mutateAsync({
          id: itemToEdit.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
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
      title={isEditing ? 'Edit BOQ Item' : 'Add Bill of Quantities Item'}
      description="Add a measured rate item with quantity and unit price."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Item Description *
          </label>
          <Input
            {...register('description')}
            placeholder="e.g. Reinforced concrete foundation (C-25)"
            error={errors.description?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Unit *
            </label>
            <Input
              {...register('unit')}
              placeholder="e.g. m3, ton, m2"
              error={errors.unit?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Quantity *
            </label>
            <Input
              type="number"
              step="any"
              {...register('quantity')}
              placeholder="100"
              error={errors.quantity?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Unit Price (ETB) *
            </label>
            <Input
              type="number"
              step="any"
              {...register('unitPrice')}
              placeholder="4500"
              error={errors.unitPrice?.message}
            />
          </div>
        </div>

        {/* Dynamic Calculated Line Total Preview */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <span className="font-medium text-muted-foreground">
            Computed Line Total ({quantity} × {unitPrice}):
          </span>
          <span className="font-bold text-amber-500 text-sm">
            {formatCurrency(calculatedTotal)}
          </span>
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
            {isEditing ? 'Update Item' : 'Add to BOQ'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
