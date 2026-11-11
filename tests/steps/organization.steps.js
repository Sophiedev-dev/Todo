import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { tasksRegion, taskTitles, expectTaskTitles, escapeRegExp } from '../support/app.js';

const searchField = (page) => tasksRegion(page).getByPlaceholder('Rechercher une tâche...');
const statusFilter = (page, label) =>
  tasksRegion(page).getByRole('button', { name: new RegExp(`^${escapeRegExp(label)} \\(\\d+\\)$`) });
const splitList = (text) => text.split(',').map((item) => item.trim()).filter(Boolean);

When('I search tasks for {string}', async function (query) {
  await searchField(this.page).fill(query);
});

When('I filter tasks by {string}', async function (label) {
  await statusFilter(this.page, label).click();
});

When('I sort tasks by {string}', async function (label) {
  await tasksRegion(this.page).getByRole('combobox', { name: 'Trier les tâches' }).selectOption({ label });
});

When('I reset the filters', async function () {
  await tasksRegion(this.page).getByRole('button', { name: 'Réinitialiser les filtres' }).click();
});

Then('{int} tasks are displayed', async function (count) {
  await expect(taskTitles(this.page)).toHaveCount(count);
});

Then('the status filters show {string}, {string} and {string}', async function (all, pending, completed) {
  for (const label of [all, pending, completed]) {
    await expect(tasksRegion(this.page).getByRole('button', { name: label, exact: true })).toBeVisible();
  }
});

Then(/^the displayed tasks are, in any order: (.+)$/, async function (list) {
  await expectTaskTitles(this.page, splitList(list), { ordered: false });
});

Then(/^the tasks are displayed in this order: (.+)$/, async function (list) {
  await expectTaskTitles(this.page, splitList(list), { ordered: true });
});

Then('the task search field is empty', async function () {
  await expect(searchField(this.page)).toHaveValue('');
});

Then('the status filter {string} is active', async function (label) {
  // Aucun aria-pressed dans l'application : l'onglet actif est signalé par son style.
  await expect(statusFilter(this.page, label)).toHaveClass(/\bbg-white\b/);
});
