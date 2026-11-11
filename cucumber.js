/**
 * Configuration Cucumber pour les tests BDD de TaskFlow.
 * Les scénarios sont exécutés en série : ils partagent un seul serveur de dev
 * et un seul navigateur, mais chaque scénario a son propre contexte isolé.
 */
export default {
  import: ['tests/support/**/*.js', 'tests/steps/**/*.js'],
  format: ['progress', 'summary', 'html:reports/cucumber-report.html'],
  formatOptions: { snippetInterface: 'async-await' }
};
