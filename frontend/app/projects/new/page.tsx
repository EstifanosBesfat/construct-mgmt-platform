'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Building2, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/page-header';
import { useCreateProject } from '@/hooks/use-projects';

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

export default function NewProjectPage() {
  const router = useRouter();
  const createMutation = useCreateProject();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      code: '',
      clientName: '',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      budget: 0,
      status: 'PLANNED',
    },
  });

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const project = await createMutation.mutateAsync({
        ...values,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
      });
      router.push(`/projects/${project.id}`);
    } catch {
      // Error handled in hook
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-2">
        <Link href="/projects">
          <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Create New Project"
        description="Initialize a new construction project and set up its baseline budget and timeline."
      />

      <Card className="glass-panel border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-amber-500" />
            <span>Project Baseline Information</span>
          </CardTitle>
          <CardDescription className="text-xs">
            All fields are required to establish the project contract profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Project Name *
                </label>
                <Input
                  {...register('name')}
                  placeholder="e.g. Bole Medhanialem Tower"
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Project Code * (Unique)
                </label>
                <Input
                  {...register('code')}
                  placeholder="e.g. PRJ-007"
                  error={errors.code?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Client / Owner Name *
                </label>
                <Input
                  {...register('clientName')}
                  placeholder="e.g. Midroc Construction"
                  error={errors.clientName?.message}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Site Location *
                </label>
                <Input
                  {...register('location')}
                  placeholder="e.g. Addis Ababa, Bole Sub-City"
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
                  Estimated End Date *
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
                  Approved Contract Budget (ETB) *
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register('budget')}
                  placeholder="e.g. 75000000"
                  error={errors.budget?.message}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">
                  Initial Status *
                </label>
                <Select {...register('status')} error={errors.status?.message}>
                  <option value="PLANNED">PLANNED (Upcoming)</option>
                  <option value="ONGOING">ONGOING (Active Site)</option>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/projects')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="amber"
                isLoading={isSubmitting || createMutation.isPending}
                className="rounded-xl shadow-sm"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Initialize Project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
