/**
 * World Cucumber : état propre à un scénario (contexte navigateur, page,
 * horloge des données injectées). Une nouvelle instance est créée par scénario.
 */
import { setWorldConstructor, World } from '@cucumber/cucumber';
import { BASE_URL } from './server.js';

export class TaskFlowWorld extends World {
  constructor(options) {
    super(options);
    /** @type {import('@playwright/test').BrowserContext | null} */
    this.context = null;
    /** @type {import('@playwright/test').Page | null} */
    this.page = null;
    this.baseURL = BASE_URL;
    this.hasNavigated = false;
    // Horloge des données injectées : chaque enregistrement reçoit une date de
    // création strictement croissante (une minute d'écart), dans le passé.
    this.seedClock = Date.now() - 24 * 60 * 60 * 1000;
    this.seedCounter = 0;
  }

  nextSeed() {
    this.seedClock += 60_000;
    this.seedCounter += 1;
    return { createdAt: new Date(this.seedClock).toISOString(), n: this.seedCounter };
  }
}

setWorldConstructor(TaskFlowWorld);
