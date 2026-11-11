@projects
Feature: Project management
  As a TaskFlow user
  I want to organize my work into projects
  So that every task belongs to a clear context

  Background:
    Given the application is opened with no saved data

  Scenario: Create a project
    When I create a project named "Refonte du site web" with the description "Nouveau design et migration du CMS"
    Then a success notification confirms that the project "Refonte du site web" was created
    And the project "Refonte du site web" appears in the project overview and in the sidebar
    And the breadcrumb shows "Refonte du site web"
    And the dashboard shows 1 project in total

  Scenario Outline: Reject a project without a valid name
    When I try to create a project whose name is <name>
    Then the project form shows the error "Veuillez renseigner un nom pour le projet."
    And the project form stays open
    And the dashboard shows 0 projects in total

    Examples:
      | name                |
      | empty               |
      | made only of spaces |

  Scenario: Edit a project
    Given the following projects exist:
      | name        | description       |
      | Campagne Q4 | Lancement produit |
    When I edit the project "Campagne Q4" with the name "Campagne Q4 2026" and the description "Lancement produit et webinaire"
    Then a success notification confirms that the project "Campagne Q4 2026" was updated
    And the project "Campagne Q4 2026" appears with the description "Lancement produit et webinaire"
    And no project named "Campagne Q4" is displayed

  Scenario: Deleting a project also deletes its tasks
    Given the following projects exist:
      | name                | description            |
      | Refonte du site web | Nouveau design         |
      | Campagne Q4         | Lancement produit      |
    And the following tasks exist:
      | project             | title                         | description | status   |
      | Refonte du site web | Rédiger le cahier des charges |             | En cours |
      | Refonte du site web | Valider la maquette           |             | Terminée |
      | Campagne Q4         | Préparer l'emailing           |             | En cours |
    When I ask to delete the project "Refonte du site web"
    Then a confirmation warns that 2 associated tasks will be permanently deleted
    When I confirm the deletion
    Then a notification confirms that the project "Refonte du site web" and 2 associated tasks were deleted
    And no project named "Refonte du site web" is displayed
    And the dashboard shows 1 project in total
    And the dashboard shows 1 task in total
    When I open the Overview
    Then only the following tasks are displayed:
      | title               |
      | Préparer l'emailing |

  Scenario: Cancel a project deletion
    Given the following projects exist:
      | name                | description    |
      | Refonte du site web | Nouveau design |
    And the following tasks exist:
      | project             | title                         | description | status   |
      | Refonte du site web | Rédiger le cahier des charges |             | En cours |
    When I ask to delete the project "Refonte du site web"
    And I cancel the deletion
    Then the project "Refonte du site web" appears in the project overview and in the sidebar
    And the dashboard shows 1 task in total

  Scenario Outline: Search projects by name or description
    Given the following projects exist:
      | name                | description                    |
      | Refonte du site web | Nouveau design                 |
      | Campagne Q4         | Lancement produit              |
      | Recrutement         | Embauche de deux développeurs  |
      | Migration serveur   | Passage au cloud               |
    When I filter the projects with "<query>"
    Then the project overview only shows the project "<project>"

    Examples:
      | query        | project           |
      | campagne     | Campagne Q4       |
      | DÉVELOPPEURS | Recrutement       |
      | cloud        | Migration serveur |

  Scenario: Project search without results
    Given the following projects exist:
      | name                | description       |
      | Refonte du site web | Nouveau design    |
      | Campagne Q4         | Lancement produit |
      | Recrutement         | Embauche          |
      | Migration serveur   | Passage au cloud  |
    When I filter the projects with "comptabilité"
    Then I see the message "Aucun projet ne correspond à votre recherche"
    When I clear the project search
    Then the project overview shows 4 projects

  Scenario: Project search is only offered from four projects
    Given the following projects exist:
      | name                | description       |
      | Refonte du site web | Nouveau design    |
      | Campagne Q4         | Lancement produit |
      | Recrutement         | Embauche          |
    Then the project search field is not displayed
    When I create a project named "Migration serveur" with the description "Passage au cloud"
    Then the project search field is displayed

  Scenario Outline: Select a project
    Given the following projects exist:
      | name                | description       |
      | Refonte du site web | Nouveau design    |
      | Campagne Q4         | Lancement produit |
    And the following tasks exist:
      | project             | title                         | description | status   |
      | Refonte du site web | Rédiger le cahier des charges |             | En cours |
      | Campagne Q4         | Préparer l'emailing           |             | En cours |
    When I select the project "Campagne Q4" from the <location>
    Then the breadcrumb shows "Campagne Q4"
    And the task section is titled "Campagne Q4"
    And only the following tasks are displayed:
      | title               |
      | Préparer l'emailing |

    Examples:
      | location         |
      | sidebar          |
      | project overview |

  Scenario: Access the Overview
    Given the following projects exist:
      | name                | description       |
      | Refonte du site web | Nouveau design    |
      | Campagne Q4         | Lancement produit |
    And the following tasks exist:
      | project             | title                         | description | status   |
      | Refonte du site web | Rédiger le cahier des charges |             | En cours |
      | Campagne Q4         | Préparer l'emailing           |             | En cours |
    And the project "Refonte du site web" is selected
    When I open the Overview
    Then the breadcrumb shows "Vue d'ensemble"
    And the task section is titled "Toutes les tâches"
    And only the following tasks are displayed:
      | title                         |
      | Rédiger le cahier des charges |
      | Préparer l'emailing           |
    And no project is selected in the sidebar
