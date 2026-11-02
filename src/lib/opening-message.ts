// Message d'ouverture du coach (identique à la Plateforme des Compétences).
// Généré côté navigateur : la session n'existe nulle part ailleurs.
export function openingMessage(firstName: string) {
  const name = firstName.trim();
  return `Salut${name ? ` ${name}` : ""} ! Je vais t'aider à te préparer pour ton entretien d'alternance.\n\nPour commencer : quel est le poste visé ? Précise si possible l'entreprise et le secteur, ça m'aidera à cibler mes questions. (Si c'est en fait pour un stage ou un emploi plutôt qu'une alternance, dis-le moi et on adapte.)`;
}
