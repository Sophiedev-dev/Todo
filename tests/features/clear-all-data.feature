@safety @clear-all
Feature: Clear all data
  As a TaskFlow user
  I want to be asked for confirmation before everything is erased
  So that I never lose all my projects and tasks by mistake

  Background:
    Given the application is opened with no saved data

  Rule: Erasing everything always requires an explicit confirmation

    Background:
      Given the following projects exist:
        | name                | description       |
        | Refonte du site web | Nouveau design    |
        | Campagne Q4         | Lancement produit |
      And the following tasks exist:
        | project             | title                         | description | status   |
        | Refonte du site web | Rédiger le cahier des charges |             | En cours |
        | Refonte du site web | Valider la maquette           |             | Terminée |
        | Campagne Q4         | Préparer l'emailing           |             | En cours |

    Scenario: A confirmation states exactly what will be deleted
      When I click "Effacer tout" in the sidebar
      Then a confirmation titled "Effacer toutes les données" is displayed
      And the confirmation says "Cette action supprimera définitivement 2 projets et 3 tâches. Elle est irréversible."
      And the dashboard shows 2 projects in total

    Scenario Outline: Cancelling the confirmation preserves all data
      When I click "Effacer tout" in the sidebar
      And I dismiss the confirmation <how>
      Then the confirmation is closed
      And the dashboard shows 2 projects in total
      And the dashboard shows 3 tasks in total
      When I refresh the page
      Then the dashboard shows 2 projects in total
      And the dashboard shows 3 tasks in total

      Examples:
        | how                                |
        | with the "Annuler" button          |
        | with the Escape key                |
        | with the close button of the dialog |

    Scenario: Confirming deletes all projects and tasks permanently
      When I click "Effacer tout" in the sidebar
      And I click "Tout effacer définitivement"
      Then the notification "Toutes les données ont été effacées." is displayed
      And the dashboard shows 0 projects in total
      And the dashboard shows 0 tasks in total
      And the sidebar shows "Aucun projet actif"
      And the "Effacer tout" action is not offered
      When I refresh the page
      Then the dashboard shows 0 projects in total
      And the dashboard shows 0 tasks in total

  Rule: The confirmation uses correct singular forms and is hidden when there is nothing to erase

    Scenario: Singular wording for a single project and a single task
      Given the following projects exist:
        | name                | description    |
        | Refonte du site web | Nouveau design |
      And the following tasks exist:
        | project             | title               | description | status   |
        | Refonte du site web | Valider la maquette |             | En cours |
      When I click "Effacer tout" in the sidebar
      Then the confirmation says "Cette action supprimera définitivement 1 projet et 1 tâche. Elle est irréversible."

    Scenario: Nothing to erase
      Then the "Effacer tout" action is not offered
