/**
 * Mise en place contrôlée des données directement dans IndexedDB.
 *
 * Utilisée pour les étapes « the following projects/tasks exist », lorsque le
 * scénario ne porte pas sur la création elle-même. Les données respectent le
 * format écrit par l'application (voir src/services/storageService.js).
 *
 * L'application doit avoir été ouverte une première fois (elle crée le schéma),
 * puis la page est rechargée pour qu'elle relise la base. La vue sélectionnée
 * avant l'injection est restaurée après le rechargement.
 */
import { expect } from '@playwright/test';
import {
  breadcrumbCurrent,
  sidebarProjectButtons,
  selectProjectInSidebar,
  openOverview,
  waitForAppReady
} from './app.js';

async function writeRecords(page, records) {
  await page.evaluate(async (payload) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('taskflow');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    try {
      const projects = await new Promise((resolve, reject) => {
        const req = db.transaction('projects').objectStore('projects').getAll();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const idByName = new Map(projects.map((p) => [p.name, p.id]));
      payload.projects.forEach((p) => idByName.set(p.name, p.id));

      await new Promise((resolve, reject) => {
        const tx = db.transaction(['projects', 'tasks'], 'readwrite');
        payload.projects.forEach((p) => tx.objectStore('projects').add(p));
        payload.tasks.forEach(({ projectName, ...task }) => {
          const projectId = idByName.get(projectName);
          if (!projectId) throw new Error(`Projet inconnu pour la tâche "${task.title}" : ${projectName}`);
          tx.objectStore('tasks').add({ ...task, projectId });
        });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
    } finally {
      db.close();
    }
  }, records);
}

async function reloadKeepingSelection(page) {
  const projectCountBefore = await sidebarProjectButtons(page).count();
  const viewBefore = (await breadcrumbCurrent(page).innerText()).trim();

  await page.reload();
  await waitForAppReady(page);

  if (viewBefore !== "Vue d'ensemble") {
    await selectProjectInSidebar(page, viewBefore);
  } else if (projectCountBefore > 0) {
    await openOverview(page);
  }
}

/**
 * @param {import('./world.js').TaskFlowWorld} world
 * @param {Array<{ name: string, description?: string }>} rows
 */
export async function seedProjects(world, rows) {
  const projects = rows.map((row) => {
    const { createdAt, n } = world.nextSeed();
    return {
      id: `proj-seed-${n}`,
      name: row.name,
      description: (row.description || '').trim(),
      createdAt
    };
  });
  await writeRecords(world.page, { projects, tasks: [] });
  await reloadKeepingSelection(world.page);
  for (const project of projects) {
    await expect(sidebarProjectButtons(world.page).filter({ hasText: project.name }).first()).toBeVisible();
  }
}

/**
 * @param {import('./world.js').TaskFlowWorld} world
 * @param {Array<{ project: string, title: string, description?: string, status: string }>} rows
 *        status : « En cours » ou « Terminée » (libellés de l'interface)
 */
export async function seedTasks(world, rows) {
  const tasks = rows.map((row) => {
    if (!['En cours', 'Terminée'].includes(row.status)) {
      throw new Error(`Statut inconnu « ${row.status} » (attendu : En cours ou Terminée)`);
    }
    const { createdAt, n } = world.nextSeed();
    return {
      id: `task-seed-${n}`,
      projectName: row.project,
      title: row.title,
      description: (row.description || '').trim(),
      completed: row.status === 'Terminée',
      createdAt,
      updatedAt: createdAt
    };
  });
  await writeRecords(world.page, { projects: [], tasks });
  await reloadKeepingSelection(world.page);
}
