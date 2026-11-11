/**
 * Données initiales réalistes pour l'application TaskFlow.
 * Ces données servent de point de départ en mémoire et pourront
 * être migrées vers IndexedDB ultérieurement.
 */

export const INITIAL_PROJECTS = [
  {
    id: "proj-1",
    name: "Refonte du Site Web",
    description: "Modernisation de la vitrine digitale, optimisation du SEO et adaptation mobile responsive.",
    createdAt: "2026-10-15T09:30:00.000Z"
  },
  {
    id: "proj-2",
    name: "Lancement Marketing Q4",
    description: "Campagne d'acquisition multicanale, préparation des webinaires et partenariats stratégiques.",
    createdAt: "2026-10-22T14:15:00.000Z"
  },
  {
    id: "proj-3",
    name: "Application Mobile MVP",
    description: "Développement des fonctionnalités clés de l'application compagnon iOS et Android.",
    createdAt: "2026-11-01T11:00:00.000Z"
  }
];

export const INITIAL_TASKS = [
  {
    id: "task-101",
    projectId: "proj-1",
    title: "Concevoir les maquettes Figma de la page d'accueil",
    description: "Définir la nouvelle charte graphique, les composants réutilisables et le système typographique.",
    completed: true,
    createdAt: "2026-10-16T10:00:00.000Z",
    updatedAt: "2026-10-18T16:20:00.000Z"
  },
  {
    id: "task-102",
    projectId: "proj-1",
    title: "Intégrer les sections héros et tarification en HTML/CSS",
    description: "Respecter scrupuleusement la grille 1440px, les contrastes WCAG AA et la réactivité mobile.",
    completed: true,
    createdAt: "2026-10-19T08:45:00.000Z",
    updatedAt: "2026-10-25T11:10:00.000Z"
  },
  {
    id: "task-103",
    projectId: "proj-1",
    title: "Optimiser les temps de chargement et le score Core Web Vitals",
    description: "Compresser les images webp, différer les scripts tiers et atteindre un score supérieur à 90 sur Lighthouse.",
    completed: false,
    createdAt: "2026-10-26T13:00:00.000Z",
    updatedAt: "2026-10-26T13:00:00.000Z"
  },
  {
    id: "task-104",
    projectId: "proj-1",
    title: "Rédiger les mentions légales et la politique de confidentialité",
    description: "Conformité RGPD et validation avec l'équipe juridique.",
    completed: false,
    createdAt: "2026-10-28T09:15:00.000Z",
    updatedAt: "2026-10-28T09:15:00.000Z"
  },
  {
    id: "task-201",
    projectId: "proj-2",
    title: "Rédiger les séquences d'e-mails de bienvenue",
    description: "5 e-mails automatisés pour accompagner les nouveaux inscrits et présenter la valeur clé du produit.",
    completed: true,
    createdAt: "2026-10-23T10:30:00.000Z",
    updatedAt: "2026-10-29T17:45:00.000Z"
  },
  {
    id: "task-202",
    projectId: "proj-2",
    title: "Configurer les campagnes publicitaires LinkedIn & Google Ads",
    description: "Mise en place des audiences ciblées B2B, tests A/B de visuels et suivi des conversions.",
    completed: false,
    createdAt: "2026-10-27T15:20:00.000Z",
    updatedAt: "2026-10-27T15:20:00.000Z"
  },
  {
    id: "task-203",
    projectId: "proj-2",
    title: "Organiser le webinaire de démonstration produit",
    description: "Préparation des slides, invitation des prospects chauds et répétition technique.",
    completed: false,
    createdAt: "2026-11-02T11:00:00.000Z",
    updatedAt: "2026-11-02T11:00:00.000Z"
  },
  {
    id: "task-301",
    projectId: "proj-3",
    title: "Définir l'architecture technique offline-first",
    description: "Sélectionner la stratégie de synchronisation locale et la gestion du cache de données.",
    completed: true,
    createdAt: "2026-11-02T09:00:00.000Z",
    updatedAt: "2026-11-04T14:30:00.000Z"
  },
  {
    id: "task-302",
    projectId: "proj-3",
    title: "Implémenter l'écran d'accueil et la liste des tâches",
    description: "Composants React Native avec support du glisser-déposer et gestes tactiles fluides.",
    completed: false,
    createdAt: "2026-11-05T14:00:00.000Z",
    updatedAt: "2026-11-05T14:00:00.000Z"
  }
];
