'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GanttChartSquare,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { useProjects } from '@/hooks/use-projects';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function TimelinePage() {
  const { data: projectsData, isLoading } = useProjects({ limit: 100 });
  const projects = projectsData?.data ?? [];

  const dates = projects.flatMap((p) => [parseISO(p.startDate), parseISO(p.endDate)]);
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date('2025-01-01');
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date('2027-12-31');

  const totalDays = Math.max(differenceInDays(maxDate, minDate), 1);

  return (
    <div className="space-y-3">
      <PageHeader
        title="Project Timeline & Gantt Schedule"
        description="Visual roadmap tracking project start dates and completion milestones."
      />

      {/* Legend & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="bg-card border border-border rounded-lg p-2.5 flex items-center space-x-2.5 text-xs">
          <div className="h-2.5 w-2.5 rounded-full bg-[#64748B] dark:bg-[#94A3B8] shrink-0" />
          <div>
            <span className="font-semibold text-foreground">Planned</span>
            <p className="text-[10px] text-muted-foreground">Contract scheduled</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-2.5 flex items-center space-x-2.5 text-xs">
          <div className="h-2.5 w-2.5 rounded-full bg-[#EA580C] dark:bg-[#FB923C] shrink-0" />
          <div>
            <span className="font-semibold text-foreground">Ongoing Active</span>
            <p className="text-[10px] text-muted-foreground">Active construction site</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-2.5 flex items-center space-x-2.5 text-xs">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
          <div>
            <span className="font-semibold text-foreground">Completed</span>
            <p className="text-[10px] text-muted-foreground">Handed over</p>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-3.5">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">
              No projects available to plot on timeline.
            </p>
          ) : (
            <div className="space-y-4 overflow-x-auto min-w-[650px] py-1">
              {/* Timeline Header */}
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground border-b border-border pb-1.5 px-1">
                <span>{formatDate(minDate)}</span>
                <span>Midpoint</span>
                <span>{formatDate(maxDate)}</span>
              </div>

              {/* Gantt Rows */}
              <div className="space-y-3">
                {projects.map((project) => {
                  const startDate = parseISO(project.startDate);
                  const endDate = parseISO(project.endDate);

                  const startOffset = Math.max(0, differenceInDays(startDate, minDate));
                  const duration = Math.max(differenceInDays(endDate, startDate), 1);

                  const leftPct = (startOffset / totalDays) * 100;
                  const widthPct = Math.max((duration / totalDays) * 100, 5);

                  const getBarBg = (status: string) => {
                    switch (status) {
                      case 'COMPLETED':
                        return 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-300';
                      case 'ONGOING':
                        return 'bg-[#FFF7ED] border-[#EA580C] text-[#C2410C] dark:bg-orange-950/60 dark:border-orange-600 dark:text-orange-300 font-semibold';
                      default:
                        return 'bg-muted border-border text-muted-foreground dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300';
                    }
                  };

                  return (
                    <div key={project.id} className="space-y-1 group">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                            {project.code}
                          </span>
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium text-foreground hover:underline"
                          >
                            {project.name}
                          </Link>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(project.status) + ' text-[9px] py-0 px-1.5'}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-[10px]">
                          {formatDate(project.startDate)} → {formatDate(project.endDate)} ({duration}d)
                        </span>
                      </div>

                      {/* Track */}
                      <div className="h-6 w-full bg-muted/40 dark:bg-slate-900/60 rounded-md relative overflow-hidden border border-border dark:border-slate-800">
                        <div
                          className={`absolute top-0.5 bottom-0.5 rounded border flex items-center px-1.5 text-[10px] overflow-hidden transition-all duration-300 ${getBarBg(
                            project.status
                          )}`}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }}
                        >
                          <span className="truncate font-mono font-medium">{project.code}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
