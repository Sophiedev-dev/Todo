/**
 * Couche d'accès bas niveau à IndexedDB pour TaskFlow.
 *
 * Responsabilités :
 *  - ouvrir (une seule fois) la base `taskflow` et la partager ;
 *  - créer / migrer le schéma selon la version ;
 *  - fournir des utilitaires Promise pour les requêtes et les transactions ;
 *  - traduire les erreurs IndexedDB en erreurs lisibles (DatabaseError).
 *
 * Aucune logique métier ici : ni validation, ni génération d'identifiants.
 */

export const DB_NAME = 'taskflow';
export const DB_VERSION = 1;

export const STORES = Object.freeze({
  PROJECTS: 'projects',
  TASKS: 'tasks'
});

export const INDEXES = Object.freeze({
  CREATED_AT: 'createdAt',
  PROJECT_ID: 'projectId'
});

// ================= ERREURS =================

const ERROR_MESSAGES = {
  QuotaExceededError: "L'espace de stockage du navigateur est plein.",
  ConstraintError: 'Un enregistrement avec cet identifiant existe déjà.',
  VersionError: 'La base de données locale est dans une version plus récente que cette application. Rechargez la page.',
  InvalidStateError: 'La connexion à la base de données locale a été fermée. Rechargez la page.',
  NotFoundError: "L'élément demandé est introuvable.",
  AbortError: "L'opération sur la base de données a été annulée.",
  TransactionInactiveError: "L'opération sur la base de données locale a été interrompue. Veuillez réessayer.",
  ReadOnlyError: "Écriture impossible : la base de données locale est en lecture seule.",
  DataError: 'Les données envoyées à la base de données locale sont invalides.',
  DataCloneError: 'Ces données ne peuvent pas être enregistrées dans la base de données locale.',
  UnknownError: 'Une erreur inattendue est survenue dans la base de données locale.',
  UnavailableError: "Le stockage local (IndexedDB) n'est pas disponible dans ce navigateur."
};

/**
 * Erreur normalisée de la couche base de données.
 * `code` reprend le nom de l'erreur IndexedDB d'origine (ex: 'ConstraintError').
 */
export class DatabaseError extends Error {
  constructor(message, { code = 'UnknownError', cause = null } = {}) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.cause = cause;
  }
}

/**
 * Convertit n'importe quelle erreur (DOMException, Error, null) en DatabaseError.
 */
export function toDatabaseError(error, fallbackMessage = ERROR_MESSAGES.UnknownError) {
  if (error instanceof DatabaseError) return error;
  const code = (error && error.name) || 'UnknownError';

  if (ERROR_MESSAGES[code]) {
    return new DatabaseError(ERROR_MESSAGES[code], { code, cause: error || null });
  }

  // Erreur applicative (ex: validation levée dans une transaction) :
  // conserver son message, déjà destiné à l'utilisateur.
  const isDomException = typeof DOMException !== 'undefined' && error instanceof DOMException;
  if (error instanceof Error && !isDomException && error.message) {
    return new DatabaseError(error.message, { code, cause: error });
  }

  return new DatabaseError(fallbackMessage, { code, cause: error || null });
}

// ================= ÉVÉNEMENTS DE CONNEXION =================

const listeners = new Set();

/**
 * Permet à l'interface (plus tard) d'être prévenue des événements de connexion :
 *  - 'blocked'       : la mise à jour du schéma attend la fermeture d'autres onglets ;
 *  - 'versionchange' : un autre onglet met à jour la base, la connexion est fermée ;
 *  - 'close'         : la connexion a été fermée de façon inattendue par le navigateur.
 * @param {(event: { type: string }) => void} listener
 * @returns {() => void} fonction de désinscription
 */
export function onDatabaseEvent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(type) {
  listeners.forEach((listener) => {
    try {
      listener({ type });
    } catch (err) {
      console.error('[TaskFlow DB] Erreur dans un écouteur :', err);
    }
  });
}

// ================= SCHÉMA & MIGRATIONS =================

/**
 * Applique les migrations successives à partir de `oldVersion`.
 * Règle : ne jamais modifier un `case` déjà publié, seulement en ajouter.
 * Les `case` s'enchaînent volontairement (pas de `break`).
 */
function upgradeSchema(db, oldVersion) {
  switch (oldVersion) {
    case 0: {
      const projects = db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      projects.createIndex(INDEXES.CREATED_AT, 'createdAt', { unique: false });

      const tasks = db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
      tasks.createIndex(INDEXES.PROJECT_ID, 'projectId', { unique: false });
      tasks.createIndex(INDEXES.CREATED_AT, 'createdAt', { unique: false });
    }
    // falls through
    // case 1: future migration vers la version 2
    default:
      break;
  }
}

// ================= CONNEXION PARTAGÉE =================

let dbPromise = null;

/**
 * Retourne la connexion partagée à la base. La base n'est ouverte qu'une seule fois ;
 * les appels concurrents (ex: double montage en StrictMode) reçoivent la même promesse.
 * Si l'ouverture échoue ou si la connexion est fermée, le prochain appel réessaie.
 * @returns {Promise<IDBDatabase>}
 */
export function getDB() {
  if (dbPromise) return dbPromise;

  if (typeof indexedDB === 'undefined' || !indexedDB) {
    return Promise.reject(
      new DatabaseError(ERROR_MESSAGES.UnavailableError, { code: 'UnavailableError' })
    );
  }

  dbPromise = new Promise((resolve, reject) => {
    let request;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err) {
      reject(toDatabaseError(err, ERROR_MESSAGES.UnavailableError));
      return;
    }

    request.onupgradeneeded = (event) => {
      upgradeSchema(request.result, event.oldVersion);
    };

    request.onblocked = () => {
      // Un autre onglet garde une ancienne version ouverte : l'ouverture reste
      // en attente jusqu'à ce qu'il se ferme (ou réagisse à 'versionchange').
      console.warn('[TaskFlow DB] Mise à jour de la base bloquée par un autre onglet ouvert.');
      emit('blocked');
    };

    request.onsuccess = () => {
      const db = request.result;

      db.onversionchange = () => {
        // Un autre onglet demande une version plus récente : on libère la base.
        db.close();
        dbPromise = null;
        emit('versionchange');
      };

      db.onclose = () => {
        // Fermeture inattendue (ex: données effacées par l'utilisateur).
        dbPromise = null;
        emit('close');
      };

      resolve(db);
    };

    request.onerror = () => {
      reject(toDatabaseError(request.error, "Impossible d'ouvrir la base de données locale."));
    };
  }).catch((err) => {
    // Ne pas garder une promesse rejetée en cache : le prochain appel réessaiera.
    dbPromise = null;
    throw err;
  });

  return dbPromise;
}

/**
 * Ferme la connexion partagée (utile pour les tests ou une suppression de la base).
 */
export async function closeDB() {
  if (!dbPromise) return;
  const pending = dbPromise;
  dbPromise = null;
  try {
    const db = await pending;
    db.close();
  } catch {
    // La connexion n'avait pas pu s'ouvrir : rien à fermer.
  }
}

// ================= UTILITAIRES PROMISE =================

/**
 * Transforme une IDBRequest en Promise.
 * @param {IDBRequest} request
 */
export function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(toDatabaseError(request.error));
  });
}

/**
 * Exécute `work(tx)` dans une transaction et ne résout qu'une fois la transaction
 * TERMINÉE (événement `complete`), garantissant que les données sont bien écrites.
 *
 * `work` doit lancer ses requêtes immédiatement (ou après des `await` portant
 * uniquement sur des requêtes de cette transaction), sinon la transaction se ferme.
 * Si `work` lève une erreur ou rejette, la transaction est annulée (abort) et
 * aucune écriture n'est conservée.
 *
 * @template T
 * @param {string|string[]} storeNames
 * @param {'readonly'|'readwrite'} mode
 * @param {(tx: IDBTransaction) => T | Promise<T>} work
 * @returns {Promise<T>} la valeur retournée par `work`
 */
export async function runTransaction(storeNames, mode, work) {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    let tx;
    try {
      tx = db.transaction(storeNames, mode);
    } catch (err) {
      reject(toDatabaseError(err));
      return;
    }

    let result;
    let workError = null;

    tx.oncomplete = () => resolve(result);
    tx.onabort = () => {
      reject(workError || toDatabaseError(tx.error, ERROR_MESSAGES.AbortError));
    };
    // tx.onerror n'est pas nécessaire : une requête en échec non gérée
    // déclenche l'annulation de la transaction, traitée par onabort.

    const abort = (err) => {
      workError = toDatabaseError(err);
      try {
        tx.abort();
      } catch {
        // Transaction déjà terminée ou déjà annulée.
      }
    };

    let returned;
    try {
      returned = work(tx);
    } catch (err) {
      abort(err);
      return;
    }

    Promise.resolve(returned).then(
      (value) => {
        result = value;
      },
      abort
    );
  });
}
