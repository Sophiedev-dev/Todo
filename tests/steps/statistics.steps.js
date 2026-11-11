import { Given, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  statsRegion,
  statCard,
  expectStatValue,
  globalProgress,
  projectCard
} from '../support/app.js';
import { seedTasks } from '../support/seed.js';

Then('the dashboard shows {int} project(s) in total', async function (count) {
  await expectStatValue(this.page, 'Projets au total', count);
});

Then('the dashboard shows {int} task(s) in total', async function (count) {
  await expectStatValue(this.page, 'Tâches au total', count);
});

Then('the dashboard shows {int} completed task(s) with {string}', async function (count, detail) {
  await expectStatValue(this.page, 'Tâches terminées', count);
  await expect(statCard(this.page, 'Tâches terminées')).toContainText(detail);
});

Then('the dashboard shows {int} pending task(s)', async function (count) {
  await expectStatValue(this.page, 'Tâches en attente', count);
});

Then('the global progress bar is not displayed', async function () {
  await expect(statsRegion(this.page).getByText('Progression globale des projets')).toHaveCount(0);
});

Then('the global progress shows {string} and {string}', async function (summary, percent) {
  const progress = globalProgress(this.page);
  await expect(progress.getByText(summary, { exact: true })).toBeVisible();
  await expect(progress.getByText(percent, { exact: true })).toBeVisible();
});

Given(
  'the project {string} has {int} completed tasks out of {int}',
  async function (project, completed, total) {
    const rows = Array.from({ length: total }, (_, i) => ({
      project,
      title: `Tâche ${i + 1}`,
      description: '',
      status: i < completed ? 'Terminée' : 'En cours'
    }));
    if (rows.length > 0) await seedTasks(this, rows);
  }
);

Then('the card of the project {string} shows {string} and {string}', async function (name, count, percent) {
  const card = projectCard(this.page, name);
  await expect(card.getByText(count, { exact: true })).toBeVisible();
  await expect(card.getByText(percent, { exact: true })).toBeVisible();
});
