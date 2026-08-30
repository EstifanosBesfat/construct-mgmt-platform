'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Building2, Boxes, ArrowRight, X } from 'lucide-react';
import { useProjects } from '@/hooks/use-projects';
import { useMaterials } from '@/hooks/use-materials';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const [query, setQuery] = React.useState('');
  const router = useRouter();

  const { data: projectsData } = useProjects({ search: query, limit: 5 });
  const { data: materialsData } = useMaterials({ search: query, limit: 5 });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const navigateTo = (path: string) => {
    router.push(path);
    onClose();
    setQuery('');
  };

  const projects = projectsData?.data ?? [];
  const materials = materialsData?.data ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Command Palette Modal */}
      <div className="relative z-50 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-fade-in">
        {/* Search Input Header */}
        <div className="flex items-center px-4 border-b border-border bg-background/50">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, materials, codes, or actions..."
            className="h-14 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ml-2">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-4">
          {/* Projects Results */}
          <div>
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
              <Building2 className="h-3.5 w-3.5 mr-1.5 text-sky-500" />
              Projects
            </div>
            {projects.length > 0 ? (
              <div className="space-y-1 mt-1">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => navigateTo(`/projects/${project.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-muted transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-foreground flex items-center space-x-2">
                        <span>{project.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {project.code}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {project.clientName} • {project.location}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {query ? 'No matching projects' : 'Type to search projects...'}
              </p>
            )}
          </div>

          {/* Materials Results */}
          <div className="border-t border-border pt-3">
            <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
              <Boxes className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
              Materials & Stock
            </div>
            {materials.length > 0 ? (
              <div className="space-y-1 mt-1">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => navigateTo('/materials')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm hover:bg-muted transition-colors group"
                  >
                    <div>
                      <div className="font-medium text-foreground flex items-center space-x-2">
                        <span>{material.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          {material.code}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Current Stock: {material.currentStock} {material.unit}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                {query ? 'No matching materials' : 'Type to search materials...'}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-[11px] text-muted-foreground">
          <span>Navigate with arrows, Enter to select</span>
          <span className="font-mono">Construct CMS Search</span>
        </div>
      </div>
    </div>
  );
}
