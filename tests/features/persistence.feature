@persistence
Feature: Data persistence
  As a TaskFlow user
  I want my projects and tasks to be kept in my browser
  So that I do not lose my work when I reload the page

  Background:
    Given the application is opened with no saved data

  Scenario: Projects and tasks are preserved after a refresh
    Given I created the project "Refonte du site web" with the description "Nouveau design"
    And I created the task "Rédiger le cahier des charges" with the description "Inclure les contraintes SEO" in the project "Refonte du site web"
    When I refresh the page
    Then the project "Refonte du site web" appears with the description "Nouveau design"
    And the task "Rédiger le cahier des charges" shows the description "Inclure les contraintes SEO"
    And the dashboard shows 1 task in total

  Scenario: Task completion status is preserved after a refresh
    Given I created the project "Refonte du site web" with the description "Nouveau design"
    And I created the task "Valider la maquette" with the description "" in the project "Refonte du site web"
    And I marked the task "Valider la maquette" as completed
    When I refresh the page
    Then the task "Valider la maquette" is displayed with the status "Terminée"
    And the dashboard shows 1 completed tasks with "100% du total accompli"

  Scenario: Task reassignment is preserved after a refresh
    Given I created the project "Refonte du site web" with the description "Nouveau design"
    And I created the project "Campagne Q4" with the description "Lancement produit"
    And I created the task "Préparer l'emailing" with the description "" in the project "Refonte du site web"
    And I moved the task "Préparer l'emailing" to the project "Campagne Q4"
    When I refresh the page
    Then the sidebar shows "0/0" for the project "Refonte du site web"
    And the sidebar shows "0/1" for the project "Campagne Q4"

  Scenario: A deleted project and its tasks stay deleted after a refresh
    Given I created the project "Refonte du site web" with the description "Nouveau design"
    And I created the project "Campagne Q4" with the description "Lancement produit"
    And I created the task "Rédiger le cahier des charges" with the description "" in the project "Refonte du site web"
    And I deleted the project "Refonte du site web"
    When I refresh the page
    Then no project named "Refonte du site web" is displayed
    And the dashboard shows 0 tasks in total

  Scenario: The most recently created project is selected when the application reopens
    Given I created the project "Refonte du site web" with the description "Nouveau design"
    And I created the project "Campagne Q4" with the description "Lancement produit"
    And I selected the project "Refonte du site web" from the sidebar
    When I refresh the page
    Then the breadcrumb shows "Campagne Q4"
