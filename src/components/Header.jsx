import React from 'react';
import { Menu, ChevronRight, Plus, FolderKanban } from 'lucide-react';

/**
 * En-tête supérieur (Header) avec fil d'Ariane, actions rapides et toggle mobile.
 */
export default function Header({
  currentProject,
  onOpenMobileMenu,
  onNewTask,
  onNewProject
}) {
  return (
    <header className="h-16 px-4 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Zone gauche : Hamburger mobile + Fil d'Ariane (Breadcrumbs) */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Ouvrir le menu latéral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <span className="font-medium text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap">
            Tableau de bord
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-900 truncate max-w-[160px] sm:max-w-[280px]">
            {currentProject ? currentProject.name : "Vue d'ensemble"}
          </span>
        </nav>
      </div>

      {/* Zone droite : Actions rapides & Profil */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onNewProject}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <FolderKanban className="w-3.5 h-3.5 text-slate-500" />
          <span>Nouveau projet</span>
        </button>

        <button
          type="button"
          onClick={onNewTask}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nouvelle tâche</span>
        </button>

        {/* Avatar utilisateur pro */}
        <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold select-none shrink-0" title="Espace de travail principal">
          TF
        </div>
      </div>
    </header>
  );
}
