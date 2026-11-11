import React from 'react';
import { Check, Edit2, Trash2, Calendar, Clock } from 'lucide-react';

/**
 * Formatage de date en français (ex: 11 nov. 2026).
 */
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
 * Composant représentant une tâche unitaire.
 * Conforme aux règles Zero-Pill : métadonnées en texte épuré avec séparateurs typographiques.
 */
export default function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete
}) {
  const { id, title, description, completed, createdAt, updatedAt } = task;

  return (
    <div
      className={`group relative flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-150 task-item-enter ${
        completed
          ? 'bg-slate-50/70 border-slate-200/80'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Checkbox interactive personnalisée */}
      <button
        type="button"
        role="checkbox"
        aria-checked={completed}
        onClick={() => onToggle(id)}
        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          completed
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-slate-300 hover:border-blue-500 bg-white'
        }`}
        title={completed ? "Marquer comme en attente" : "Marquer comme terminée"}
      >
        {completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {/* Contenu principal de la tâche */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm font-medium leading-snug break-words transition-colors ${
              completed
                ? 'line-through text-slate-400'
                : 'text-slate-900'
            }`}
          >
            {title}
          </h4>
        </div>

        {description && (
          <p
            className={`mt-1.5 text-xs leading-relaxed break-words line-clamp-2 ${
              completed ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {description}
          </p>
        )}

        {/* Métadonnées sans pilules (Zero-Pill Discipline) */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Créée le {formatDate(createdAt)}</span>
          </span>

          {updatedAt && updatedAt !== createdAt && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Modifiée le {formatDate(updatedAt)}</span>
              </span>
            </>
          )}

          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className={completed ? "text-emerald-700 font-medium" : "text-amber-700 font-medium"}>
            {completed ? "Terminée" : "En cours"}
          </span>
        </div>
      </div>

      {/* Boutons d'actions rapides (visibles au survol ou sur focus) */}
      <div className="flex items-center gap-1 opacity-80 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
          title="Modifier la tâche"
          aria-label="Modifier la tâche"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Supprimer la tâche"
          aria-label="Supprimer la tâche"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
