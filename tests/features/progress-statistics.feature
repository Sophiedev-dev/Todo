@statistics
Feature: Progress statistics
  As a TaskFlow user
  I want to see how far each project and my whole workload have progressed
  So that I can measure my productivity

  Background:
    Given the application is opened with no saved data

  Scenario: Empty dashboard
    Then the dashboard shows 0 projects in total
    And the dashboard shows 0 tasks in total
    And the dashboard shows 0 completed tasks with "0% du total accompli"
    And the dashboard shows 0 pending tasks
    And the global progress bar is not displayed

  Scenario: Statistics across several projects
    Given the following projects exist:
      | name                | description       |
      | Refonte du site web | Nouveau design    |
      | Campagne Q4         | Lancement produit |
    And the following tasks exist:
      | project             | title                         | description | status   |
      | Refonte du site web | Rédiger le cahier des charges |             | Terminée |
      | Refonte du site web | Valider la maquette           |             | En cours |
      | Refonte du site web | Auditer les performances      |             | En cours |
      | Campagne Q4         | Préparer l'emailing           |             | Terminée |
    Then the dashboard shows 2 projects in total
    And the dashboard shows 4 tasks in total
    And the dashboard shows 2 completed tasks with "50% du total accompli"
    And the dashboard shows 2 pending tasks
    And the global progress shows "2 sur 4 tâches terminées" and "50%"

  Scenario Outline: Project progress is shown as a rounded percentage
    Given the following projects exist:
      | name                | description    |
      | Refonte du site web | Nouveau design |
    And the project "Refonte du site web" has <completed> completed tasks out of <total>
    Then the card of the project "Refonte du site web" shows "<card count>" and "<percent>"
    And the sidebar shows "<completed>/<total>" for the project "Refonte du site web"

    Examples:
      | completed | total | card count   | percent |
      | 0         | 0     | 0 / 0 tâche  | 0%      |
      | 0         | 2     | 0 / 2 tâches | 0%      |
      | 1         | 3     | 1 / 3 tâches | 33%     |
      | 2         | 3     | 2 / 3 tâches | 67%     |
      | 2         | 2     | 2 / 2 tâches | 100%    |

  Scenario: Statistics update immediately when a task is completed
    Given the following projects exist:
      | name                | description    |
      | Refonte du site web | Nouveau design |
    And the following tasks exist:
      | project             | title               | description | status   |
      | Refonte du site web | Valider la maquette |             | En cours |
      | Refonte du site web | Auditer le site     |             | En cours |
    When I mark the task "Valider la maquette" as completed
    Then the card of the project "Refonte du site web" shows "1 / 2 tâches" and "50%"
    And the dashboard shows 1 completed tasks with "50% du total accompli"
    And the dashboard shows 1 pending tasks
