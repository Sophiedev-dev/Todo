import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  header,
  sidebar,
  overviewRegion,
  tasksRegion,
  dialog,
  notification,
  projectCard,
  projectCardHeadings,
  sidebarProjectButton,
  sidebarProjectButtons,
  createProjectViaUI,
  selectProjectInSidebar,
  openOverview,
  openProjectAction,
  deleteProjectViaUI,
  expectTaskTitles
} from '../support/app.js';

const BLANK_VALUES = { empty: '', 'made only of spaces': '   ' };

// ================= CRÉATION =================

When('I create a project named {string} with the description {string}', async function (name, description) {
  await createProjectViaUI(this.page, name, description);
});

Given('I created the project {string} with the description {string}', async function (name, description) {
  await createProjectViaUI(this.page, name, description);
});

When(/^I try to create a project whose name is (empty|made only of spaces)$/, async function (kind) {
  await header(this.page).getByRole('button', { name: 'Nouveau projet' }).click();
  const form = dialog(this.page, 'Créer un nouveau projet');
  await form.getByLabel('Nom du projet').fill(BLANK_VALUES[kind]);
  await form.getByRole('button', { name: 'Créer le projet' }).click();
});

Then('the project form shows the error {string}', async function (message) {
  await expect(dialog(this.page, 'Créer un nouveau projet').getByText(message, { exact: true })).toBeVisible();
});

Then('the project form stays open', async function () {
  await expect(dialog(this.page, 'Créer un nouveau projet')).toBeVisible();
});

Then('a success notification confirms that the project {string} was created', async function (name) {
  await expect(notification(this.page, `Projet "${name}" créé avec succès !`)).toBeVisible();
});

Then('the project {string} appears in the project overview and in the sidebar', async function (name) {
  await expect(overviewRegion(this.page).getByRole('heading', { level: 3, name, exact: true })).toBeVisible();
  await expect(sidebarProjectButton(this.page, name)).toBeVisible();
});

// ================= MODIFICATION =================

When(
  'I edit the project {string} with the name {string} and the description {string}',
  async function (name, newName, description) {
    await openProjectAction(this.page, name, 'Modifier le projet');
    const form = dialog(this.page, 'Modifier le projet');
    await form.getByLabel('Nom du projet').fill(newName);
    await form.getByLabel('Description (optionnelle)').fill(description);
    await form.getByRole('button', { name: 'Enregistrer les modifications' }).click();
    await expect(form).toBeHidden();
  }
);

Then('a success notification confirms that the project {string} was updated', async function (name) {
  await expect(notification(this.page, `Projet "${name}" mis à jour avec succès.`)).toBeVisible();
});

Then('the project {string} appears with the description {string}', async function (name, description) {
  await expect(projectCard(this.page, name)).toContainText(description);
});

Then('no project named {string} is displayed', async function (name) {
  await expect(overviewRegion(this.page).getByRole('heading', { level: 3, name, exact: true })).toHaveCount(0);
  await expect(sidebarProjectButton(this.page, name)).toHaveCount(0);
});

// ================= SUPPRESSION =================

When('I ask to delete the project {string}', async function (name) {
  await openProjectAction(this.page, name, 'Supprimer le projet');
  await expect(dialog(this.page, 'Supprimer le projet')).toBeVisible();
});

Given('I deleted the project {string}', async function (name) {
  await deleteProjectViaUI(this.page, name);
});

Then('a confirmation warns that {int} associated task(s) will be permanently deleted', async function (count) {
  const wording = count > 1 ? `${count} tâches associées` : `${count} tâche associée`;
  await expect(dialog(this.page, 'Supprimer le projet')).toContainText(`supprimera définitivement ${wording}`);
});

Then(
  'a notification confirms that the project {string} and {int} associated task(s) were deleted',
  async function (name, count) {
    const detail = count > 1 ? `${count} tâches associées supprimées` : `${count} tâche associée supprimée`;
    await expect(notification(this.page, `Projet "${name}" supprimé (${detail}).`)).toBeVisible();
  }
);

// ================= RECHERCHE =================

When('I filter the projects with {string}', async function (query) {
  await overviewRegion(this.page).getByPlaceholder('Filtrer les projets...').fill(query);
});

When('I clear the project search', async function () {
  await overviewRegion(this.page).getByRole('button', { name: 'Effacer la recherche' }).click();
});

Then('the project overview only shows the project {string}', async function (name) {
  await expect(projectCardHeadings(this.page)).toHaveText([name]);
});

Then('the project overview shows {int} projects', async function (count) {
  await expect(projectCardHeadings(this.page)).toHaveCount(count);
});

Then(/^the project search field is (not )?displayed$/, async function (not) {
  const field = overviewRegion(this.page).getByPlaceholder('Filtrer les projets...');
  if (not) await expect(field).toHaveCount(0);
  else await expect(field).toBeVisible();
});

// ================= SÉLECTION & VUE D'ENSEMBLE =================

Given('the project {string} is selected', async function (name) {
  await selectProjectInSidebar(this.page, name);
});

When(/^I select(?:ed)? the project "([^"]*)" from the (sidebar|project overview)$/, async function (name, location) {
  if (location === 'sidebar') {
    await sidebarProjectButton(this.page, name).click();
  } else {
    await overviewRegion(this.page).getByRole('heading', { level: 3, name, exact: true }).click();
  }
});

When('I open the Overview', async function () {
  await openOverview(this.page);
});

Then('the task section is titled {string}', async function (title) {
  await expect(tasksRegion(this.page).getByRole('heading', { level: 2 })).toHaveText(title);
});

Then('only the following tasks are displayed:', async function (table) {
  await expectTaskTitles(this.page, table.hashes().map((row) => row.title), { ordered: false });
});

Then('no project is selected in the sidebar', async function () {
  // L'application n'expose pas d'aria-current : l'état sélectionné est porté par le style.
  await expect(sidebar(this.page).getByRole('button', { name: "Vue d'ensemble" })).toHaveClass(/\bbg-blue-50\b/);
  const buttons = await sidebarProjectButtons(this.page).all();
  for (const button of buttons) {
    await expect(button).not.toHaveClass(/\bbg-blue-50\b/);
  }
});
