import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Edit3 } from 'lucide-react';

/**
 * Formulaire modal pour créer ou modifier une tâche.
 * Valide que le titre n'est pas vide et qu'un projet est associé.
 */
export default function TaskForm({
  isOpen,
  task = null, // null = création, objet = édition
  projects = [],
  defaultProjectId = null,
  onSubmit,
  onCancel
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(task);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setProjectId(task.projectId || defaultProjectId || (projects[0] ? projects[0].id : ''));
    } else {
      setTitle('');
      setDescription('');
      setProjectId(defaultProjectId || (projects[0] ? projects[0].id : ''));
    }
    setError('');
  }, [task, defaultProjectId, projects, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Le titre de la tâche est obligatoire.");
      return;
    }
    if (!projectId) {
      setError("Veuillez sélectionner un projet valide.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        projectId
      });
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
            </div>
            <h2 id="task-modal-title" className="text-base font-semibold text-slate-900">
              {isEditMode ? "Modifier la tâche" : "Créer une nouvelle tâche"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="task-project" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Projet associé <span className="text-red-500">*</span>
            </label>
            <select
              id="task-project"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Titre de la tâche <span className="text-red-500">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ex: Rédiger le cahier des charges, valider le prototype..."
              className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description / Notes détaillées
            </label>
            <textarea
              id="task-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Précisez les consignes, liens ou critères d'acceptation..."
              className="w-full px-3.5 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Enregistrement..." : isEditMode ? "Enregistrer les modifications" : "Créer la tâche"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
