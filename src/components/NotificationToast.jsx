import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

/**
 * Composant de notification Toast pour fournir un retour immédiat
 * aux actions de l'utilisateur (création, modification, suppression).
 */
export default function NotificationToast({ notification, onDismiss }) {
  if (!notification) return null;

  const { type, message } = notification;

  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
    },
    error: {
      bg: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />
    }
  };

  const current = config[type] || config.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className={`flex items-start gap-3 p-3.5 rounded-lg border shadow-lg ${current.bg}`}>
        {current.icon}
        <div className="flex-1 text-sm font-medium leading-5">
          {message}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
