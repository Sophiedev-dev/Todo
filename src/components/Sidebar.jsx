import React from 'react';
import {
  Folder,
  Plus,
  LayoutDashboard,
  RotateCcw,
  X,
  Layers
} from 'lucide-react';

/**
 * Barre latérale moderne (Sidebar) avec logo, navigation tableau de bord,
 * liste des projets actifs et bouton d'ajout de projet.
 */
export default function Sidebar({
  projects = [],
  selectedProjectId = null,
  projectStatsMap = {},
  onSelectProject,
  onAddProject,
  onResetDemoData,
  isOpen = false,
  onClose
}) {
  return (
    <>
      {/* Overlay sombre pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0 shadow-xl lg:shadow-none' : '-translate-x-full'
        }`}
      >
        {/* En-tête de la Sidebar avec Logo TaskFlow */}
        <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900">
                TaskFlow
              </span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                Workspace Pro
              </span>
            </div>
          </div>

          {/* Bouton de fermeture sur mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de la navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {/* Navigation principale */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 mb-2">
              Navigation
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectProject(null);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                selectedProjectId === null
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 ${selectedProjectId === null ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="flex-1">Vue d'ensemble</span>
            </button>
          </div>

          {/* Section Projets */}
          <div>
            <div className="flex items-center justify-between px-2.5 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Projets
              </span>
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                {projects.length}
              </span>
            </div>

            <div className="space-y-1">
              {projects.map((project) => {
                const isSelected = project.id === selectedProjectId;
                const stats = projectStatsMap[project.id] || { total: 0, completed: 0 };

                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      onSelectProject(project.id);
                      if (onClose) onClose();
                    }}
                    className={`group w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <Folder
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isSelected
                            ? 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>

                    {/* Indicateur de tâches complétées */}
                    <span
                      className={`text-[11px] tabular-nums shrink-0 ${
                        isSelected ? 'text-blue-600 font-medium' : 'text-slate-400'
                      }`}
                    >
                      {stats.completed}/{stats.total}
                    </span>
                  </button>
                );
              })}

              {projects.length === 0 && (
                <div className="px-3 py-4 text-center text-xs text-slate-400">
                  Aucun projet actif
                </div>
              )}
            </div>

            {/* Bouton Créer un nouveau projet */}
            <div className="mt-3 px-1">
              <button
                type="button"
                onClick={() => {
                  onAddProject();
                  if (onClose) onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouveau projet</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pied de page de la Sidebar avec état de stockage */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">Stockage : IndexedDB</span>
            {projects.length > 0 && (
              <button
                type="button"
                onClick={onResetDemoData}
                className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 p-1 rounded transition-colors cursor-pointer"
                title="Effacer toutes les données"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Effacer tout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
