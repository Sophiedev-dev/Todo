import React from 'react';
import { FolderKanban, CheckSquare, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

/**
 * Cartes statistiques du tableau de bord.
 * Respecte les directives SaaS : chiffres tabulaires (tabular-nums),
 * élévation simple et contrastes accessibles sans faux scoreboards.
 */
export default function DashboardStats({ stats }) {
  const {
    totalProjects = 0,
    totalTasks = 0,
    completedTasks = 0,
    pendingTasks = 0,
    completionRate = 0
  } = stats || {};

  const statItems = [
    {
      id: 'projects',
      label: 'Projets au total',
      value: totalProjects,
      description: 'Dossiers actifs',
      icon: <FolderKanban className="w-5 h-5 text-blue-600" />,
      bgIcon: 'bg-blue-50'
    },
    {
      id: 'total_tasks',
      label: 'Tâches au total',
      value: totalTasks,
      description: 'Toutes catégories confondues',
      icon: <CheckSquare className="w-5 h-5 text-slate-700" />,
      bgIcon: 'bg-slate-100'
    },
    {
      id: 'completed_tasks',
      label: 'Tâches terminées',
      value: completedTasks,
      description: `${completionRate}% du total accompli`,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      bgIcon: 'bg-emerald-50'
    },
    {
      id: 'pending_tasks',
      label: 'Tâches en attente',
      value: pendingTasks,
      description: 'Restant à finaliser',
      icon: <Clock className="w-5 h-5 text-amber-600" />,
      bgIcon: 'bg-amber-50'
    }
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {statItems.map((item) => (
          <div
            key={item.id}
            className="stat-card-transition bg-white p-4.5 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                {item.label}
              </span>
              <div className={`p-2 rounded-lg ${item.bgIcon}`}>
                {item.icon}
              </div>
            </div>

            <div className="mt-2">
              <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
                {item.value}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barre de progression globale discrète */}
      {totalTasks > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">
                Progression globale des projets
              </div>
              <div className="text-xs text-slate-500">
                <span className="tabular-nums font-medium text-slate-700">{completedTasks}</span> sur{' '}
                <span className="tabular-nums font-medium text-slate-700">{totalTasks}</span> tâches terminées
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:w-64 shrink-0">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-800 tabular-nums w-10 text-right">
              {completionRate}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
