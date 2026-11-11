import React from 'react';
import { Layers, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Écran affiché tant que les données IndexedDB ne sont pas disponibles :
 *  - status="loading" : chargement en cours (aucun message « vide » n'est affiché) ;
 *  - status="error"   : échec du chargement, avec bouton de réessai.
 */
export default function DataLoadState({ status = 'loading', message = '', onRetry }) {
  const isError = status === 'error';

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <Layers className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-900">TaskFlow</span>
        </div>

        {isError ? (
          <div
            role="alert"
            className="bg-white rounded-xl border border-slate-200 shadow-xs p-6"
          >
            <div className="mx-auto w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-sm font-semibold text-slate-900">
              Impossible de charger vos données
            </h1>
            {message && (
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{message}</p>
            )}
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réessayer</span>
            </button>
          </div>
        ) : (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" aria-hidden="true" />
            <p className="text-sm text-slate-600">Chargement de vos données…</p>
          </div>
        )}
      </div>
    </div>
  );
}
