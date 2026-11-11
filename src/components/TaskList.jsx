import React from 'react';
import { Plus, Search, Filter, ArrowUpDown, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import TaskItem from './TaskItem.jsx';

/**
 * Composant de gestion des tâches pour le projet sélectionné.
 * Propose des onglets de filtrage interactifs, une recherche en temps réel et des options de tri.
 */
export default function TaskList({
  currentProject,
  hasProjects = true,
  tasks,
  allProjectTasksCount,
  pendingCount,
  completedCount,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange,
  onAddTask,
  onAddProject,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onEditProject,
  onDeleteProject
}) {
  return (
    <div className="space-y-5">
      {/* En-tête de section du projet sélectionné */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 truncate">
                {currentProject ? currentProject.name : "Toutes les tâches"}
              </h2>
            </div>
            {currentProject && currentProject.description ? (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                {currentProject.description}
              </p>
            ) : !hasProjects ? (
              <p className="mt-1 text-xs text-slate-500">
                Créez votre premier projet ci-dessus pour commencer à organiser vos tâches.
              </p>
            ) : currentProject ? (
              <p className="mt-1 text-xs text-slate-400">
                Aucune description fournie pour ce projet.
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {currentProject && (
              <>
                <button
                  type="button"
                  onClick={() => onEditProject(currentProject)}
                  className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Modifier les détails du projet"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modifier</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteProject(currentProject)}
                  className="px-3 py-2 text-xs font-medium text-red-700 bg-red-50/60 border border-red-100 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Supprimer ce projet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Supprimer</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onAddTask}
              className="px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvelle tâche</span>
            </button>
          </div>
        </div>

        {/* Barre de contrôle : Filtres segmentés, Recherche et Tri */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Onglets de filtrage interactifs (boutons conformes au design system) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-lg shrink-0 self-start">
            <button
              type="button"
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Toutes <span className="tabular-nums text-slate-400 ml-1">({allProjectTasksCount})</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En attente <span className="tabular-nums text-slate-400 ml-1">({pendingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => onFilterChange('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                filter === 'completed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terminées <span className="tabular-nums text-slate-400 ml-1">({completedCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 md:max-w-md">
            {/* Champ de recherche */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher une tâche..."
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Sélecteur de tri */}
            <div className="relative shrink-0">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                className="pl-2.5 pr-7 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
                aria-label="Trier les tâches"
              >
                <option value="date_desc">Plus récentes</option>
                <option value="date_asc">Plus anciennes</option>
                <option value="title">Titre (A-Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des tâches */}
      {tasks.length > 0 ? (
        <div className="space-y-2.5">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggleTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </div>
      ) : (
        /* État vide soigné (Empty State) */
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            {searchQuery || filter !== 'all' ? (
              <Filter className="w-6 h-6 text-slate-400" />
            ) : (
              <CheckCircle className="w-6 h-6 text-slate-300" />
            )}
          </div>

          <h3 className="text-sm font-semibold text-slate-900">
            {searchQuery || filter !== 'all'
              ? "Aucune tâche ne correspond à vos critères"
              : !hasProjects
              ? "Aucun projet pour le moment"
              : "Aucune tâche dans ce projet pour le moment"}
          </h3>

          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {searchQuery || filter !== 'all'
              ? "Essayez de modifier votre recherche ou de réinitialiser le filtre de statut."
              : !hasProjects
              ? "Créez votre premier projet pour pouvoir y associer des tâches."
              : "Commencez dès maintenant en ajoutant la première tâche à accomplir pour ce projet."}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {searchQuery || filter !== 'all' ? (
              <button
                type="button"
                onClick={() => {
                  onFilterChange('all');
                  onSearchChange('');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            ) : !hasProjects ? (
              <button
                type="button"
                onClick={onAddProject}
                className="px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer le premier projet</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onAddTask}
                className="px-3.5 py-2 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Créer la première tâche</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
