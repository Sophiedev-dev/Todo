import React, { useState } from 'react';
import { useProjectManagement } from './hooks/useProjectManagement.js';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './pages/Dashboard.jsx';
import NotificationToast from './components/NotificationToast.jsx';

/**
 * Composant racine de l'application TaskFlow.
 * Assemble la mise en page (Sidebar + Header + Dashboard),
 * gère l'état d'affichage responsive et les notifications.
 */
export default function App() {
  const projectState = useProjectManagement();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // États modaux pour l'ouverture via le Header ou d'autres raccourcis
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  return (
    <div className="dashboard-container">
      {/* Barre latérale responsive */}
      <Sidebar
        projects={projectState.projects}
        selectedProjectId={projectState.selectedProjectId}
        projectStatsMap={projectState.stats.projectStatsMap}
        onSelectProject={projectState.selectProject}
        onAddProject={() => setIsProjectModalOpen(true)}
        onResetDemoData={projectState.resetDemoData}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Conteneur principal */}
      <div className="dashboard-main min-h-screen flex flex-col">
        {/* En-tête supérieur */}
        <Header
          currentProject={projectState.currentProject}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onNewTask={() => setIsTaskModalOpen(true)}
          onNewProject={() => setIsProjectModalOpen(true)}
        />

        {/* Corps du tableau de bord */}
        <main className="flex-1 overflow-y-auto">
          <Dashboard
            projectState={projectState}
            isProjectModalOpen={isProjectModalOpen}
            setIsProjectModalOpen={setIsProjectModalOpen}
            isTaskModalOpen={isTaskModalOpen}
            setIsTaskModalOpen={setIsTaskModalOpen}
          />
        </main>
      </div>

      {/* Notifications toast de retour utilisateur */}
      <NotificationToast
        notification={projectState.notification}
        onDismiss={projectState.dismissNotification}
      />
    </div>
  );
}
