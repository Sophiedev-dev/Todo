/**
 * Cycle de vie des tests :
 *  - BeforeAll : serveur de dev + lancement unique de Chromium ;
 *  - Before    : nouveau contexte navigateur par scénario (IndexedDB vide et isolé) ;
 *  - After     : capture d'écran en cas d'échec, fermeture du contexte ;
 *  - AfterAll  : fermeture du navigateur et du serveur démarré par les tests.
 */
import { BeforeAll, AfterAll, Before, After, Status, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { ensureDevServer } from './server.js';

setDefaultTimeout(30_000);

let browser = null;
let devServer = null;

BeforeAll({ timeout: 90_000 }, async function () {
  devServer = await ensureDevServer();
  browser = await chromium.launch({ headless: process.env.HEADED !== '1' });
});

AfterAll(async function () {
  if (browser) await browser.close();
  if (devServer) devServer.kill();
});

Before(async function () {
  // Un contexte neuf = stockage (IndexedDB, cookies…) vide : aucune fuite entre scénarios.
  this.context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: 'fr-FR'
  });
  this.page = await this.context.newPage();
});

After(async function ({ result }) {
  if (result?.status === Status.FAILED && this.page) {
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
    } catch {
      // Page déjà fermée : rien à capturer.
    }
  }
  if (this.context) await this.context.close();
});
