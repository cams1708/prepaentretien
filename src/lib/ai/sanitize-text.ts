import "server-only";

// Deux nettoyages appliqués au texte que l'IA rédige elle-même avant
// affichage, jamais aux données recopiées telles quelles depuis un CV
// (noms propres, etc.) :
//
// 1. Caractères non-français égarés. Nos prompts système demandent
//    explicitement au modèle de rédiger exclusivement en français, mais
//    malgré ça il arrive occasionnellement qu'un mot ou fragment dans une
//    autre écriture (chinois, japonais, coréen) se glisse au milieu d'une
//    phrase par ailleurs correcte -- ex : "aiderait un recruteur à
//    visualiser直接 ton employabilité". Ce n'est pas le modèle qui
//    "choisit" de changer de langue (une consigne ne peut pas empêcher ça
//    à coup sûr), donc en plus des consignes de prompt on nettoie le texte
//    généré après coup.
//    Plages Unicode couvertes (via \u pour éviter toute ambiguïté de
//    transcription des caractères eux-mêmes) : hiragana/katakana
//    (japonais), extension A des idéogrammes CJK, idéogrammes CJK unifiés,
//    idéogrammes de compatibilité CJK, syllabes hangul (coréen), formes
//    pleine chasse.
//
// 2. Astérisques/soulignés de mise en forme Markdown ("**gras**",
//    "__gras__"). Les interfaces de chat de la plateforme affichent ce
//    texte tel quel (pas de rendu Markdown), donc ces marqueurs
//    apparaissent littéralement à l'écran au lieu d'un texte en gras --
//    on les retire simplement plutôt que d'ajouter un rendu Markdown
//    complet pour un usage aussi ponctuel.
const STRAY_SCRIPT_RE =
  /[぀-ヿ㐀-䶿一-鿿豈-﫿가-힣＀-￯]+/g;
const MARKDOWN_EMPHASIS_RE = /\*\*|__/g;

export function sanitizeAiText<T extends string | null | undefined>(text: T): T {
  if (!text) return text;

  let cleaned = text.replace(MARKDOWN_EMPHASIS_RE, "");

  STRAY_SCRIPT_RE.lastIndex = 0;
  if (STRAY_SCRIPT_RE.test(cleaned)) {
    cleaned = cleaned
      .replace(STRAY_SCRIPT_RE, " ")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .trim();

    // Pas de contenu dans le log : aucune donnée de session n'est conservée.
    console.warn("[ai] caractères non-français détectés et retirés d'un texte généré.");
  }

  return cleaned as T;
}

export function sanitizeAiTextArray(texts: string[] | undefined): string[] | undefined {
  return texts?.map((t) => sanitizeAiText(t));
}
