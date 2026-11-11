@tasks
Feature: Task management
  As a TaskFlow user
  I want to create, update, complete and delete tasks inside my projects
  So that I can track what remains to be done

  Background:
    Given the application is opened with no saved data

  Rule: A task can only be created when a project exists

    Scenario Outline: Creating a task without any project leads to project creation
      When I click "Nouvelle tâche" in the <location>
      Then the project creation form is displayed
      And the task creation form is not displayed

      Examples:
        | location     |
        | header       |
        | task section |

  Rule: Tasks are managed inside existing projects

    Background:
      Given the following projects exist:
        | name                | description       |
        | Refonte du site web | Nouveau design    |
        | Campagne Q4         | Lancement produit |
      And the project "Refonte du site web" is selected

    Scenario: Create a task in the selected project
      When I open the task creation form
      Then the associated project proposed by default is "Refonte du site web"
      When I create the task "Rédiger le cahier des charges" with the description "Inclure les contraintes SEO"
      Then a success notification confirms that the task "Rédiger le cahier des charges" was added
      And the task "Rédiger le cahier des charges" is displayed with the status "En cours"
      And the task "Rédiger le cahier des charges" shows the description "Inclure les contraintes SEO"
      And the sidebar shows "0/1" for the project "Refonte du site web"

    Scenario: Create a task for another project
      When I create the task "Préparer l'emailing" for the project "Campagne Q4"
      Then the task "Préparer l'emailing" is not displayed
      When I select the project "Campagne Q4" from the sidebar
      Then the task "Préparer l'emailing" is displayed with the status "En cours"

    Scenario Outline: Reject a task without a valid title
      When I try to create a task whose title is <title>
      Then the task form shows the error "Le titre de la tâche est obligatoire."
      And the task form stays open
      And the dashboard shows 0 tasks in total

      Examples:
        | title               |
        | empty               |
        | made only of spaces |

    Scenario: Edit a task
      Given the following tasks exist:
        | project             | title                | description      | status   |
        | Refonte du site web | Valider la maquette  | Avec le client   | En cours |
      When I edit the task "Valider la maquette" with the title "Valider la maquette finale" and the description "Avec le client et l'équipe design"
      Then the notification "Tâche modifiée avec succès." is displayed
      And the task "Valider la maquette finale" shows the description "Avec le client et l'équipe design"
      And the task "Valider la maquette finale" shows a modification date
      And the task "Valider la maquette" is not displayed

    Scenario: Move a task to another project
      Given the following tasks exist:
        | project             | title               | description | status   |
        | Refonte du site web | Préparer l'emailing |             | En cours |
      When I move the task "Préparer l'emailing" to the project "Campagne Q4"
      Then the task "Préparer l'emailing" is not displayed
      And the sidebar shows "0/0" for the project "Refonte du site web"
      And the sidebar shows "0/1" for the project "Campagne Q4"
      When I select the project "Campagne Q4" from the sidebar
      Then the task "Préparer l'emailing" is displayed with the status "En cours"

    Scenario: Complete a task
      Given the following tasks exist:
        | project             | title               | description | status   |
        | Refonte du site web | Valider la maquette |             | En cours |
      When I mark the task "Valider la maquette" as completed
      Then the notification "Tâche marquée comme terminée." is displayed
      And the task "Valider la maquette" is displayed with the status "Terminée"
      And the task "Valider la maquette" appears crossed out
      And the sidebar shows "1/1" for the project "Refonte du site web"

    Scenario: Reopen a completed task
      Given the following tasks exist:
        | project             | title               | description | status   |
        | Refonte du site web | Valider la maquette |             | Terminée |
      When I mark the task "Valider la maquette" as pending
      Then the notification "Tâche remise en attente." is displayed
      And the task "Valider la maquette" is displayed with the status "En cours"
      And the sidebar shows "0/1" for the project "Refonte du site web"

    Scenario: Delete a task
      Given the following tasks exist:
        | project             | title                         | description | status   |
        | Refonte du site web | Rédiger le cahier des charges |             | En cours |
        | Refonte du site web | Valider la maquette           |             | En cours |
      When I ask to delete the task "Valider la maquette"
      And I confirm the deletion
      Then a notification confirms that the task "Valider la maquette" was deleted
      And only the following tasks are displayed:
        | title                         |
        | Rédiger le cahier des charges |
      And the dashboard shows 1 task in total
