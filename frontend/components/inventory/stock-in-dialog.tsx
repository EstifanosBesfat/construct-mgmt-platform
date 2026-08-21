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
import { useMaterials } from '@/hooks/use-materials';
import { useProjects } from '@/hooks/use-projects';
import { useStockIn } from '@/hooks/use-inventory';

const stockInSchema = z.object({
  materialId: z.string().min(1, 'Please select a material'),
  projectId: z.string().optional(),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().min(1, 'Reference / GRN number is required'),
  notes: z.string().optional(),
});

type StockInFormValues = z.infer<typeof stockInSchema>;

interface StockInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMaterialId?: string;
}

export function StockInDialog({
  isOpen,
  onClose,
  defaultMaterialId,
}: StockInDialogProps) {
  const stockInMutation = useStockIn();
  const { data: materialsData } = useMaterials({ limit: 100 });
  const { data: projectsData } = useProjects({ limit: 100 });

  const materials = materialsData?.data ?? [];
  const projects = projectsData?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockInFormValues>({
    resolver: zodResolver(stockInSchema),
    defaultValues: {
      materialId: defaultMaterialId || '',
      projectId: '',
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
      reference: `GRN-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    },
  });

  const selectedMaterialId = watch('materialId');
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  React.useEffect(() => {
    if (isOpen) {
      reset({
        materialId: defaultMaterialId || (materials[0]?.id ?? ''),
        projectId: '',
        quantity: 1,
        date: new Date().toISOString().split('T')[0],
        reference: `GRN-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: '',
      });
    }
  }, [isOpen, defaultMaterialId, reset, materials]);

  const onSubmit = async (values: StockInFormValues) => {
    try {
      await stockInMutation.mutateAsync({
        materialId: values.materialId,
        projectId: values.projectId ? values.projectId : undefined,
        quantity: values.quantity,
        date: new Date(values.date).toISOString(),
        reference: values.reference,
        notes: values.notes,
      });
      onClose();
    } catch {
      // Handled in mutation hook
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Record Stock-In (Receipt)"
      description="Increase material inventory from a supplier delivery or site return."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Select Material *
          </label>
          <Select {...register('materialId')} error={errors.materialId?.message}>
            <option value="">-- Choose Material --</option>
            {materials.map((mat) => (
              <option key={mat.id} value={mat.id}>
                {mat.name} ({mat.code}) — Current: {mat.currentStock} {mat.unit}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Quantity to Receive * {selectedMaterial ? `(${selectedMaterial.unit})` : ''}
            </label>
            <Input
              type="number"
              step="any"
              {...register('quantity')}
              placeholder="e.g. 100"
              error={errors.quantity?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Receipt Date *
            </label>
            <Input
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Reference / GRN # *
            </label>
            <Input
              {...register('reference')}
              placeholder="e.g. GRN-2005"
              error={errors.reference?.message}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Assigned Project (Optional)
            </label>
            <Select {...register('projectId')}>
              <option value="">-- General Stock / Warehouse --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Notes / Supplier Details
          </label>
          <Textarea
            {...register('notes')}
            placeholder="e.g. Delivered by Derba Cement truck #ET-4432"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="amber"
            isLoading={isSubmitting || stockInMutation.isPending}
          >
            Confirm Stock-In
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
