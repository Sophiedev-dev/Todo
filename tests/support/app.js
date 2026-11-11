/**
 * Localisateurs et actions réutilisables sur l'interface de TaskFlow.
 * Priorité aux rôles accessibles, libellés et textes visibles.
 */
import { expect } from '@playwright/test';

// ================= ZONES DE LA PAGE =================

export const header = (page) => page.getByRole('banner');
export const sidebar = (page) => page.getByRole('complementary');
export const overviewRegion = (page) => page.getByRole('region', { name: 'Aperçu des projets' });
export const tasksRegion = (page) => page.getByRole('region', { name: 'Gestion des tâches' });
export const statsRegion = (page) => page.getByRole('region', { name: 'Statistiques clés' });
export const breadcrumbCurrent = (page) =>
  page.getByRole('navigation', { name: "Fil d'Ariane" }).locator('span').last();
export const dialog = (page, name) =>
  name ? page.getByRole('dialog', { name }) : page.getByRole('dialog');

// ================= CHARGEMENT =================

export async function openApp(world) {
  await world.page.goto(world.baseURL);
  world.hasNavigated = true;
}

export async function waitForAppReady(page) {
  await expect(page.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toBeVisible();
}

// ================= PROJETS =================

export const projectCard = (page, name) =>
  overviewRegion(page)
    .locator('div.group')
    .filter({ has: page.getByRole('heading', { level: 3, name, exact: true }) });

export const projectCardHeadings = (page) => overviewRegion(page).getByRole('heading', { level: 3 });

/** Boutons de projet dans la barre latérale (ceux qui affichent un compteur « x/y »). */
export const sidebarProjectButtons = (page) =>
  sidebar(page).getByRole('button').filter({ hasText: /\d+\/\d+$/ });

export const sidebarProjectButton = (page, name) =>
  sidebar(page).getByRole('button').filter({ has: page.getByText(name, { exact: true }) });

export async function createProjectViaUI(page, name, description = '') {
  await header(page).getByRole('button', { name: 'Nouveau projet' }).click();
  const form = dialog(page, 'Créer un nouveau projet');
  await expect(form).toBeVisible();
  await form.getByLabel('Nom du projet').fill(name);
  await form.getByLabel('Description (optionnelle)').fill(description);
  await form.getByRole('button', { name: 'Créer le projet' }).click();
  await expect(form).toBeHidden();
  await expect(sidebarProjectButton(page, name)).toBeVisible();
}

export async function selectProjectInSidebar(page, name) {
  await sidebarProjectButton(page, name).click();
  await expect(breadcrumbCurrent(page)).toHaveText(name);
}

export async function openOverview(page) {
  await sidebar(page).getByRole('button', { name: "Vue d'ensemble" }).click();
  await expect(breadcrumbCurrent(page)).toHaveText("Vue d'ensemble");
}

export async function openProjectAction(page, projectName, actionLabel) {
  const card = projectCard(page, projectName);
  await card.hover();
  await card.getByRole('button', { name: actionLabel }).click();
}

export async function deleteProjectViaUI(page, name) {
  await openProjectAction(page, name, 'Supprimer le projet');
  const confirm = dialog(page, 'Supprimer le projet');
  await confirm.getByRole('button', { name: 'Supprimer définitivement' }).click();
  await expect(confirm).toBeHidden();
  await expect(sidebarProjectButton(page, name)).toHaveCount(0);
}

// ================= TÂCHES =================

export const taskItem = (page, title) =>
  tasksRegion(page)
    .locator('div.group')
    .filter({ has: page.getByRole('heading', { level: 4, name: title, exact: true }) });

export const taskTitles = (page) => tasksRegion(page).getByRole('heading', { level: 4 });

/**
 * Pour agir sur une tâche qui n'est pas visible dans la vue courante,
 * passer par la Vue d'ensemble (qui liste toutes les tâches).
 */
export async function revealTask(page, title) {
  if ((await taskItem(page, title).count()) === 0) {
    await openOverview(page);
  }
  const item = taskItem(page, title);
  await expect(item).toBeVisible();
  return item;
}

export async function openTaskForm(page) {
  const form = dialog(page, 'Créer une nouvelle tâche');
  if (!(await form.isVisible())) {
    await header(page).getByRole('button', { name: 'Nouvelle tâche' }).click();
  }
  await expect(form).toBeVisible();
  return form;
}

export async function createTaskViaUI(page, { title, description = '', project = null }) {
  const form = await openTaskForm(page);
  if (project) {
    await form.getByLabel('Projet associé').selectOption({ label: project });
  }
  await form.getByLabel('Titre de la tâche').fill(title);
  await form.getByLabel('Description / Notes détaillées').fill(description);
  await form.getByRole('button', { name: 'Créer la tâche' }).click();
  await expect(form).toBeHidden();
}

export async function editTaskViaUI(page, title, { newTitle, description, project }) {
  const item = await revealTask(page, title);
  await item.hover();
  await item.getByRole('button', { name: 'Modifier la tâche' }).click();
  const form = dialog(page, 'Modifier la tâche');
  await expect(form).toBeVisible();
  if (project !== undefined) {
    await form.getByLabel('Projet associé').selectOption({ label: project });
  }
  if (newTitle !== undefined) await form.getByLabel('Titre de la tâche').fill(newTitle);
  if (description !== undefined) {
    await form.getByLabel('Description / Notes détaillées').fill(description);
  }
  await form.getByRole('button', { name: 'Enregistrer les modifications' }).click();
  await expect(form).toBeHidden();
}

export async function setTaskCompletion(page, title, completed) {
  const item = await revealTask(page, title);
  const checkbox = item.getByRole('checkbox');
  const expected = completed ? 'true' : 'false';
  if ((await checkbox.getAttribute('aria-checked')) !== expected) {
    await checkbox.click();
  }
  await expect(taskItem(page, title).getByRole('checkbox')).toHaveAttribute('aria-checked', expected);
}

/**
 * Vérifie la liste des titres de tâches affichés.
 * @param {boolean} ordered true = l'ordre compte
 */
export async function expectTaskTitles(page, expected, { ordered }) {
  const normalize = (titles) => (ordered ? titles : [...titles].sort((a, b) => a.localeCompare(b, 'fr')));
  await expect
    .poll(async () => normalize((await taskTitles(page).allInnerTexts()).map((t) => t.trim())))
    .toEqual(normalize(expected));
}

// ================= STATISTIQUES =================

export const statCard = (page, label) =>
  statsRegion(page).getByText(label, { exact: true }).locator('xpath=../..');

export async function expectStatValue(page, label, value) {
  await expect(statCard(page, label).getByText(String(value), { exact: true })).toBeVisible();
}

export const globalProgress = (page) =>
  statsRegion(page)
    .locator('div')
    .filter({ hasText: 'Progression globale des projets' })
    .filter({ hasText: /\d+%/ })
    .last();

// ================= DIVERS =================

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const notification = (page, message) => page.getByText(message, { exact: true });
