// Diplômes préparés à l'ECM. Voir src/lib/cree-assignments.ts pour la
// correspondance diplôme -> CREE référent, qui doit rester synchronisée
// avec cette liste (chaque diplôme doit y être couvert).
export const DEGREE_OPTIONS = [
  "Titre chargé de clientèle",
  "Titre de responsable de petite et moyenne structure",
  "Parcours Business",
  "Parcours Communication",
  "Parcours Comptabilité Finance",
  "Parcours Management",
  "Parcours Ressources Humaines",
  "Licence Commerce Vente Marketing",
  "Bachelor 3 Commerce",
  "Licence 3 Gestion des Organisations",
  "Bachelor 3 Responsable en Gestion d'Activité",
  "Master Commerce Vente Marketing",
  "Mastère Commerce",
  "Mastère Directeur de la Communication",
  "Mastère Expert Financier",
  "Mastère Management Stratégique",
  "Mastère Ressources Humaines",
] as const;

// Niveaux d'année. Bornés à 1-3 pour l'instant (cf. DEGREE_OPTIONS).
export const YEAR_LEVEL_OPTIONS = ["1ère année", "2ème année", "3ème année"] as const;
