/**
 * Injection de pannes IndexedDB côté navigateur, pour les scénarios @fault-injection.
 * Les scripts sont ajoutés au contexte Playwright (addInitScript) et s'exécutent
 * avant le code de l'application à chaque chargement de page.
 * Le code source de l'application n'est pas modifié.
 */

/** IndexedDB absent, comme dans un navigateur qui ne le prend pas en charge. */
export async function makeIndexedDbUnavailable(context) {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', { value: undefined, configurable: true });
  });
}

/**
 * Panne temporaire : toute ouverture de base échoue tant que le test n'a pas
 * appelé `window.__taskflowTest.restoreDatabase()`.
 */
export async function makeIndexedDbTemporarilyUnavailable(context) {
  await context.addInitScript(() => {
    const state = { down: true };
    const originalOpen = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (...args) {
      if (state.down) {
        throw new DOMException('Panne simulée par le test.', 'UnknownError');
      }
      return originalOpen.apply(this, args);
    };
    window.__taskflowTest = Object.assign(window.__taskflowTest || {}, {
      restoreDatabase: () => {
        state.down = false;
      }
    });
  });
}

/**
 * Base lente : l'ouverture réussit, mais l'application n'en est informée
 * qu'après l'appel de `window.__taskflowTest.releaseDatabase()`.
 * Seul le gestionnaire `onsuccess` de la requête d'ouverture est retardé,
 * aucune transaction n'est en cours à ce moment-là.
 */
export async function makeIndexedDbSlow(context) {
  await context.addInitScript(() => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    const originalOpen = IDBFactory.prototype.open;
    IDBFactory.prototype.open = function (...args) {
      const request = originalOpen.apply(this, args);
      let appHandler = null;
      Object.defineProperty(request, 'onsuccess', {
        configurable: true,
        get: () => appHandler,
        set: (handler) => {
          appHandler = handler;
        }
      });
      request.addEventListener('success', (event) => {
        gate.then(() => appHandler && appHandler.call(request, event));
      });
      return request;
    };
    window.__taskflowTest = Object.assign(window.__taskflowTest || {}, {
      releaseDatabase: () => release()
    });
  });
}
