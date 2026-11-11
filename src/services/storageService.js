/**
 * Service de persistance de données (actuellement en mémoire).
 * 
 * Conçu selon le principe de séparation des responsabilités (SOC) :
 * ce service encapsule toutes les opérations CRUD sur les projets et les tâches.
 * Lorsque IndexedDB sera introduit, seul ce module aura besoin d'être mis à jour,
 * sans impacter les composants UI ou les hooks de l'application.
 */

import { INITIAL_PROJECTS, INITIAL_TASKS } from '../data/mockData.js';

// Stockage en mémoire initialisé avec les données modèles
let projectsStore = [...INITIAL_PROJECTS];
let tasksStore = [...INITIAL_TASKS];

export const storageService = {
  /**
   * Récupère tous les projets.
   * @returns {Promise<Array>} Liste des projets
   */
  async getProjects() {
    return Promise.resolve([...projectsStore]);
  },

  /**
   * Crée un nouveau projet.
   * @param {Object} projectData { name, description }
   * @returns {Promise<Object>} Projet créé
   */
  async createProject(projectData) {
    if (!projectData.name || !projectData.name.trim()) {
      throw new Error("Le nom du projet est obligatoire.");
    }

    const newProject = {
      id: `proj-${Date.now()}`,
      name: projectData.name.trim(),
      description: (projectData.description || '').trim(),
      createdAt: new Date().toISOString()
    };

    projectsStore = [newProject, ...projectsStore];
    return Promise.resolve(newProject);
  },

  /**
   * Met à jour un projet existant.
   * @param {string} id
   * @param {Object} updates { name, description }
   * @returns {Promise<Object>} Projet mis à jour
   */
  async updateProject(id, updates) {
    const index = projectsStore.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error("Projet introuvable.");
    }

    if (updates.name !== undefined && !updates.name.trim()) {
      throw new Error("Le nom du projet ne peut pas être vide.");
    }

    const updated = {
      ...projectsStore[index],
      ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description.trim() } : {})
    };

    projectsStore = [
      ...projectsStore.slice(0, index),
      updated,
      ...projectsStore.slice(index + 1)
    ];

    return Promise.resolve(updated);
  },

  /**
   * Supprime un projet et toutes les tâches associées.
   * @param {string} id
   * @returns {Promise<{ projectId: string, deletedTasksCount: number }>}
   */
  async deleteProject(id) {
    const index = projectsStore.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error("Projet introuvable.");
    }

    // Retirer le projet
    projectsStore = projectsStore.filter(p => p.id !== id);

    // Supprimer en cascade toutes les tâches liées à ce projet
    const previousTaskCount = tasksStore.length;
    tasksStore = tasksStore.filter(t => t.projectId !== id);
    const deletedTasksCount = previousTaskCount - tasksStore.length;

    return Promise.resolve({ projectId: id, deletedTasksCount });
  },

  /**
   * Récupère toutes les tâches (optionnellement filtrées par projectId).
   * @param {string|null} projectId
   * @returns {Promise<Array>} Liste des tâches
   */
  async getTasks(projectId = null) {
    if (projectId) {
      return Promise.resolve(tasksStore.filter(t => t.projectId === projectId));
    }
    return Promise.resolve([...tasksStore]);
  },

  /**
   * Crée une nouvelle tâche pour un projet donné.
   * @param {Object} taskData { projectId, title, description }
   * @returns {Promise<Object>} Tâche créée
   */
  async createTask(taskData) {
    if (!taskData.projectId) {
      throw new Error("Une tâche doit obligatoirement être associée à un projet valide.");
    }
    if (!taskData.title || !taskData.title.trim()) {
      throw new Error("Le titre de la tâche est obligatoire.");
    }

    const projectExists = projectsStore.some(p => p.id === taskData.projectId);
    if (!projectExists) {
      throw new Error("Le projet spécifié n'existe pas.");
    }

    const now = new Date().toISOString();
    const newTask = {
      id: `task-${Date.now()}`,
      projectId: taskData.projectId,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    tasksStore = [newTask, ...tasksStore];
    return Promise.resolve(newTask);
  },

  /**
   * Met à jour une tâche existante.
   * @param {string} id
   * @param {Object} updates { title, description, completed }
   * @returns {Promise<Object>} Tâche mise à jour
   */
  async updateTask(id, updates) {
    const index = tasksStore.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error("Tâche introuvable.");
    }

    if (updates.title !== undefined && !updates.title.trim()) {
      throw new Error("Le titre de la tâche ne peut pas être vide.");
    }

    const current = tasksStore[index];
    const updated = {
      ...current,
      ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
      ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
      ...(updates.completed !== undefined ? { completed: Boolean(updates.completed) } : {}),
      updatedAt: new Date().toISOString()
    };

    tasksStore = [
      ...tasksStore.slice(0, index),
      updated,
      ...tasksStore.slice(index + 1)
    ];

    return Promise.resolve(updated);
  },

  /**
   * Bascule le statut d'une tâche (terminée / en attente).
   * @param {string} id
   * @returns {Promise<Object>} Tâche mise à jour
   */
  async toggleTaskStatus(id) {
    const task = tasksStore.find(t => t.id === id);
    if (!task) {
      throw new Error("Tâche introuvable.");
    }
    return this.updateTask(id, { completed: !task.completed });
  },

  /**
   * Supprime une tâche par son identifiant.
   * @param {string} id
   * @returns {Promise<string>} Id de la tâche supprimée
   */
  async deleteTask(id) {
    const index = tasksStore.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error("Tâche introuvable.");
    }
    tasksStore = tasksStore.filter(t => t.id !== id);
    return Promise.resolve(id);
  },

  /**
   * Efface toutes les données en mémoire.
   */
  async clearAllData() {
    projectsStore = [];
    tasksStore = [];
    return Promise.resolve({ projects: [], tasks: [] });
  },

  /**
   * Réinitialise les données (vide).
   */
  async resetToDemoData() {
    return this.clearAllData();
  }
};
