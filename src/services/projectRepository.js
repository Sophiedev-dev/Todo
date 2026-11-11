/**
 * Repository des projets : opérations brutes sur l'object store `projects`.
 *
 * - Pas de validation métier ni de génération d'identifiants (rôle de storageService).
 * - Chaque fonction accepte un paramètre optionnel `tx` :
 *     • sans `tx` : la fonction ouvre sa propre transaction et ne résout
 *       qu'une fois celle-ci terminée (données écrites) ;
 *     • avec `tx` : la fonction s'exécute dans la transaction fournie
 *       (ex: suppression atomique d'un projet et de ses tâches). C'est alors
 *       l'appelant (runTransaction) qui garantit l'achèvement de la transaction.
 */

import {
  STORES,
  INDEXES,
  DatabaseError,
  runTransaction,
  requestToPromise
} from './db.js';

function withStore(mode, tx, operation) {
  if (tx) {
    return operation(tx.objectStore(STORES.PROJECTS));
  }
  return runTransaction(STORES.PROJECTS, mode, (ownTx) =>
    operation(ownTx.objectStore(STORES.PROJECTS))
  );
}

/**
 * Tous les projets, du plus récent au plus ancien (même ordre que le stockage actuel).
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Array>}
 */
export function getAllProjects(tx) {
  return withStore('readonly', tx, async (store) => {
    const projects = await requestToPromise(store.index(INDEXES.CREATED_AT).getAll());
    return projects.reverse();
  });
}

/**
 * @param {string} id
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Object|null>} le projet, ou null s'il n'existe pas
 */
export function getProjectById(id, tx) {
  return withStore('readonly', tx, async (store) => {
    const project = await requestToPromise(store.get(id));
    return project ?? null;
  });
}

/**
 * Insère un nouveau projet. Échoue (ConstraintError) si l'id existe déjà.
 * @param {Object} project objet complet, id inclus
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Object>} le projet enregistré
 */
export function addProject(project, tx) {
  return withStore('readwrite', tx, async (store) => {
    await requestToPromise(store.add(project));
    return project;
  });
}

/**
 * Remplace un projet existant. Échoue (NotFoundError) s'il n'existe pas,
 * pour éviter qu'une mise à jour ne crée silencieusement un nouvel enregistrement.
 * @param {Object} project objet complet, id inclus
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Object>} le projet enregistré
 */
export function updateProject(project, tx) {
  return withStore('readwrite', tx, async (store) => {
    const existing = await requestToPromise(store.get(project.id));
    if (existing === undefined) {
      throw new DatabaseError('Projet introuvable.', { code: 'NotFoundError' });
    }
    await requestToPromise(store.put(project));
    return project;
  });
}

/**
 * Vide entièrement l'object store `projects`.
 * Pour tout effacer de façon atomique, appeler aussi taskRepository.clearTasks
 * dans la même transaction.
 * @param {IDBTransaction} [tx]
 * @returns {Promise<void>}
 */
export function clearProjects(tx) {
  return withStore('readwrite', tx, async (store) => {
    await requestToPromise(store.clear());
  });
}

/**
 * Supprime un projet. Ne supprime PAS ses tâches : pour une suppression en
 * cascade, appeler aussi taskRepository.deleteTasksByProjectId dans la même
 * transaction (stores 'projects' et 'tasks').
 * @param {string} id
 * @param {IDBTransaction} [tx]
 * @returns {Promise<boolean>} true si le projet existait
 */
export function deleteProject(id, tx) {
  return withStore('readwrite', tx, async (store) => {
    const existing = await requestToPromise(store.getKey(id));
    if (existing === undefined) return false;
    await requestToPromise(store.delete(id));
    return true;
  });
}
