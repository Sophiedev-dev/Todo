import React from 'react';
import { Folder, Edit2, Trash2, Calendar, CheckCircle2, ChevronRight } from 'lucide-react';

function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Carte de projet affichant le résumé, le taux d'avancement et les actions.
 */
export default function ProjectCard({
  project,
  isSelected,
  stats,
  onSelect,
  onEdit,
  onDelete
}) {
  const { id, name, description, createdAt } = project;
  const projectStats = stats || { total: 0, completed: 0, rate: 0 };

  return (
    <div
      onClick={() => onSelect(id)}
      className={`group relative rounded-xl border p-4.5 transition-all duration-150 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'bg-blue-50/40 border-blue-500/80 shadow-xs ring-1 ring-blue-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`p-2 rounded-lg shrink-0 transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
              }`}
            >
              <Folder className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 truncate">
              {name}
            </h3>
          </div>

          {/* Actions : Modifier / Supprimer */}
          <div 
            className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()} // Empêche de déclencher onSelect
          >
            <button
              type="button"
              onClick={() => onEdit(project)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-md transition-colors cursor-pointer"
              title="Modifier le projet"
              aria-label="Modifier le projet"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(project)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-md transition-colors cursor-pointer"
              title="Supprimer le projet"
              aria-label="Supprimer le projet"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {description && (
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/90">
        {/* Barre de progression des tâches du projet */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-slate-400" />
            <span className="tabular-nums font-medium text-slate-700">
              {projectStats.completed} / {projectStats.total}
            </span>{' '}
            tâche{projectStats.total > 1 ? 's' : ''}
          </span>
          <span className="tabular-nums font-semibold text-slate-700">
            {projectStats.rate}%
          </span>
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${projectStats.rate}%` }}
          />
        </div>

        {/* Date de création sans badge pilule */}
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Créé le {formatDate(createdAt)}</span>
          </span>
          <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center">
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
