import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  sidebar,
  dialog,
  openApp,
  waitForAppReady,
  createProjectViaUI
} from '../support/app.js';
import {
  makeIndexedDbUnavailable,
  makeIndexedDbTemporarilyUnavailable,
  makeIndexedDbSlow
} from '../support/faults.js';

// ================= EFFACER TOUT =================

When('I click "Effacer tout" in the sidebar', async function () {
  await sidebar(this.page).getByRole('button', { name: 'Effacer tout' }).click();
});

Then('a confirmation titled {string} is displayed', async function (title) {
  await expect(dialog(this.page, title)).toBeVisible();
});

Then('the confirmation says {string}', async function (message) {
  await expect(dialog(this.page)).toContainText(message);
});

When(/^I dismiss the confirmation (.+)$/, async function (how) {
  const confirm = dialog(this.page);
  if (how === 'with the "Annuler" button') {
    await confirm.getByRole('button', { name: 'Annuler' }).click();
  } else if (how === 'with the Escape key') {
    await this.page.keyboard.press('Escape');
  } else if (how === 'with the close button of the dialog') {
    await confirm.getByRole('button', { name: 'Fermer' }).click();
  } else {
    throw new Error(`Manière de fermer inconnue : ${how}`);
  }
});

Then('the confirmation is closed', async function () {
  await expect(dialog(this.page)).toHaveCount(0);
});

Then('the sidebar shows {string}', async function (text) {
  await expect(sidebar(this.page).getByText(text, { exact: true })).toBeVisible();
});

Then('the {string} action is not offered', async function (label) {
  await expect(this.page.getByRole('button', { name: label, exact: true })).toHaveCount(0);
});

// ================= CHARGEMENT & ERREURS =================

Given('a project {string} was saved previously', async function (name) {
  await openApp(this);
  await waitForAppReady(this.page);
  await createProjectViaUI(this.page, name, '');
});

Given('the browser database is unavailable', async function () {
  await makeIndexedDbUnavailable(this.context);
});

Given('the browser database is temporarily unavailable', async function () {
  await makeIndexedDbTemporarilyUnavailable(this.context);
});

Given('the browser database responds slowly', async function () {
  await makeIndexedDbSlow(this.context);
});

When('the browser database becomes available again', async function () {
  await this.page.evaluate(() => window.__taskflowTest.restoreDatabase());
});

When('the data has finished loading', async function () {
  await this.page.evaluate(() => window.__taskflowTest.releaseDatabase());
  await waitForAppReady(this.page);
});

Then('the {string} button is displayed', async function (label) {
  await expect(this.page.getByRole('button', { name: label, exact: true })).toBeVisible();
});

Then('the dashboard is not displayed', async function () {
  await expect(this.page.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toHaveCount(0);
});
