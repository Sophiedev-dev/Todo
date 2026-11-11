import React, { useState } from 'react';
import DashboardStats from '../components/DashboardStats.jsx';
import ProjectList from '../components/ProjectList.jsx';
import TaskList from '../components/TaskList.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import TaskForm from '../components/TaskForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

/**
 * Page principale du tableau de bord TaskFlow.
 * Orchestre les statistiques, la liste des projets, la gestion des tâches
 * et les fenêtres modales de création/édition/suppression.
 */
export default function Dashboard({
  projectState,
  isProjectModalOpen,
  setIsProjectModalOpen,
  isTaskModalOpen,
  setIsTaskModalOpen
}) {
  const {
    projects,
    tasks,
    selectedProjectId,
    currentProject,
    currentProjectTasks,
    displayedTasks,
    stats,
    taskFilter,
    setTaskFilter,
    taskSearch,
    setTaskSearch,
    taskSort,
    setTaskSort,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    toggleTask,
    deleteTask
  } = projectState;

  // États locaux pour l'édition et les confirmations
  const [editingProject, setEditingProject] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // État de la boîte de dialogue de confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Supprimer',
    onConfirm: () => {}
  });

  // Calcul des compteurs pour le projet actuel
  const pendingCount = currentProjectTasks.filter((t) => !t.completed).length;
  const completedCount = currentProjectTasks.filter((t) => t.completed).length;

  // Handlers Projets
  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectModalOpen(false);
    setEditingProject(null);
  };

  const handleSubmitProjectForm = async (data) => {
    if (editingProject) {
      const res = await updateProject(editingProject.id, data);
      if (res.success) handleCloseProjectModal();
    } else {
      const res = await createProject(data);
      if (res.success) handleCloseProjectModal();
    }
  };

  const handlePromptDeleteProject = (project) => {
    const associatedTasksCount = tasks.filter((t) => t.projectId === project.id).length;
    const warningMsg =
      associatedTasksCount > 0
        ? `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ? Cette action supprimera définitivement ${associatedTasksCount} tâche${
            associatedTasksCount > 1 ? 's associées' : ' associée'
          }.`
        : `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`;

    setConfirmDialog({
      isOpen: true,
      title: "Supprimer le projet",
      message: warningMsg,
      confirmLabel: "Supprimer définitivement",
      onConfirm: async () => {
        await deleteProject(project.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Handlers Tâches
  const handleOpenCreateTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleSubmitTaskForm = async (data) => {
    if (editingTask) {
      const res = await updateTask(editingTask.id, data);
      if (res.success) handleCloseTaskModal();
    } else {
      const res = await createTask(data);
      if (res.success) handleCloseTaskModal();
    }
  };

  const handlePromptDeleteTask = (task) => {
    setConfirmDialog({
      isOpen: true,
      title: "Supprimer la tâche",
      message: `Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`,
      confirmLabel: "Supprimer la tâche",
      onConfirm: async () => {
        await deleteTask(task.id);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* 1. Message de bienvenue & Titre principal */}
      <section>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 leading-relaxed max-w-2xl">
          Suivez l'avancement de vos projets, organisez vos tâches prioritaires et mesurez votre productivité au quotidien.
        </p>
      </section>

      {/* 2. Cartes statistiques globales */}
      <section aria-label="Statistiques clés">
        <DashboardStats stats={stats} />
      </section>

      {/* 3. Section d'aperçu des projets */}
      <section aria-label="Aperçu des projets">
        <ProjectList
          projects={projects}
          selectedProjectId={selectedProjectId}
          projectStatsMap={stats.projectStatsMap}
          onSelectProject={selectProject}
          onAddProject={handleOpenCreateProject}
          onEditProject={handleOpenEditProject}
          onDeleteProject={handlePromptDeleteProject}
        />
      </section>

      {/* 4. Section de gestion des tâches du projet sélectionné */}
      <section aria-label="Gestion des tâches">
        <TaskList
          currentProject={currentProject}
          tasks={displayedTasks}
          allProjectTasksCount={currentProjectTasks.length}
          pendingCount={pendingCount}
          completedCount={completedCount}
          filter={taskFilter}
          onFilterChange={setTaskFilter}
          searchQuery={taskSearch}
          onSearchChange={setTaskSearch}
          sortOption={taskSort}
          onSortChange={setTaskSort}
          onAddTask={handleOpenCreateTask}
          onToggleTask={toggleTask}
          onEditTask={handleOpenEditTask}
          onDeleteTask={handlePromptDeleteTask}
          onEditProject={handleOpenEditProject}
          onDeleteProject={handlePromptDeleteProject}
        />
      </section>

      {/* Fenêtres modales et dialogues */}
      <ProjectForm
        isOpen={isProjectModalOpen}
        project={editingProject}
        onSubmit={handleSubmitProjectForm}
        onCancel={handleCloseProjectModal}
      />

      <TaskForm
        isOpen={isTaskModalOpen}
        task={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
        onSubmit={handleSubmitTaskForm}
        onCancel={handleCloseTaskModal}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        isDanger={true}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
