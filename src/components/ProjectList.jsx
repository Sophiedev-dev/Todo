import React, { useState, useMemo } from 'react';
import { Plus, Search, FolderPlus, FolderKanban } from 'lucide-react';
import ProjectCard from './ProjectCard.jsx';

/**
 * Section d'aperçu des projets (Project Overview).
 * Permet de visualiser, filtrer et créer des projets sous forme de grille.
 */
export default function ProjectList({
  projects,
  selectedProjectId,
  projectStatsMap,
  onSelectProject,
  onAddProject,
  onEditProject,
  onDeleteProject
}) {
  const [search, setSearch] = useState('');

  const filteredProjects = useMemo(() => {
    if (!search.trim()) return projects;
    const q = search.toLowerCase().trim();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [projects, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-slate-700" />
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Vue d'ensemble des projets
          </h2>
          <span className="text-xs font-semibold text-slate-500 tabular-nums">
            ({projects.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {projects.length > 3 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrer les projets..."
                className="pl-8 pr-3 py-1.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
              />
            </div>
          )}

          <button
            type="button"
            onClick={onAddProject}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouveau projet</span>
          </button>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSelected={project.id === selectedProjectId}
              stats={projectStatsMap ? projectStatsMap[project.id] : null}
              onSelect={onSelectProject}
              onEdit={onEditProject}
              onDelete={onDeleteProject}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="mx-auto w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
            <FolderPlus className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">
            {search ? "Aucun projet ne correspond à votre recherche" : "Aucun projet pour le moment"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            {search
              ? "Vérifiez l'orthographe ou effacez la recherche."
              : "Créez votre premier projet pour commencer à organiser vos tâches."}
          </p>
          <div className="mt-3">
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Effacer la recherche
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddProject}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer un projet</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
