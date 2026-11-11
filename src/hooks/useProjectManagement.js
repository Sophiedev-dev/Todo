import { useState, useEffect, useMemo, useCallback } from 'react';
import { storageService } from '../services/storageService.js';

/**
 * Hook personnalisé gérant la logique métier et l'état de l'application TaskFlow.
 * Isole les composants UI des détails de stockage pour faciliter l'introduction future
 * de services comme IndexedDB.
 */
export function useProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filtres et recherche
  const [taskFilter, setTaskFilter] = useState('all'); // 'all' | 'pending' | 'completed'
  const [taskSearch, setTaskSearch] = useState('');
  const [taskSort, setTaskSort] = useState('date_desc'); // 'date_desc' | 'date_asc' | 'title'

  // Notifications de retour utilisateur
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ id: Date.now(), message, type });
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Auto-dismiss notification après 4 secondes
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Chargement initial
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedProjects, fetchedTasks] = await Promise.all([
        storageService.getProjects(),
        storageService.getTasks()
      ]);
      setProjects(fetchedProjects);
      setTasks(fetchedTasks);
      // Sélectionne par défaut le premier projet s'il existe
      if (fetchedProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(fetchedProjects[0].id);
      }
    } catch (err) {
      showNotification(err.message || "Erreur de chargement des données", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId, showNotification]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Projet actuellement sélectionné
  const currentProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Tâches du projet sélectionné
  const currentProjectTasks = useMemo(() => {
    if (!selectedProjectId) return tasks;
    return tasks.filter(t => t.projectId === selectedProjectId);
  }, [tasks, selectedProjectId]);

  // Tâches filtrées, recherchées et triées pour l'affichage
  const displayedTasks = useMemo(() => {
    return currentProjectTasks
      .filter(task => {
        // Filtre par statut
        if (taskFilter === 'completed') return task.completed;
        if (taskFilter === 'pending') return !task.completed;
        return true;
      })
      .filter(task => {
        // Recherche textuelle sur titre et description
        if (!taskSearch.trim()) return true;
        const q = taskSearch.toLowerCase().trim();
        return (
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (taskSort === 'date_desc') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (taskSort === 'date_asc') {
          return new Date(a.createdAt) - new Date(b.createdAt);
        }
        if (taskSort === 'title') {
          return a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' });
        }
        return 0;
      });
  }, [currentProjectTasks, taskFilter, taskSearch, taskSort]);

  // Statistiques calculées
  const stats = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Statistiques par projet
    const projectStatsMap = {};
    projects.forEach(project => {
      const projTasks = tasks.filter(t => t.projectId === project.id);
      const completed = projTasks.filter(t => t.completed).length;
      const total = projTasks.length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      projectStatsMap[project.id] = { total, completed, pending: total - completed, rate };
    });

    return {
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      projectStatsMap
    };
  }, [projects, tasks]);

  // ================= ACTIONS PROJETS =================

  const handleSelectProject = useCallback((projectId) => {
    setSelectedProjectId(projectId);
    setTaskSearch('');
    setTaskFilter('all');
  }, []);

  const handleCreateProject = useCallback(async (projectData) => {
    try {
      const newProject = await storageService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      setSelectedProjectId(newProject.id);
      showNotification(`Projet "${newProject.name}" créé avec succès !`, 'success');
      return { success: true, project: newProject };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification]);

  const handleUpdateProject = useCallback(async (id, updates) => {
    try {
      const updated = await storageService.updateProject(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updated : p));
      showNotification(`Projet "${updated.name}" mis à jour avec succès.`, 'success');
      return { success: true, project: updated };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification]);

  const handleDeleteProject = useCallback(async (id) => {
    try {
      const projectToDelete = projects.find(p => p.id === id);
      const projectName = projectToDelete ? projectToDelete.name : 'Le projet';
      
      const { deletedTasksCount } = await storageService.deleteProject(id);
      
      setProjects(prev => {
        const remaining = prev.filter(p => p.id !== id);
        // Si le projet supprimé était sélectionné, basculer sur un autre
        if (selectedProjectId === id) {
          setSelectedProjectId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });

      setTasks(prev => prev.filter(t => t.projectId !== id));

      const taskMsg = deletedTasksCount > 0 
        ? ` (${deletedTasksCount} tâche${deletedTasksCount > 1 ? 's associées supprimées' : ' associée supprimée'})` 
        : '';
      showNotification(`Projet "${projectName}" supprimé${taskMsg}.`, 'info');
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  }, [projects, selectedProjectId, showNotification]);

  // ================= ACTIONS TÂCHES =================

  const handleCreateTask = useCallback(async (taskData) => {
    try {
      const newTask = await storageService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      showNotification(`Tâche "${newTask.title}" ajoutée avec succès.`, 'success');
      return { success: true, task: newTask };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification]);

  const handleUpdateTask = useCallback(async (id, updates) => {
    try {
      const updated = await storageService.updateTask(id, updates);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      showNotification(`Tâche modifiée avec succès.`, 'success');
      return { success: true, task: updated };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification]);

  const handleToggleTask = useCallback(async (id) => {
    try {
      const updated = await storageService.toggleTaskStatus(id);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
      const statusText = updated.completed ? "marquée comme terminée" : "remise en attente";
      showNotification(`Tâche ${statusText}.`, 'info');
      return { success: true, task: updated };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  }, [showNotification]);

  const handleDeleteTask = useCallback(async (id) => {
    try {
      const taskToDelete = tasks.find(t => t.id === id);
      const title = taskToDelete ? taskToDelete.title : 'Tâche';
      await storageService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      showNotification(`Tâche "${title}" supprimée.`, 'info');
      return { success: true };
    } catch (err) {
      showNotification(err.message, 'error');
      return { success: false, error: err.message };
    }
  }, [tasks, showNotification]);

  const handleResetData = useCallback(async () => {
    try {
      const { projects: resetProjects, tasks: resetTasks } = await storageService.resetToDemoData();
      setProjects(resetProjects);
      setTasks(resetTasks);
      if (resetProjects.length > 0) {
        setSelectedProjectId(resetProjects[0].id);
      }
      showNotification("Données de démonstration réinitialisées.", 'info');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  }, [showNotification]);

  return {
    projects,
    tasks,
    selectedProjectId,
    currentProject,
    currentProjectTasks,
    displayedTasks,
    stats,
    isLoading,
    taskFilter,
    setTaskFilter,
    taskSearch,
    setTaskSearch,
    taskSort,
    setTaskSort,
    notification,
    dismissNotification,
    selectProject: handleSelectProject,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    toggleTask: handleToggleTask,
    deleteTask: handleDeleteTask,
    resetDemoData: handleResetData
  };
}
