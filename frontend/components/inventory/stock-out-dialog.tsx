'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMaterials } from '@/hooks/use-materials';
import { useProjects } from '@/hooks/use-projects';
import { useStockOut } from '@/hooks/use-inventory';

const stockOutSchema = z.object({
  materialId: z.string().min(1, 'Please select a material'),
  projectId: z.string().min(1, 'Project assignment is required for stock-out'),
  quantity: z.coerce.number().positive('Quantity must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  reference: z.string().min(1, 'Reference / Issue Voucher number is required'),
  notes: z.string().optional(),
});

type StockOutFormValues = z.infer<typeof stockOutSchema>;

interface StockOutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMaterialId?: string;
  defaultProjectId?: string;
}

export function StockOutDialog({
  isOpen,
  onClose,
  defaultMaterialId,
  defaultProjectId,
}: StockOutDialogProps) {
  const stockOutMutation = useStockOut();
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
  } = useForm<StockOutFormValues>({
    resolver: zodResolver(stockOutSchema),
    defaultValues: {
      materialId: defaultMaterialId || '',
      projectId: defaultProjectId || '',
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
      reference: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: '',
    },
  });

  const selectedMaterialId = watch('materialId');
  const enteredQuantity = watch('quantity') || 0;
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const availableStock = selectedMaterial ? Number(selectedMaterial.currentStock) : 0;
  const isExceedingStock = selectedMaterial && enteredQuantity > availableStock;
  const remainingStock = availableStock - enteredQuantity;
  const isLowStockAfter =
    selectedMaterial &&
    remainingStock <= Number(selectedMaterial.minimumStock) &&
    !isExceedingStock;

  React.useEffect(() => {
    if (isOpen) {
      reset({
        materialId: defaultMaterialId || (materials[0]?.id ?? ''),
        projectId: defaultProjectId || (projects[0]?.id ?? ''),
        quantity: 1,
        date: new Date().toISOString().split('T')[0],
        reference: `ISS-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: '',
      });
    }
  }, [isOpen, defaultMaterialId, defaultProjectId, reset, materials, projects]);

  const onSubmit = async (values: StockOutFormValues) => {
    try {
      await stockOutMutation.mutateAsync({
        materialId: values.materialId,
        projectId: values.projectId,
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
      title="Record Stock-Out (Issue Material)"
      description="Issue construction material from inventory to a specific project."
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
                {mat.name} ({mat.code}) — Available: {mat.currentStock} {mat.unit}
              </option>
            ))}
          </Select>
          {selectedMaterial && (
            <div className="mt-1.5 flex items-center justify-between text-xs px-2.5 py-1 rounded-lg bg-muted/60">
              <span className="text-muted-foreground">Available on hand:</span>
              <span className="font-semibold text-foreground">
                {selectedMaterial.currentStock} {selectedMaterial.unit} (Min Threshold:{' '}
                {selectedMaterial.minimumStock})
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Assigned Project (Required) *
          </label>
          <Select {...register('projectId')} error={errors.projectId?.message}>
            <option value="">-- Select Destination Project --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code}) — {p.clientName}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Quantity to Issue * {selectedMaterial ? `(${selectedMaterial.unit})` : ''}
            </label>
            <Input
              type="number"
              step="any"
              {...register('quantity')}
              placeholder="e.g. 50"
              error={
                isExceedingStock
                  ? `Exceeds available stock of ${availableStock}`
                  : errors.quantity?.message
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground mb-1.5 block">
              Issue Date *
            </label>
            <Input
              type="date"
              {...register('date')}
              error={errors.date?.message}
            />
          </div>
        </div>

        {/* Live Rule 1 & Rule 2 Alert Preview */}
        {isExceedingStock && (
          <div className="flex items-center space-x-2 rounded-xl p-3 bg-destructive/15 text-destructive border border-destructive/30 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Rejection Warning:</strong> Requested quantity ({enteredQuantity}) exceeds available stock ({availableStock}). The backend will reject this transaction (HTTP 422).
            </span>
          </div>
        )}

        {isLowStockAfter && (
          <div className="flex items-center space-x-2 rounded-xl p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Low Stock Notice:</strong> Remaining stock ({remainingStock} {selectedMaterial?.unit}) will fall to or below the minimum threshold ({selectedMaterial?.minimumStock}).
            </span>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Reference / Issue Voucher # *
          </label>
          <Input
            {...register('reference')}
            placeholder="e.g. ISS-1015"
            error={errors.reference?.message}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-foreground mb-1.5 block">
            Purpose / Work Section Notes
          </label>
          <Textarea
            {...register('notes')}
            placeholder="e.g. Ground beam reinforcement pour, Block B"
          />
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="amber"
            disabled={Boolean(isExceedingStock)}
            isLoading={isSubmitting || stockOutMutation.isPending}
          >
            Confirm Stock-Out
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
