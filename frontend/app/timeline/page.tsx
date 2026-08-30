'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  GanttChartSquare,
  Calendar,
  Building2,
  ExternalLink,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/layout/page-header';
import { useProjects } from '@/hooks/use-projects';
import { formatDate, getStatusBadgeClass } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';

export default function TimelinePage() {
  const { data: projectsData, isLoading } = useProjects({ limit: 100 });
  const projects = projectsData?.data ?? [];

  // Calculate earliest start and latest end across all projects
  const dates = projects.flatMap((p) => [parseISO(p.startDate), parseISO(p.endDate)]);
  const minDate = dates.length > 0 ? new Date(Math.min(...dates.map((d) => d.getTime()))) : new Date('2025-01-01');
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map((d) => d.getTime()))) : new Date('2027-12-31');

  const totalDays = Math.max(differenceInDays(maxDate, minDate), 1);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Timeline"
        description="Project start and end dates on one schedule."
      />

      {/* Legend & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-panel p-4 flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-slate-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-foreground">Planned Projects</span>
            <p className="text-muted-foreground">Scheduled contract start dates</p>
          </div>
        </Card>
        <Card className="glass-panel p-4 flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-blue-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-foreground">Ongoing Active Sites</span>
            <p className="text-muted-foreground">Active construction execution</p>
          </div>
        </Card>
        <Card className="glass-panel p-4 flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-foreground">Completed Sites</span>
            <p className="text-muted-foreground">Successfully handed over</p>
          </div>
        </Card>
      </div>

      {/* Gantt Visual Chart Card */}
      <Card className="glass-panel border-border/80">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <GanttChartSquare className="h-5 w-5 text-sky-500" />
            <span>Master Schedule Timeline ({formatDate(minDate)} — {formatDate(maxDate)})</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Bar width represents total duration; inner colored bar shows current completion progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-12">
              No projects available to plot on timeline.
            </p>
          ) : (
            <div className="space-y-6 overflow-x-auto min-w-[700px] py-4">
              {/* Timeline Header Date Marks */}
              <div className="flex justify-between text-[11px] font-mono text-muted-foreground border-b border-border pb-2 px-1">
                <span>{formatDate(minDate)}</span>
                <span>Midpoint</span>
                <span>{formatDate(maxDate)}</span>
              </div>

              {/* Project Gantt Bars */}
              <div className="space-y-5">
                {projects.map((project) => {
                  const startDate = parseISO(project.startDate);
                  const endDate = parseISO(project.endDate);

                  const startOffset = Math.max(0, differenceInDays(startDate, minDate));
                  const duration = Math.max(differenceInDays(endDate, startDate), 1);

                  const leftPct = (startOffset / totalDays) * 100;
                  const widthPct = Math.max((duration / totalDays) * 100, 4);

                  const getBarBg = (status: string) => {
                    switch (status) {
                      case 'COMPLETED':
                        return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500';
                      case 'ONGOING':
                        return 'bg-blue-500/20 border-blue-500/50 text-blue-500';
                      default:
                        return 'bg-slate-500/20 border-slate-500/50 text-slate-500';
                    }
                  };

                  const getProgressBar = (status: string) => {
                    switch (status) {
                      case 'COMPLETED':
                        return 'bg-emerald-500';
                      case 'ONGOING':
                        return 'bg-blue-500';
                      default:
                        return 'bg-slate-400';
                    }
                  };

                  return (
                    <div key={project.id} className="space-y-1.5 group">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-sky-500">
                            {project.code}
                          </span>
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-semibold text-foreground hover:underline hover:text-sky-500"
                          >
                            {project.name}
                          </Link>
                          <Badge
                            variant="outline"
                            className={getStatusBadgeClass(project.status) + ' text-[10px] py-0'}
                          >
                            {project.status}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground text-[11px]">
                          {formatDate(project.startDate)} → {formatDate(project.endDate)} ({duration} days)
                        </span>
                      </div>

                      {/* Gantt Bar Background Track */}
                      <div className="h-8 w-full bg-secondary/40 rounded-xl relative overflow-hidden border border-border/40">
                        {/* Task Schedule Bar */}
                        <div
                          className={`absolute top-1 bottom-1 rounded-lg border flex items-center px-2 text-xs font-semibold overflow-hidden transition-all duration-300 ${getBarBg(
                            project.status
                          )}`}
                          style={{
                            left: `${leftPct}%`,
                            width: `${widthPct}%`,
                          }}
                        >
                          <span className="truncate text-[11px] font-mono">
                            {project.code}
                          </span>
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
