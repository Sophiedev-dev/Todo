@organization
Feature: Task organization
  As a TaskFlow user
  I want to search, filter and sort the tasks of a project
  So that I can quickly find what I need to work on

  Background:
    Given the application is opened with no saved data
    And the following projects exist:
      | name                | description    |
      | Refonte du site web | Nouveau design |
    And the following tasks exist, created in this order:
      | project             | title                         | description                   | status   |
      | Refonte du site web | Rédiger le cahier des charges | Inclure les contraintes SEO   | Terminée |
      | Refonte du site web | Valider la maquette           | Avec le client                | En cours |
      | Refonte du site web | Auditer les performances      | Lighthouse et Core Web Vitals | En cours |
    And the project "Refonte du site web" is selected

  Scenario Outline: Search tasks by title or description
    When I search tasks for "<query>"
    Then only the following tasks are displayed:
      | title   |
      | <match> |

    Examples:
      | query      | match                         |
      | maquette   | Valider la maquette           |
      | SEO        | Rédiger le cahier des charges |
      | lighthouse | Auditer les performances      |

  Scenario: Task search without results
    When I search tasks for "facturation"
    Then I see the message "Aucune tâche ne correspond à vos critères"
    When I reset the filters
    Then 3 tasks are displayed

  Scenario: Status filters show the number of tasks per status
    Then the status filters show "Toutes (3)", "En attente (2)" and "Terminées (1)"

  Scenario Outline: Filter tasks by status
    When I filter tasks by "<status filter>"
    Then the displayed tasks are, in any order: <tasks>

    Examples:
      | status filter | tasks                                                                    |
      | Toutes        | Rédiger le cahier des charges, Valider la maquette, Auditer les performances |
      | En attente    | Valider la maquette, Auditer les performances                            |
      | Terminées     | Rédiger le cahier des charges                                            |

  Scenario: Search and status filter are combined
    When I filter tasks by "Terminées"
    And I search tasks for "maquette"
    Then I see the message "Aucune tâche ne correspond à vos critères"

  Scenario Outline: Sort tasks
    When I sort tasks by "<sort option>"
    Then the tasks are displayed in this order: <order>

    Examples:
      | sort option    | order                                                                    |
      | Plus récentes  | Auditer les performances, Valider la maquette, Rédiger le cahier des charges |
      | Plus anciennes | Rédiger le cahier des charges, Valider la maquette, Auditer les performances |
      | Titre (A-Z)    | Auditer les performances, Rédiger le cahier des charges, Valider la maquette |

  Scenario: Changing project resets the search and the status filter
    Given the following projects exist:
      | name        | description       |
      | Campagne Q4 | Lancement produit |
    And the project "Refonte du site web" is selected
    And I filter tasks by "Terminées"
    And I search tasks for "cahier"
    When I select the project "Campagne Q4" from the sidebar
    And I select the project "Refonte du site web" from the sidebar
    Then the task search field is empty
    And the status filter "Toutes" is active
    And 3 tasks are displayed
