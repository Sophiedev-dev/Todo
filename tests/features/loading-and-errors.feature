@safety @loading
Feature: Loading and error states
  As a TaskFlow user
  I want to know when my data is loading or could not be loaded
  So that I am never shown a misleading empty workspace

  # These scenarios simulate a slow or failing browser database from the test
  # side only (for example with a script injected before the page loads).
  # The application code is not modified for them.

  @fault-injection
  Scenario: A loading state is shown until the data is available
    Given a project "Refonte du site web" was saved previously
    And the browser database responds slowly
    When I open the application
    Then I see the message "Chargement de vos données…"
    And I do not see the message "Aucun projet pour le moment"
    When the data has finished loading
    Then the project "Refonte du site web" appears in the project overview and in the sidebar

  @fault-injection
  Scenario: An error state is shown when the browser database is unavailable
    Given the browser database is unavailable
    When I open the application
    Then I see the message "Impossible de charger vos données"
    And I see the message "Le stockage local (IndexedDB) n'est pas disponible dans ce navigateur."
    And the "Réessayer" button is displayed
    And the dashboard is not displayed

  @fault-injection
  Scenario: Retrying after a temporary failure loads the saved data
    Given a project "Refonte du site web" was saved previously
    And the browser database fails to open the first time only
    When I open the application
    Then I see the message "Impossible de charger vos données"
    When I click "Réessayer"
    Then the project "Refonte du site web" appears in the project overview and in the sidebar
