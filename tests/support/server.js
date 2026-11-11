/**
 * Démarrage du serveur de développement Vite pour les tests.
 * - Si l'application répond déjà sur BASE_URL (ex: `npm run dev` lancé à la main),
 *   ce serveur est réutilisé et ne sera pas arrêté à la fin.
 * - Sinon, Vite est démarré sur le port 3000 puis arrêté après les tests.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';

export const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function isUp(url) {
  try {
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * @returns {Promise<import('node:child_process').ChildProcess | null>}
 *          le processus démarré, ou null si un serveur existant est réutilisé
 */
export async function ensureDevServer({ timeoutMs = 60_000 } = {}) {
  if (await isUp(BASE_URL)) return null;

  const port = new URL(BASE_URL).port || '3000';
  const viteBin = path.resolve('node_modules', 'vite', 'bin', 'vite.js');
  const child = spawn(process.execPath, [viteBin, '--port', port, '--strictPort'], {
    stdio: 'ignore',
    env: process.env
  });

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Le serveur Vite s'est arrêté (code ${child.exitCode}). Le port ${port} est-il occupé ?`);
    }
    if (await isUp(BASE_URL)) return child;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  child.kill();
  throw new Error(`Le serveur de développement n'a pas répondu sur ${BASE_URL} après ${timeoutMs / 1000} s.`);
}
