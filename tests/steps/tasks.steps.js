import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  header,
  tasksRegion,
  dialog,
  notification,
  taskItem,
  revealTask,
  openTaskForm,
  createTaskViaUI,
  editTaskViaUI,
  setTaskCompletion,
  sidebarProjectButton
} from '../support/app.js';

const BLANK_VALUES = { empty: '', 'made only of spaces': '   ' };

// ================= CRÉATION =================

When(/^I click "Nouvelle tâche" in the (header|task section)$/, async function (location) {
  const scope = location === 'header' ? header(this.page) : tasksRegion(this.page);
  await scope.getByRole('button', { name: 'Nouvelle tâche' }).click();
});

Then('the project creation form is displayed', async function () {
  await expect(dialog(this.page, 'Créer un nouveau projet')).toBeVisible();
});

Then('the task creation form is not displayed', async function () {
  await expect(dialog(this.page, 'Créer une nouvelle tâche')).toHaveCount(0);
});

When('I open the task creation form', async function () {
  await openTaskForm(this.page);
});

Then('the associated project proposed by default is {string}', async function (name) {
  const select = dialog(this.page, 'Créer une nouvelle tâche').getByLabel('Projet associé');
  await expect(select.locator('option:checked')).toHaveText(name);
});

When('I create the task {string} with the description {string}', async function (title, description) {
  await createTaskViaUI(this.page, { title, description });
});

When('I create the task {string} for the project {string}', async function (title, project) {
  await createTaskViaUI(this.page, { title, project });
});

Given(
  'I created the task {string} with the description {string} in the project {string}',
  async function (title, description, project) {
    await createTaskViaUI(this.page, { title, description, project });
  }
);

When(/^I try to create a task whose title is (empty|made only of spaces)$/, async function (kind) {
  const form = await openTaskForm(this.page);
  await form.getByLabel('Titre de la tâche').fill(BLANK_VALUES[kind]);
  await form.getByRole('button', { name: 'Créer la tâche' }).click();
});

Then('the task form shows the error {string}', async function (message) {
  await expect(dialog(this.page, 'Créer une nouvelle tâche').getByText(message, { exact: true })).toBeVisible();
});

Then('the task form stays open', async function () {
  await expect(dialog(this.page, 'Créer une nouvelle tâche')).toBeVisible();
});

Then('a success notification confirms that the task {string} was added', async function (title) {
  await expect(notification(this.page, `Tâche "${title}" ajoutée avec succès.`)).toBeVisible();
});

// ================= AFFICHAGE =================

Then('the task {string} is displayed with the status {string}', async function (title, status) {
  const item = taskItem(this.page, title);
  await expect(item).toBeVisible();
  await expect(item.getByText(status, { exact: true })).toBeVisible();
});

Then('the task {string} is not displayed', async function (title) {
  await expect(taskItem(this.page, title)).toHaveCount(0);
});

Then('the task {string} shows the description {string}', async function (title, description) {
  await expect(taskItem(this.page, title)).toContainText(description);
});

Then('the task {string} shows a modification date', async function (title) {
  await expect(taskItem(this.page, title).getByText(/^Modifiée le /)).toBeVisible();
});

Then('the task {string} appears crossed out', async function (title) {
  await expect(
    this.page.getByRole('heading', { level: 4, name: title, exact: true })
  ).toHaveCSS('text-decoration-line', 'line-through');
});

Then('the sidebar shows {string} for the project {string}', async function (counter, name) {
  await expect(sidebarProjectButton(this.page, name)).toContainText(new RegExp(`${counter}$`));
});

// ================= MODIFICATION / DÉPLACEMENT =================

When(
  'I edit the task {string} with the title {string} and the description {string}',
  async function (title, newTitle, description) {
    await editTaskViaUI(this.page, title, { newTitle, description });
  }
);

When(/^I move(?:d)? the task "([^"]*)" to the project "([^"]*)"$/, async function (title, project) {
  await editTaskViaUI(this.page, title, { project });
});

When(/^I mark(?:ed)? the task "([^"]*)" as (completed|pending)$/, async function (title, state) {
  await setTaskCompletion(this.page, title, state === 'completed');
});

// ================= SUPPRESSION =================

When('I ask to delete the task {string}', async function (title) {
  const item = await revealTask(this.page, title);
  await item.hover();
  await item.getByRole('button', { name: 'Supprimer la tâche' }).click();
  await expect(dialog(this.page, 'Supprimer la tâche')).toBeVisible();
});

Then('a notification confirms that the task {string} was deleted', async function (title) {
  await expect(notification(this.page, `Tâche "${title}" supprimée.`)).toBeVisible();
});
