/**
 * Service de persistance de données (IndexedDB).
 *
 * Point d'accès unique aux données pour le reste de l'application :
 * l'API publique (noms, paramètres, valeurs de retour, erreurs levées) est
 * identique à l'ancienne implémentation en mémoire, afin que le hook
 * useProjectManagement et les composants n'aient pas à changer.
 *
 * Répartition des rôles :
 *  - storageService : validation métier, génération des ids, horodatage,
 *    intégrité des relations projet ↔ tâche, transactions multi-stores ;
 *  - projectRepository / taskRepository : opérations brutes sur les stores ;
 *  - db.js : connexion, schéma, transactions, traduction des erreurs.
 *
 * Toutes les erreurs levées sont des `Error` (DatabaseError hérite d'Error)
 * dont le `message` est en français et affichable tel quel.
 */

import { STORES, runTransaction } from './db.js';
import * as projectRepository from './projectRepository.js';
import * as taskRepository from './taskRepository.js';

// ================= UTILITAIRES =================

/**
 * Génère un identifiant unique préfixé (ex: "proj-1b9d6bcd-...").
 * `crypto.randomUUID()` n'existe que dans un contexte sécurisé (https ou localhost).
 * Le serveur de dev étant aussi accessible via l'IP du réseau local (http),
 * on se replie sur `crypto.getRandomValues()` pour produire un UUID v4 équivalent.
 */
function generateId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variante RFC 4122
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}-${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const BOTH_STORES = [STORES.PROJECTS, STORES.TASKS];

/**
 * Vérifie, dans la transaction fournie, que le projet existe.
 * La transaction doit couvrir le store 'projects'.
 */
async function assertProjectExists(projectId, tx) {
  const project = await projectRepository.getProjectById(projectId, tx);
  if (!project) {
    throw new Error("Le projet spécifié n'existe pas.");
  }
}

/**
 * Applique des modifications à une tâche dans la transaction fournie
 * (stores 'projects' et 'tasks'). Partagé par updateTask et toggleTaskStatus.
 */
async function applyTaskUpdate(id, updates, tx) {
  const current = await taskRepository.getTaskById(id, tx);
  if (!current) {
    throw new Error('Tâche introuvable.');
  }

  if (updates.title !== undefined && !updates.title.trim()) {
    throw new Error('Le titre de la tâche ne peut pas être vide.');
  }

  // Déplacement vers un autre projet : le projet de destination doit exister.
  const isMoving = updates.projectId !== undefined && updates.projectId !== current.projectId;
  if (isMoving) {
    if (!updates.projectId) {
      throw new Error('Une tâche doit obligatoirement être associée à un projet valide.');
    }
    await assertProjectExists(updates.projectId, tx);
  }

  const updated = {
    ...current,
    ...(isMoving ? { projectId: updates.projectId } : {}),
    ...(updates.title !== undefined ? { title: updates.title.trim() } : {}),
    ...(updates.description !== undefined ? { description: updates.description.trim() } : {}),
    ...(updates.completed !== undefined ? { completed: Boolean(updates.completed) } : {}),
    updatedAt: new Date().toISOString()
  };

  await taskRepository.updateTask(updated, tx);
  return updated;
}

// ================= API PUBLIQUE =================

export const storageService = {
  /**
   * Récupère tous les projets, du plus récent au plus ancien.
   * @returns {Promise<Array>} Liste des projets
   */
  async getProjects() {
    return projectRepository.getAllProjects();
  },

  /**
   * Crée un nouveau projet.
   * @param {Object} projectData { name, description }
   * @returns {Promise<Object>} Projet créé
   */
  async createProject(projectData) {
    if (!projectData.name || !projectData.name.trim()) {
      throw new Error('Le nom du projet est obligatoire.');
    }

    const newProject = {
      id: generateId('proj'),
      name: projectData.name.trim(),
      description: (projectData.description || '').trim(),
      createdAt: new Date().toISOString()
    };

    await projectRepository.addProject(newProject);
    return newProject;
  },

  /**
   * Met à jour un projet existant.
   * @param {string} id
   * @param {Object} updates { name, description }
   * @returns {Promise<Object>} Projet mis à jour
   */
  async updateProject(id, updates) {
    return runTransaction(STORES.PROJECTS, 'readwrite', async (tx) => {
      const current = await projectRepository.getProjectById(id, tx);
      if (!current) {
        throw new Error('Projet introuvable.');
      }

      if (updates.name !== undefined && !updates.name.trim()) {
        throw new Error('Le nom du projet ne peut pas être vide.');
      }

      const updated = {
        ...current,
        ...(updates.name !== undefined ? { name: updates.name.trim() } : {}),
        ...(updates.description !== undefined ? { description: updates.description.trim() } : {})
      };

      await projectRepository.updateProject(updated, tx);
      return updated;
    });
  },

  /**
   * Supprime un projet et toutes les tâches associées, dans UNE transaction :
   * soit tout est supprimé, soit rien ne l'est.
   * @param {string} id
   * @returns {Promise<{ projectId: string, deletedTasksCount: number }>}
   */
  async deleteProject(id) {
    return runTransaction(BOTH_STORES, 'readwrite', async (tx) => {
      const existing = await projectRepository.getProjectById(id, tx);
      if (!existing) {
        throw new Error('Projet introuvable.');
      }

      const deletedTasksCount = await taskRepository.deleteTasksByProjectId(id, tx);
      await projectRepository.deleteProject(id, tx);

      return { projectId: id, deletedTasksCount };
    });
  },

  /**
   * Récupère toutes les tâches (optionnellement filtrées par projectId),
   * de la plus récente à la plus ancienne.
   * @param {string|null} projectId
   * @returns {Promise<Array>} Liste des tâches
   */
  async getTasks(projectId = null) {
    if (projectId) {
      return taskRepository.getTasksByProjectId(projectId);
    }
    return taskRepository.getAllTasks();
  },

  /**
   * Crée une nouvelle tâche pour un projet existant.
   * La vérification du projet et l'insertion se font dans la même transaction.
   * @param {Object} taskData { projectId, title, description }
   * @returns {Promise<Object>} Tâche créée
   */
  async createTask(taskData) {
    if (!taskData.projectId) {
      throw new Error('Une tâche doit obligatoirement être associée à un projet valide.');
    }
    if (!taskData.title || !taskData.title.trim()) {
      throw new Error('Le titre de la tâche est obligatoire.');
    }

    const now = new Date().toISOString();
    const newTask = {
      id: generateId('task'),
      projectId: taskData.projectId,
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      completed: false,
      createdAt: now,
      updatedAt: now
    };

    return runTransaction(BOTH_STORES, 'readwrite', async (tx) => {
      await assertProjectExists(newTask.projectId, tx);
      await taskRepository.addTask(newTask, tx);
      return newTask;
    });
  },

  /**
   * Met à jour une tâche existante. Accepte `projectId` pour déplacer la
   * tâche vers un autre projet (qui doit exister).
   * @param {string} id
   * @param {Object} updates { title, description, completed, projectId }
   * @returns {Promise<Object>} Tâche mise à jour
   */
  async updateTask(id, updates) {
    return runTransaction(BOTH_STORES, 'readwrite', (tx) => applyTaskUpdate(id, updates, tx));
  },

  /**
   * Bascule le statut d'une tâche (terminée / en attente).
   * Lecture et écriture dans la même transaction.
   * @param {string} id
   * @returns {Promise<Object>} Tâche mise à jour
   */
  async toggleTaskStatus(id) {
    return runTransaction(BOTH_STORES, 'readwrite', async (tx) => {
      const task = await taskRepository.getTaskById(id, tx);
      if (!task) {
        throw new Error('Tâche introuvable.');
      }
      return applyTaskUpdate(id, { completed: !task.completed }, tx);
    });
  },

  /**
   * Supprime une tâche par son identifiant.
   * @param {string} id
   * @returns {Promise<string>} Id de la tâche supprimée
   */
  async deleteTask(id) {
    const existed = await taskRepository.deleteTask(id);
    if (!existed) {
      throw new Error('Tâche introuvable.');
    }
    return id;
  },

  /**
   * Efface tous les projets et toutes les tâches, dans UNE transaction.
   * @returns {Promise<{ projects: Array, tasks: Array }>}
   */
  async clearAllData() {
    await runTransaction(BOTH_STORES, 'readwrite', async (tx) => {
      await taskRepository.clearTasks(tx);
      await projectRepository.clearProjects(tx);
    });
    return { projects: [], tasks: [] };
  },

  /**
   * Réinitialise les données (vide).
   */
  async resetToDemoData() {
    return this.clearAllData();
  }
};
