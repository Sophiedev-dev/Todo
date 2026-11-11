/**
 * Repository des tâches : opérations brutes sur l'object store `tasks`.
 *
 * - Pas de validation métier ni de génération d'identifiants (rôle de storageService).
 *   En particulier, l'existence du projet référencé par `projectId` n'est PAS
 *   vérifiée ici : storageService le fera dans une transaction couvrant
 *   'projects' et 'tasks'.
 * - Chaque fonction accepte un paramètre optionnel `tx` (voir projectRepository.js).
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
    return operation(tx.objectStore(STORES.TASKS));
  }
  return runTransaction(STORES.TASKS, mode, (ownTx) =>
    operation(ownTx.objectStore(STORES.TASKS))
  );
}

/**
 * Toutes les tâches, de la plus récente à la plus ancienne.
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Array>}
 */
export function getAllTasks(tx) {
  return withStore('readonly', tx, async (store) => {
    const tasks = await requestToPromise(store.index(INDEXES.CREATED_AT).getAll());
    return tasks.reverse();
  });
}

/**
 * @param {string} id
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Object|null>} la tâche, ou null si elle n'existe pas
 */
export function getTaskById(id, tx) {
  return withStore('readonly', tx, async (store) => {
    const task = await requestToPromise(store.get(id));
    return task ?? null;
  });
}

/**
 * Tâches d'un projet (via l'index `projectId`), de la plus récente à la plus ancienne.
 * @param {string} projectId
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Array>}
 */
export function getTasksByProjectId(projectId, tx) {
  return withStore('readonly', tx, async (store) => {
    const tasks = await requestToPromise(
      store.index(INDEXES.PROJECT_ID).getAll(IDBKeyRange.only(projectId))
    );
    return tasks.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  });
}

/**
 * Insère une nouvelle tâche. Échoue (ConstraintError) si l'id existe déjà.
 * @param {Object} task objet complet, id inclus
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Object>} la tâche enregistrée
 */
export function addTask(task, tx) {
  return withStore('readwrite', tx, async (store) => {
    await requestToPromise(store.add(task));
    return task;
  });
}

/**
 * Remplace une tâche existante. Échoue (NotFoundError) si elle n'existe pas.
 * @param {Object} task objet complet, id inclus
 * @param {IDBTransaction} [tx]
 * @returns {Promise<Object>} la tâche enregistrée
 */
export function updateTask(task, tx) {
  return withStore('readwrite', tx, async (store) => {
    const existing = await requestToPromise(store.get(task.id));
    if (existing === undefined) {
      throw new DatabaseError('Tâche introuvable.', { code: 'NotFoundError' });
    }
    await requestToPromise(store.put(task));
    return task;
  });
}

/**
 * @param {string} id
 * @param {IDBTransaction} [tx]
 * @returns {Promise<boolean>} true si la tâche existait
 */
export function deleteTask(id, tx) {
  return withStore('readwrite', tx, async (store) => {
    const existing = await requestToPromise(store.getKey(id));
    if (existing === undefined) return false;
    await requestToPromise(store.delete(id));
    return true;
  });
}

/**
 * Vide entièrement l'object store `tasks`.
 * @param {IDBTransaction} [tx]
 * @returns {Promise<void>}
 */
export function clearTasks(tx) {
  return withStore('readwrite', tx, async (store) => {
    await requestToPromise(store.clear());
  });
}

/**
 * Supprime toutes les tâches d'un projet (curseur sur l'index `projectId`).
 * @param {string} projectId
 * @param {IDBTransaction} [tx]
 * @returns {Promise<number>} nombre de tâches supprimées
 */
export function deleteTasksByProjectId(projectId, tx) {
  return withStore('readwrite', tx, (store) =>
    new Promise((resolve, reject) => {
      let deletedCount = 0;
      const request = store.index(INDEXES.PROJECT_ID).openCursor(IDBKeyRange.only(projectId));

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve(deletedCount);
          return;
        }
        cursor.delete();
        deletedCount += 1;
        cursor.continue();
      };
      request.onerror = () => reject(request.error);
    })
  );
}
