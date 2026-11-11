import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import {
  openApp,
  waitForAppReady,
  breadcrumbCurrent,
  dialog,
  notification
} from '../support/app.js';
import { seedProjects, seedTasks } from '../support/seed.js';

Given('the application is opened with no saved data', async function () {
  await openApp(this);
  await waitForAppReady(this.page);
});

Given('the following projects exist:', async function (table) {
  await seedProjects(this, table.hashes());
});

Given(/^the following tasks exist(?:, created in this order)?:$/, async function (table) {
  await seedTasks(this, table.hashes());
});

When('I refresh the page', async function () {
  await this.page.reload();
  await waitForAppReady(this.page);
});

When('I open the application', async function () {
  await openApp(this);
});

When('I click {string}', async function (label) {
  await this.page.getByRole('button', { name: label, exact: true }).click();
});

Then('I see the message {string}', async function (message) {
  await expect(this.page.getByText(message, { exact: true })).toBeVisible();
});

Then('I do not see the message {string}', async function (message) {
  await expect(this.page.getByText(message, { exact: true })).toHaveCount(0);
});

Then('the notification {string} is displayed', async function (message) {
  await expect(notification(this.page, message)).toBeVisible();
});

Then('the breadcrumb shows {string}', async function (text) {
  await expect(breadcrumbCurrent(this.page)).toHaveText(text);
});

When('I confirm the deletion', async function () {
  const confirm = dialog(this.page);
  await confirm.getByRole('button', { name: /^Supprimer/ }).click();
  await expect(confirm).toBeHidden();
});

When('I cancel the deletion', async function () {
  const confirm = dialog(this.page);
  await confirm.getByRole('button', { name: 'Annuler' }).click();
  await expect(confirm).toBeHidden();
});
